/// <reference types="node" />
import { Adapter, Device, AdapterPrintResult } from './models/printer';
export default class PrinterWinAdapter extends Adapter {
    private static instance;
    /**
     * 打印机列表
     */
    private _devices;
    /**
     * 对外提供的打印机列表
     */
    readonly devices: Device[];
    private constructor();
    /**
     * 获取打印机列表
     */
    getDevices(refresh?: boolean): Promise<Device[]>;
    /**
     * 必须调用该方法获取实例
     */
    static getInstance(): PrinterWinAdapter;
    /**
     * 向打印机发送指令
     * @param vid
     * @param pid
     * @param command
     */
    printerDirect(vid: number, pid: number, command: Buffer): Promise<AdapterPrintResult>;
    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(vid: number, pid: number): Promise<AdapterPrintResult>;
}
