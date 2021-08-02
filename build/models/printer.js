"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 打印机适配器接口
 */
class Adapter {
    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(vid, pid) {
        return this.printerDirect(vid, pid, Adapter.CASHBOX_OPEN);
    }
}
/**
 * 弹钱箱指令
 *
 * @description 验证设备: 上海大华电子秤
 * @description 操作系统: Mac
 * @description 指令1(无限弹出钱箱): Buffer.from([0x1B, 0x70, 0x00, 0xFF, 0xFF])
 * @description 指令2(连续执行两次后弹出): Buffer.from([0x1B, 0x70, 0x00]); [see](https://github.com/song940/node-escpos/issues/151)
 */
Adapter.CASHBOX_OPEN = Buffer.from([0x1B, 0x70, 0x00]);
/**
 * 每次执行指令后的延迟时间
 */
Adapter.EXEC_DELAY = 200;
exports.Adapter = Adapter;
/**
 * 调用打印方法后的 result
 */
class AdapterPrintResult {
    constructor(status = AdapterPrinteResultStatus.Failed, message = '', errCode = 0, errRaw = null // 原始错误信息
    ) {
        this.status = status;
        this.message = message;
        this.errCode = errCode;
        this.errRaw = errRaw;
    }
}
exports.AdapterPrintResult = AdapterPrintResult;
/**
 * 与原项目中的 window.print_message 回调函数中的 code 保持一致
 */
var AdapterPrinteResultStatus;
(function (AdapterPrinteResultStatus) {
    AdapterPrinteResultStatus[AdapterPrinteResultStatus["Failed"] = 0] = "Failed";
    AdapterPrinteResultStatus[AdapterPrinteResultStatus["Success"] = 1] = "Success";
})(AdapterPrinteResultStatus = exports.AdapterPrinteResultStatus || (exports.AdapterPrinteResultStatus = {}));
