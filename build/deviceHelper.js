"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const windowPrinter_1 = require("./models/windowPrinter");
const printer_1 = require("./printer");
const networkPrinter_1 = require("./networkPrinter");
const printer_2 = require("./models/printer");
const helper_1 = require("./helper");
class DeviceHelper {
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
    printerProxy(options) {
        console.log('this: ', this);
        if (windowPrinter_1.isRequest(options.request)) {
            if (DeviceHelper.printerState === windowPrinter_1.PrinterState.On) {
                console.log('认定为频繁请求, 拦截该请求');
                return;
            }
            if (options.request.Printer.printorder) { // USB 打印机
                this._loopPrintByUsb(options.request.Printer.printorder, options);
            }
            else if (options.request.Printer.netprintorder) { // 网络打印机
                this._loopPrintByNet(options.request.Printer.netprintorder, options);
            }
            else if (options.request.Printer.printlist) { // 打印机列表
                DeviceHelper.printerState = windowPrinter_1.PrinterState.On;
                this._getPrinterList(options)
                    .catch(err => this._printFailure(err.message, options))
                    .finally(this._afterPrinterMethod);
            }
            else {
                throw new Error('[DeviceHelper] you must set print options');
            }
        }
        else if (typeof options.request === 'string') {
            this._otherThing(options.request);
        }
    }
    _otherThing(request) {
        console.log('_otherThing: ', request);
    }
    _loopPrintByUsb(printList, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const item of printList) {
                    yield this._printByUsb(item, options);
                }
            }
            catch (err) {
                console.log('指令执行失败 -2');
                this._printFailure(err.message, options);
            }
            finally {
                this._afterPrinterMethod();
            }
        });
    }
    _printByUsb(opt, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const printer = yield this._getPrinter();
            console.log('使用 USB 打印机打印 ...', opt);
            const result = yield printer.printerDirect(Number(opt.vid), Number(opt.pid), Buffer.from(opt.control, 'base64'));
            if (result.status === printer_2.AdapterPrinteResultStatus.Success) {
                console.log('指令执行成功 ...');
                this._printSuccess(result.message, options);
            }
            else {
                console.log('指令执行失败 ...', result, options);
                this._printFailure(result.message, options);
            }
            this._execGlobalPrintCallback(opt, result.status);
        });
    }
    _loopPrintByNet(printList, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const item of printList) {
                    yield this._printByNet(item, options);
                    yield helper_1.sleep(Math.floor(networkPrinter_1.NetworkPrinter.CONNECT_TIMEOUT * 1.5));
                }
            }
            catch (err) {
                this._printFailure(err.message, options);
            }
            finally {
                this._afterPrinterMethod();
            }
        });
    }
    _printByNet(opt, options) {
        const np = networkPrinter_1.NetworkPrinter.getInstance();
        console.log('使用网络打印机打印 ...', opt, networkPrinter_1.NetworkState[networkPrinter_1.NetworkPrinter.state]);
        return new Promise((resolve, reject) => {
            if (networkPrinter_1.NetworkPrinter.state !== networkPrinter_1.NetworkState.AVAILABLE) {
                // np.once('destory', reject)
                console.log('网络打印机调用失败: 可能有未完成的打印任务, state is ' + networkPrinter_1.NetworkState[networkPrinter_1.NetworkPrinter.state]);
                resolve();
                return false;
            }
            np.removeAllListeners()
                .once('connect', () => {
                console.log('DEBUG-1: 传入 command: ', opt.control, opt);
                np.printerDirect(Buffer.from(opt.control, 'base64'))
                    .then(() => {
                    this._printSuccess('', options);
                    this._execGlobalPrintCallback(opt, printer_2.AdapterPrinteResultStatus.Success);
                })
                    .catch(err => {
                    this._printFailure('', options);
                    np.emit('error', err);
                    // this._execGlobalPrintCallback(opt, AdapterPrinteResultStatus.Failed)
                });
            })
                .once('error', err => {
                console.error(err);
                this._execGlobalPrintCallback(opt, printer_2.AdapterPrinteResultStatus.Failed);
                // throw err
            })
                .open(opt.ip);
        });
    }
    /**
     * 执行全局打印回调
     * @param opt
     * @param result
     */
    _execGlobalPrintCallback(opt, result) {
        // callback method such as `(tokenid, msg, str, code): void`
        // code: 1: 成功 0: 失败
        if (typeof window[DeviceHelper.printCallbackNamespace] === 'function') {
            window[DeviceHelper.printCallbackNamespace](opt.tokenid || '', '', '', result);
        }
    }
    /**
     * 获取打印机列表
     *
     * @description return printer list such as `[{printlist: []}]`
     * @param options
     */
    _getPrinterList(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const printer = yield this._getPrinter();
            const list = yield printer.getDevices(true);
            console.log('list: ', list);
            this._printSuccess(JSON.stringify([{ printlist: list }]), options);
        });
    }
    _printSuccess(params, options) {
        if (typeof options.onSuccess === 'function')
            options.onSuccess(params);
    }
    _printFailure(params, options) {
        if (typeof options.onFailure === 'function')
            options.onFailure(params);
    }
    _afterPrinterMethod() {
        console.log('finally ???');
        DeviceHelper.printerState = windowPrinter_1.PrinterState.Off;
    }
    /**
     * 获取底层打印机操作类实例
     *
     * @description `getInstance()` 被设计为静态方法 ...
     */
    _getPrinter() {
        return __awaiter(this, void 0, void 0, function* () {
            const Printer = yield printer_1.getPrinterAdapter();
            const printer = Printer.getInstance();
            yield printer.getDevices(true);
            return printer;
        });
    }
}
DeviceHelper.fetchWeightCallbackNamespace = 'RecevieWeigh'; // 称重回调函数
DeviceHelper.printCallbackNamespace = 'print_message'; // 打印成功后的回调函数 name - `window[name]()`
DeviceHelper.checkPrinterDetectionNamespace = 'check_print'; // 检测打印机插拔状态的函数 name
DeviceHelper.checkNetPrinterDetectionNamespace = 'check_netprint'; // 检测网络打印机插拔状态的函数 name
/**
 * 底层 API 调用状态
 *
 * @description 原项目中使用轮询方式获取打印机列表, 但底层 API 是异步的, 所以增加这个状态用来禁止多次频繁调用
 */
DeviceHelper.printerState = windowPrinter_1.PrinterState.Off;
exports.DeviceHelper = DeviceHelper;
