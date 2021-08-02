/**
 * Type definitions for printer 0.2.2
 * source: https://github.com/tojocky/node-printer
 * @description 仅做简单类型描述, 具体请参照源码及官方 README
 * @author sven
 */
declare module 'printer' {
    /**
     * 打印机设备信息
     */
    export class PrinterDevice {
        readonly name: string;
        readonly isDefault: boolean;
        readonly status: string;
        readonly options: {
            'device-uri': string;
            finishings: string,
            'job-cancel-after': string,
            'job-hold-until': string,
            'job-priority': string,
            'job-sheets': string,
            'marker-change-time': Date,
            'number-up': string,
            'printer-commands': string,
            'printer-info': string,
            'printer-is-accepting-jobs': string,
            'printer-is-shared': string,
            'printer-location': string,
            'printer-make-and-model': string,
            'printer-state': string,
            'printer-state-change-time': Date,
            'printer-state-reasons': string,
            'printer-type': string,
            'printer-uri-supported': string
        }
    }
    /**
     * 调用打印指令的参数结构
     */
    interface DirectParams {
        data: Buffer;
        printer: string;
        type: string;
        success: (jobID: string) => void;
        error: (err: Error) => void;
    }
    /**
     * 获取打印机列表
     */
    export function getPrinters(): PrinterDevice[];
    /**
     * 获取打印机
     */
    export function getPrinter(): PrinterDevice;
    /**
     * 向打印机发送指令
     * @param params 打印指令参数
     */
    export function printDirect(params: DirectParams): void;
}
