export interface PrintOrder {
    pid: string;
    vid: string;
    control: string;
    tokenid?: string;
    messageScope?: string;
}
export declare function isPrintOrder(obj: any): obj is PrintOrder;
export interface NetPrintOrder {
    ip: string;
    control: string;
    tokenid?: string;
}
export declare function isNetPrintOrder(obj: any): obj is NetPrintOrder;
export interface Request {
    Printer: {
        printorder?: PrintOrder[];
        netprintorder?: NetPrintOrder[];
        printlist?: number;
    };
}
export declare function isRequest(obj: any): obj is Request;
export interface Option {
    /**
     * request param
     *
     * @description request => 'WindowTest.KeyBoard,1' 键盘最小化
     * @description request => 'WindowTest.KeyBoard,2' 键盘全键盘
     * @description request => 'WindowTest.KeyBoard,3' 数字键盘1
     * @description request => 'WindowTest.KeyBoard,1001'
     * @description request => 'WindowTest.KeyBoard,1002' 关闭键盘
     * @description request => 'WindowTest.OpenURL,${url}' open this URL use browser
     * @description request => 'WindowTest.ForceUpdate'
     * @description request => 'WindowTest.Maximize' 窗口最大化
     * @description request => 'WindowTest.Position,${position}' 调整窗口
     * @description request => 'WindowTest.Store,${optionsJson}' 保存窗口位置信息 ???
     * @description request => 'WindowTest.ALLScreen' 全屏
     * @description request => 'WindowTest.Minimize' 最小化
     * @description request => 'WindowTest.Restore' 恢复窗口
     * @description request => 'WindowTest.Close' 关闭窗口
     */
    request: string | Request;
    onSuccess?: (data?: string) => void;
    onFailure?: (code?: string, msg?: string) => void;
}
export declare enum PrinterState {
    On = 1,
    Off = 0
}
