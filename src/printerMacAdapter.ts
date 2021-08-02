import { Adapter, Device, AdapterPrintResult, AdapterPrinteResultStatus } from './models/printer'
import * as usb from 'usb'
import * as usbDetect from 'usb-detection'
import { USB, Printer as EscposPrinter } from 'escpos'
// import NodePrinter from 'printer'

interface PrinterDevice {
    [name: string]: usb.Device;
}

export default class PrinterMacAdapter extends Adapter {
    private static instance: PrinterMacAdapter
    static usbDetectMointoring: boolean = false // 是否正在获取打印机列表, 在调用 `getDevices()` 时为 `true`, 在 `usbDetect.stopMonitoring()` 时会判断该值
    static readonly GET_DEVICE_TIMEOUT: number = 10000 // `stopMointoring()` 执行间隔
    /**
     * 打印机列表
     */
    private _devices: PrinterDevice = {};
    /**
     * 对外提供的打印机列表
     */
    get devices(): Device[] {
        const list: Device[] = []
        for (const d in this._devices) {
            list.push({
                name: d,
                vid: this._devices[d].deviceDescriptor.idVendor,
                pid: this._devices[d].deviceDescriptor.idProduct,
            })
        }
        return list
    }
    /**
     * USB Class Codes
     * @docs http://www.usb.org/developers/defined_class
     */
    static readonly IFACE_CLASS = {
        AUDIO: 0x01,
        HID: 0x03,
        PRINTER: 0x07,
        HUB: 0x09
    }

    private constructor() {
        super()
        // console.log('\n\tuse PrinterMacAdapter\n')
    }

    /**
     * 获取打印机列表(use usb-detection)
     * 
     * @description 通过 usb 和 usb-detection 获取 USB 打印机
     * @description usb 仅能获取 vid & pid; usb-detection 可以获取到设备名称
     * @param refresh 是否不使用缓存的打印机列表重新获取打印机列表
     */
    async getDevices(refresh: boolean = false): Promise<Device[]> {
        if (!refresh && Object.keys(this._devices).length) return this.devices
        this._mointoring()
        return new Promise<Device[]>((resolve, reject) => {
            usbDetect.find((err, devices) => {
                if (err) reject(err)
                const printerList: PrinterDevice = {} // 设备列表
                const usbList = usb.getDeviceList()
                // 通过 usb 和 usb-detection 获取 USB 打印机
                for (const d of usbList) {
                    let name = '' // 设备名称
                    let isPrinter = false // 当前遍历的设备是否是打印机且在 usb-detection 获取的 list 中
                    try {
                        for (const _d of devices) {
                            if (d.deviceDescriptor && d.deviceDescriptor.idVendor && d.deviceDescriptor.idProduct && _d.vendorId && _d.productId
                                && d.deviceDescriptor.idVendor === _d.vendorId && d.deviceDescriptor.idProduct === _d.productId) {
                                name = _d.deviceName
                                isPrinter = true
                                break
                            }
                        }
                        if (!isPrinter) continue
                        // 判断设备类型
                        isPrinter = d.configDescriptor.interfaces.filter(iface => {
                            return iface.filter(conf => {
                                // console.log('iface', conf.bInterfaceClass, PrinterMacAdapter.IFACE_CLASS.PRINTER)
                                return conf.bInterfaceClass === PrinterMacAdapter.IFACE_CLASS.PRINTER
                            }).length > 0
                        }).length > 0
                    } catch (error) {
                        if (process.env.NODE_ENV === 'dev') console.log('[Printer]<getDevice()> error: ', error)
                    }
                    if (isPrinter) {
                        printerList[name] = d
                    }
                }
                this._devices = printerList
                this._stopMointoring()
                resolve(this.devices)
            })
        })
    }

    private _mointoring () {
        PrinterMacAdapter.usbDetectMointoring = true
        usbDetect.startMonitoring()
    }

