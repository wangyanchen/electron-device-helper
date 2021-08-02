"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPrintOrder(obj) {
    const idPattren = /^\d+$/;
    return (Reflect.has(obj, 'pid') && typeof obj.pid === 'string' && idPattren.test(obj.pid)) &&
        (Reflect.has(obj, 'vid') && typeof obj.vid === 'string' && idPattren.test(obj.vid)) &&
        (Reflect.has(obj, 'control') && typeof obj.control === 'string');
}
exports.isPrintOrder = isPrintOrder;
function isNetPrintOrder(obj) {
    return (Reflect.has(obj, 'ip') && typeof obj.ip === 'string') &&
        (Reflect.has(obj, 'control') && typeof obj.control === 'string');
}
exports.isNetPrintOrder = isNetPrintOrder;
function isRequest(obj) {
    if (!Reflect.has(obj, 'Printer'))
        return false;
    if (Reflect.has(obj.Printer, 'printorder') && Array.isArray(obj.Printer.printorder)) {
        for (const item of obj.Printer.printorder) {
            if (!isPrintOrder(item))
                return false;
        }
        return true;
    }
    else if (Reflect.has(obj.Printer, 'netprintorder') && Array.isArray(obj.Printer.netprintorder)) {
        for (const item of obj.Printer.netprintorder) {
            if (!isNetPrintOrder(item))
                return false;
        }
        return true;
    }
    else if (Reflect.has(obj.Printer, 'printlist') && typeof obj.Printer.printlist === 'number') {
        return true;
    }
    else {
        return false;
    }
}
exports.isRequest = isRequest;
var PrinterState;
(function (PrinterState) {
    PrinterState[PrinterState["On"] = 1] = "On";
    PrinterState[PrinterState["Off"] = 0] = "Off"; // 未请求底层异步 API
})(PrinterState = exports.PrinterState || (exports.PrinterState = {}));
