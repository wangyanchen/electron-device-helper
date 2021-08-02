"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
function getPrinterAdapter() {
    const path = os_1.default.platform() === 'win32'
        ? './printerWinAdapter'
        : './printerMacAdapter';
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => __importStar(require(path))).then(pkg => {
            pkg ? resolve(pkg.default) : reject('[electron-device-helper] Internal error: load PrinterAdapter failed.');
        });
    });
}
exports.getPrinterAdapter = getPrinterAdapter;
