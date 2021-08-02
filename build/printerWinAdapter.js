"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_escpos_addon_1 = __importDefault(require("node-escpos-addon"));
const printer_1 = require("./models/printer");
class PrinterWinAdapter extends printer_1.Adapter {
    constructor() {
        super();
        /**
         * 打印机列表
         */
        this._devices = [];
        console.log('\n\tuse PrinterWinAdapter\n');
    }
    /**
     * 对外提供的打印机列表
     */
    get devices() {
        return this._devices.map(d => {
            const vidMatch = d.path.match(/vid_([\d|\w]+)/); // 获取到的数值为十六进制
            const pidMatch = d.path.match(/pid_([\d|\w]+)/);
            if (!vidMatch || !pidMatch || !vidMatch[1] || !pidMatch[1])
                throw new Error('[PrinterWinAdapter] path format wrong.');
            const vid = Number('0x' + vidMatch[1]); // 转为十进制 - Number('0xa3') -> 163
            const pid = Number('0x' + pidMatch[1]);
            return { vid, pid, name: d.name };
        });
    }
    /**
     * 获取打印机列表
     */
    getDevices(refresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refresh && this._devices.length)
                return this.devices;
            this._devices = (node_escpos_addon_1.default.GetUsbDeviceList() || []);
            console.warn('DEBIG on windows [devices]:', this.devices);
            return this.devices;
        });
    }
    /**
     * 必须调用该方法获取实例
     */
    static getInstance() {
        return PrinterWinAdapter.instance || (PrinterWinAdapter.instance = new PrinterWinAdapter());
    }
    /**
     * 向打印机发送指令
     * @param vid
     * @param pid
     * @param command
     */
    printerDirect(vid, pid, command) {
        return new Promise((resolve, reject) => {
            const result = new printer_1.AdapterPrintResult();
            const device = this.devices.find(d => d.vid === vid && d.pid === pid);
            if (!device) {
                result.message = '[PrinterWinAdapter] device not found, make sure this printer exists!';
                return resolve(result);
            }
            const printer = this._devices.find(d => d.name === device.name);
            console.warn('DEBIG on windows [printer]:', printer);
            if (!printer) {
                result.message = '[PrinterWinAdapter] interinal error: printer not found.';
                return resolve(result);
            }
            const { success, err } = node_escpos_addon_1.default.PrintRaw(printer.path, command);
            // 每次调用完毕断开之前的连接, [issue](https://github.com/boneVidy/node-escpos-addon/issues/1#issuecomment-482052845)
            node_escpos_addon_1.default.DisConnect(printer.path);
            if (!success) {
                result.errCode = err;
                result.message = '[PrinterWinAdapter] ///node-escpos-addon print failed with code: ' + err;
                resolve(result);
            }
            else {
                result.status = printer_1.AdapterPrinteResultStatus.Success;
                setTimeout(() => resolve(result), printer_1.Adapter.EXEC_DELAY); // 延迟执行
            }
        });
    }
    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(vid, pid) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.printerDirect(vid, pid, printer_1.Adapter.CASHBOX_OPEN);
            if (res.status === printer_1.AdapterPrinteResultStatus.Failed)
                return res;
            res = yield this.printerDirect(vid, pid, printer_1.Adapter.CASHBOX_OPEN);
            return res;
        });
    }
}
exports.default = PrinterWinAdapter;
