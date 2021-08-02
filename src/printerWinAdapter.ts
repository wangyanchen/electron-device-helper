import escpos from 'node-escpos-addon'
import { Adapter, Device, AdapterPrintResult, AdapterPrinteResultStatus } from './models/printer'

export default class PrinterWinAdapter extends Adapter {
    private static instance: PrinterWinAdapter;
    /**
     * 打印机列表
     */
    private _devices: escpos.Device[] = [];
    /**
     * 对外提供的打印机列表
     */
    get devices (): Device[] {
        return this._devices.map(d => {
            const vidMatch = d.path.match(/vid_([\d|\w]+)/) // 获取到的数值为十六进制
            const pidMatch = d.path.match(/pid_([\d|\w]+)/)
            if (!vidMatch || !pidMatch || !vidMatch[1] || !pidMatch[1]) throw new Error('[PrinterWinAdapter] path format wrong.')
            const vid = Number('0x' + vidMatch[1]) // 转为十进制 - Number('0xa3') -> 163
            const pid = Number('0x' + pidMatch[1])
            return { vid, pid, name: d.name }
        })
    }

    private constructor() {
        super()
        console.log('\n\tuse PrinterWinAdapter\n')
    }

    /**
     * 获取打印机列表
     */
    async getDevices(refresh: boolean = false): Promise<Device[]> {
        if (!refresh && this._devices.length) return this.devices
        this._devices = (escpos.GetUsbDeviceList() || [])
        console.warn('DEBIG on windows [devices]:', this.devices)
        return this.devices
    }
    
    /**
     * 必须调用该方法获取实例
     */
    static getInstance(): PrinterWinAdapter {
        return PrinterWinAdapter.instance || (PrinterWinAdapter.instance = new PrinterWinAdapter())
    }

    /**
     * 向打印机发送指令
     * @param vid 
     * @param pid 
     * @param command 
     */
    printerDirect(vid: number, pid: number, command: Buffer): Promise<AdapterPrintResult> {
        return new Promise((resolve, reject) => {
            const result = new AdapterPrintResult()
            const device = this.devices.find(d => d.vid === vid && d.pid === pid)
            if (!device) {
                result.message = '[PrinterWinAdapter] device not found, make sure this printer exists!'
                return resolve(result)
            }
            const printer = this._devices.find(d => d.name === device.name)
            console.warn('DEBIG on windows [printer]:', printer)
            if (!printer) {
                result.message = '[PrinterWinAdapter] interinal error: printer not found.'
                return resolve(result)
            }
            const {success, err} = escpos.PrintRaw(printer.path, command)
            // 每次调用完毕断开之前的连接, [issue](https://github.com/boneVidy/node-escpos-addon/issues/1#issuecomment-482052845)
            escpos.DisConnect(printer.path)
            if (!success) {
                result.errCode = err
                result.message = '[PrinterWinAdapter] ///node-escpos-addon print failed with code: ' + err
                resolve(result)
            } else {
                result.status = AdapterPrinteResultStatus.Success
                setTimeout(() => resolve(result), Adapter.EXEC_DELAY) // 延迟执行
            }
        })
    }

    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    async openCashBox(vid: number, pid: number): Promise<AdapterPrintResult> {
        let res: AdapterPrintResult = await this.printerDirect(vid, pid, Adapter.CASHBOX_OPEN)
        if (res.status === AdapterPrinteResultStatus.Failed) return res
        res = await this.printerDirect(vid, pid, Adapter.CASHBOX_OPEN)
        return res
    }
}