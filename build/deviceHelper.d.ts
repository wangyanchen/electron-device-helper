import { Option, PrintOrder, NetPrintOrder, PrinterState } from './models/windowPrinter';
import { AdapterPrinteResultStatus } from './models/printer';
export declare class DeviceHelper {
    static fetchWeightCallbackNamespace: string;
    static printCallbackNamespace: string;
    static checkPrinterDetectionNamespace: string;
    static checkNetPrinterDetectionNamespace: string;
    /**
     * 底层 API 调用状态
     *
     * @description 原项目中使用轮询方式获取打印机列表, 但底层 API 是异步的, 所以增加这个状态用来禁止多次频繁调用
     */
    static printerState: PrinterState;
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
    printerProxy(options: Option): void;
    private _otherThing;
    private _loopPrintByUsb;
    private _printByUsb;
    private _loopPrintByNet;
    private _printByNet;
    /**
     * 执行全局打印回调
     * @param opt
     * @param result
     */
    _execGlobalPrintCallback(opt: PrintOrder | NetPrintOrder, result: AdapterPrinteResultStatus): void;
    /**
     * 获取打印机列表
     *
     * @description return printer list such as `[{printlist: []}]`
     * @param options
     */
    private _getPrinterList;
    private _printSuccess;
    private _printFailure;
    private _afterPrinterMethod;
    /**
     * 获取底层打印机操作类实例
     *
     * @description `getInstance()` 被设计为静态方法 ...
     */
    private _getPrinter;
}
