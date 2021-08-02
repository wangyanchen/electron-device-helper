/// <reference types="node" />
import { Adapter, Device, AdapterPrintResult } from './models/printer';
export default class PrinterMacAdapter extends Adapter {
    private static instance;
    static usbDetectMointoring: boolean;
    static readonly GET_DEVICE_TIMEOUT: number;
    /**
     * 打印机列表
     */
    private _devices;
    /**
     * 对外提供的打印机列表
     */
    readonly devices: Device[];
    /**
     * USB Class Codes
     * @docs http://www.usb.org/developers/defined_class
     */
    static readonly IFACE_CLASS: {
        AUDIO: number;
        HID: number;
        PRINTER: number;
        HUB: number;
    };
    private constructor();
    /**
     * 获取打印机列表(use usb-detection)
     *
     * @description 通过 usb 和 usb-detection 获取 USB 打印机
     * @description usb 仅能获取 vid & pid; usb-detection 可以获取到设备名称
     * @param refresh 是否不使用缓存的打印机列表重新获取打印机列表
     */
    getDevices(refresh?: boolean): Promise<Device[]>;
    private _mointoring;
    private _stopMointoring;
    /**
     * 必须调用该方法获取实例
     *
     * @example 示例
     *  const finder = Printer.getInstance();
     *  Printer.getDevices().then(list => console.log(list))
     */
    static getInstance(): PrinterMacAdapter;
    /**
     * 向打印机发送指令
     * @param printerName 打印机名称
     * @param command 指令
     */
    printerDirect(vid: number, pid: number, command: Buffer): Promise<AdapterPrintResult>;
    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(vid: number, pid: number): Promise<AdapterPrintResult>;
    /**
     * 单次执行开钱箱指令
     * @param vid
     * @param pid
     */
    private _onceOpenCashBox;
    private _getDeviceById;
}
