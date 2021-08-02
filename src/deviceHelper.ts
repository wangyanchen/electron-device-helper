import { Option, PrintOrder, NetPrintOrder, PrinterState, isRequest } from './models/windowPrinter'
import { getPrinterAdapter } from './printer'
import { NetworkPrinter, NetworkState } from './networkPrinter'
import { Adapter, AdapterPrinteResultStatus } from './models/printer'
import { sleep } from './helper'

export class DeviceHelper {
    static fetchWeightCallbackNamespace: string = 'RecevieWeigh' // 称重回调函数
    static printCallbackNamespace: string = 'print_message' // 打印成功后的回调函数 name - `window[name]()`
    static checkPrinterDetectionNamespace: string = 'check_print' // 检测打印机插拔状态的函数 name
    static checkNetPrinterDetectionNamespace: string = 'check_netprint' // 检测网络打印机插拔状态的函数 name

    /**
     * 底层 API 调用状态
     * 
     * @description 原项目中使用轮询方式获取打印机列表, 但底层 API 是异步的, 所以增加这个状态用来禁止多次频繁调用
     */
    static printerState: PrinterState = PrinterState.Off

    /**
     * 实现 `window.Printer()` 函数
     * 
     * @example
     * ```javascript
     * const deviceHelper = new DeviceHelper()
     * 
     * window.Printer = function (option) {
     *     const _opt = _.cloneDeep(option)
     *     try {
     *         if (typeof _opt.request === 'string') _opt.request = JSON.parse(_opt.request)
     *     } catch (err) {}
     *     // ...
     *     deviceHelper.printerProxy.call(this, _opt)
     * }
     * ```
     * @description 在主项目中调用, 实现与原有 API 结构一致的代理方法, [see](http://192.168.1.28:10003/#/other/build?id=%E9%99%841-%E8%BF%81%E7%A7%BB%E8%87%B3-electron-%E7%8E%AF%E5%A2%83)
     * @param window window 对象
     */
    printerProxy(options: Option): void {
        console.log('this: ', this)
        if (isRequest(options.request)) {
            if (DeviceHelper.printerState === PrinterState.On) {
                console.log('认定为频繁请求, 拦截该请求')
                return
            }
            if (options.request.Printer.printorder) { // USB 打印机
                this._loopPrintByUsb(options.request.Printer.printorder, options)
            } else if (options.request.Printer.netprintorder) { // 网络打印机
                this._loopPrintByNet(options.request.Printer.netprintorder, options)
            } else if (options.request.Printer.printlist) { // 打印机列表
                DeviceHelper.printerState = PrinterState.On
                this._getPrinterList(options)
                    .catch(err => this._printFailure(err.message, options))
                    .finally(this._afterPrinterMethod)
            } else {
                throw new Error('[DeviceHelper] you must set print options')
            }
        } else if (typeof options.request === 'string') {
            this._otherThing(<string> options.request)
        }
    }
    private _otherThing(request: string) {
        console.log('_otherThing: ', request)
    }
    private async _loopPrintByUsb(printList: PrintOrder[], options: Option): Promise<void> {
        try {
            for (const item of printList) {
                await this._printByUsb(item, options)
            }
        } catch (err) {
            console.log('指令执行失败 -2')
            this._printFailure(err.message, options)
        } finally {
            this._afterPrinterMethod()
        }
    }
    private async _printByUsb(opt: PrintOrder, options: Option) {
        const printer = await this._getPrinter()
        console.log('使用 USB 打印机打印 ...', opt)
        const result = await printer.printerDirect(Number(opt.vid), Number(opt.pid), Buffer.from(opt.control, 'base64'))
        if (result.status === AdapterPrinteResultStatus.Success) {
            console.log('指令执行成功 ...')
            this._printSuccess(result.message, options)
        } else {
            console.log('指令执行失败 ...', result, options)
            this._printFailure(result.message, options)
        }
        this._execGlobalPrintCallback(opt, result.status)
    }
    private async _loopPrintByNet(printList: NetPrintOrder[], options: Option): Promise<void> {
        try {
            for (const item of printList) {
                await this._printByNet(item, options)
                await sleep(Math.floor(NetworkPrinter.CONNECT_TIMEOUT * 1.5))
            }
        } catch (err) {
            this._printFailure(err.message, options)
        } finally {
            this._afterPrinterMethod()
        }
    }
    private _printByNet(opt: NetPrintOrder, options: Option): Promise<void> {
        const np = NetworkPrinter.getInstance()
        console.log('使用网络打印机打印 ...', opt, NetworkState[NetworkPrinter.state])
        return new Promise((resolve, reject) => {
            if (NetworkPrinter.state !== NetworkState.AVAILABLE) {
                // np.once('destory', reject)
                console.log('网络打印机调用失败: 可能有未完成的打印任务, state is ' + NetworkState[NetworkPrinter.state])
                resolve()
                return false
            }
            np.removeAllListeners()
                .once('connect', () => {
                    console.log('DEBUG-1: 传入 command: ', opt.control, opt)
                    np.printerDirect(Buffer.from(opt.control, 'base64'))
                        .then(() => {
                            this._printSuccess('', options)
                            this._execGlobalPrintCallback(opt, AdapterPrinteResultStatus.Success)
                        })
                        .catch(err => {
                            this._printFailure('', options)
                            np.emit('error', err)
                            // this._execGlobalPrintCallback(opt, AdapterPrinteResultStatus.Failed)
                        })
                })
                .once('error', err => {
                    console.error(err)
                    this._execGlobalPrintCallback(opt, AdapterPrinteResultStatus.Failed)
                    // throw err
                })
                .open(opt.ip)
        })
    }
    /**
     * 执行全局打印回调
     * @param opt 
     * @param result 
     */
    _execGlobalPrintCallback(opt: PrintOrder | NetPrintOrder, result: AdapterPrinteResultStatus):void {
        // callback method such as `(tokenid, msg, str, code): void`
        // code: 1: 成功 0: 失败
        if (typeof (<any>window)[DeviceHelper.printCallbackNamespace] === 'function') {
            (<any>window)[DeviceHelper.printCallbackNamespace](opt.tokenid || '', '', '', result)
        }
    }
    /**
     * 获取打印机列表
     * 
     * @description return printer list such as `[{printlist: []}]`
     * @param options
     */
    private async _getPrinterList(options: Option): Promise<void> {
        const printer = await this._getPrinter()
        const list = await printer.getDevices(true)
        console.log('list: ', list)
        this._printSuccess(JSON.stringify([{printlist: list}]), options)
    }
    private _printSuccess(params: string, options: Option) {
        if (typeof options.onSuccess === 'function') options.onSuccess(params)
    }
    private _printFailure(params: string, options: Option) {
        if (typeof options.onFailure === 'function') options.onFailure(params)
    }
    private _afterPrinterMethod(): void {
        console.log('finally ???')
        DeviceHelper.printerState = PrinterState.Off
    }
    /**
     * 获取底层打印机操作类实例
     * 
     * @description `getInstance()` 被设计为静态方法 ...
     */
    private async _getPrinter (): Promise<Adapter> {
        const Printer = await getPrinterAdapter()
        const printer = Printer.getInstance()
        await printer.getDevices(true)
        return <Adapter>printer
    }
}
