export interface PrintOrder {
    pid: string
    vid: string
    control: string
    tokenid?: string
    messageScope?: string
}
export function isPrintOrder(obj: any): obj is PrintOrder {
    const idPattren = /^\d+$/
    return (Reflect.has(obj, 'pid') && typeof obj.pid === 'string' && idPattren.test(obj.pid)) &&
        (Reflect.has(obj, 'vid') && typeof obj.vid === 'string' && idPattren.test(obj.vid)) &&
        (Reflect.has(obj, 'control') && typeof obj.control === 'string')
}
export interface NetPrintOrder {
    ip: string
    control: string
    tokenid?: string
}
export function isNetPrintOrder(obj: any): obj is NetPrintOrder {
    return (Reflect.has(obj, 'ip') && typeof obj.ip === 'string') &&
        (Reflect.has(obj, 'control') && typeof obj.control === 'string')
}
export interface Request {
    Printer: {
        printorder?: PrintOrder[] // USB 打印机打印
        netprintorder?: NetPrintOrder[] // 网络打印机打印
        printlist?: number // 获取打印机列表
    }
}
export function isRequest(obj: any): obj is Request {
    if (!Reflect.has(obj, 'Printer')) return false
    if (Reflect.has(obj.Printer, 'printorder') && Array.isArray(obj.Printer.printorder)) {
        for (const item of obj.Printer.printorder) {
            if (!isPrintOrder(item)) return false
        }
        return true
    } else if (Reflect.has(obj.Printer, 'netprintorder') && Array.isArray(obj.Printer.netprintorder)) {
        for (const item of obj.Printer.netprintorder) {
            if (!isNetPrintOrder(item)) return false
        }
        return true
    } else if (Reflect.has(obj.Printer, 'printlist') && typeof obj.Printer.printlist === 'number') {
        return true
    } else {
        return false
    }
}
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
    request: string | Request
    onSuccess?: (data?: string) => void
    onFailure?: (code?: string, msg?: string) => void
}
export enum PrinterState {
    On = 1, // 正在请求底层异步 API
    Off = 0 // 未请求底层异步 API
}