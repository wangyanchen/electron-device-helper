/// <reference types="node" />
/**
 * 打印机适配器接口
 */
export declare abstract class Adapter {
    /**
     * 弹钱箱指令
     *
     * @description 验证设备: 上海大华电子秤
     * @description 操作系统: Mac
     * @description 指令1(无限弹出钱箱): Buffer.from([0x1B, 0x70, 0x00, 0xFF, 0xFF])
     * @description 指令2(连续执行两次后弹出): Buffer.from([0x1B, 0x70, 0x00]); [see](https://github.com/song940/node-escpos/issues/151)
     */
    static readonly CASHBOX_OPEN: Buffer;
    /**
     * 每次执行指令后的延迟时间
     */
    static readonly EXEC_DELAY: number;
    abstract devices: Device[];
    abstract getDevices(refresh: boolean): Promise<Device[]>;
    /**
     * 执行指令
     *
     * @description 执行指令, 每次调用都会加入延迟机制: `Adapter.EXEC_DELAY`
     * @param vid
     * @param pid
     * @param command
     */
    abstract printerDirect(vid: number, pid: number, command: Buffer): Promise<AdapterPrintResult>;
    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(vid: number, pid: number): Promise<AdapterPrintResult>;
}
/**
 * 打印机数据结构
 */
export interface Device {
    vid: number;
    pid: number;
    name: string;
}
/**
 * 调用打印方法后的 result
 */
export declare class AdapterPrintResult {
    status: AdapterPrinteResultStatus;
    message: string;
    errCode: number;
    errRaw: any;
    constructor(status?: AdapterPrinteResultStatus, message?: string, errCode?: number, errRaw?: any);
}
/**
 * 与原项目中的 window.print_message 回调函数中的 code 保持一致
 */
export declare enum AdapterPrinteResultStatus {
    Failed = 0,
    Success = 1
}