    private _stopMointoring () {
        const t = Date.now()
        PrinterMacAdapter.usbDetectMointoring = false
        // 每个 getDevices 调用结束 10s 后 stopMointoring()
        setTimeout(() => {
            // 如果此时正在执行 `getDevice()` 则忽略
            if (PrinterMacAdapter.usbDetectMointoring) return false
            usbDetect.stopMonitoring()
        }, PrinterMacAdapter.GET_DEVICE_TIMEOUT)
    }

    /**
     * 必须调用该方法获取实例
     * 
     * @example 示例
     *  const finder = Printer.getInstance();
     *  Printer.getDevices().then(list => console.log(list))
     */
    static getInstance(): PrinterMacAdapter {
        return PrinterMacAdapter.instance || (PrinterMacAdapter.instance = new PrinterMacAdapter())
    }

    /**
     * 向打印机发送指令
     * @param printerName 打印机名称
     * @param command 指令
     */
    printerDirect(vid: number, pid: number, command: Buffer): Promise<AdapterPrintResult> {
        return new Promise((resolve, reject) => {
            const result = new AdapterPrintResult()
            // use escpos module
            const device: USB = new USB(vid, pid)
            const printer = new EscposPrinter(device)
            device.open(err => {
                if (err) {
                    result.message = err.message
                    result.errRaw = err
                    resolve(result)
                    return
                }
                console.warn(`\n[PrinterMacAdapter] printerDirect(): open printer device ...\n`)
                // 执行 ESCPOS 指令
                printer.adapter.write(command, err => {
                    console.warn(`\n[PrinterMacAdapter] printerDirect(): write command ...\n`)
                    if (err) {
                        console.error(`\n[PrinterMacAdapter] printerDirect(): write failed!\n`, err)
                        result.message = (err && err.message) || 'write failed !!!'
                        result.errRaw = err
                        resolve(result)
                        return
                    }
                    console.warn(`\n[PrinterMacAdapter] printerDirect(): close device transfer ...\n`)
                    device.close()

                    // 因出现 printer 无法关闭的情况, 所以放弃 printer.close, 改为上面的直接 close device
                    // printer.close(() => {
                    //     console.log('打印机连接关闭成功 .....')
                    // })

                    result.status = AdapterPrinteResultStatus.Success
                    setTimeout(() => resolve(result), Adapter.EXEC_DELAY)
                })
            })
        })
    }

    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(vid: number, pid: number): Promise<AdapterPrintResult> {
        return new Promise((resolve, reject) => {
            const result = new AdapterPrintResult()
            this._onceOpenCashBox(vid, pid) // first exec
                .then(() => {
                    this._onceOpenCashBox(vid, pid) // second exec
                        .then(() => {
                            result.status = AdapterPrinteResultStatus.Success
                            resolve(result) // success
                        })
                })
                .catch(err => {
                    result.message = err.message
                    resolve(result) // failed
                })
        })
    }

    /**
     * 单次执行开钱箱指令
     * @param vid 
     * @param pid 
     */
    private _onceOpenCashBox(vid: number, pid: number): Promise<Error | void> {
        return new Promise((resolve, reject) => {
            const device: USB = new USB(vid, pid)
            const printer = new EscposPrinter(device)
            device.open(err => {
                if (err) reject(err)
                printer.cashdraw(2).close()
                setTimeout(resolve, Adapter.EXEC_DELAY) // 每次执行后加入延迟 see https://github.com/tessel/node-usb/issues/254
            })
        })
    }

    // /**
    //  * 开钱箱
    //  * @param vid number
    //  * @param pid number
    //  */
    // openCashBox(vid: number, pid: number): Promise<AdapterPrintResult> {
    //     return this.printerDirect(vid, pid, this.CASHBOX_OPEN)
    //         .then(res => {
    //             if (res.status === AdapterPrinteResultStatus.Success) {
    //                 return this.printerDirect(vid, pid, this.CASHBOX_OPEN)
    //             }
    //             return res
    //         })
    // }

    private _getDeviceById(vid: number, pid: number): usb.Device {
        for (const name in this._devices) {
            if (this._devices[name].deviceDescriptor.idProduct === pid && this._devices[name].deviceDescriptor.idVendor === vid) return this._devices[name]
        }
        throw new Error('[Printer] device not exists ...')
    }
}
