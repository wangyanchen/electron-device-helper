"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var usb = require("usb");
var usbDetect = require("usb-detection");
// import NodePrinter from 'printer'
var IFACE_CLASS = {
    AUDIO: 0x01,
    HID: 0x03,
    PRINTER: 0x07,
    HUB: 0x09
};
var Printer = /** @class */ (function () {
    function Printer() {
    }
    /**
     * 获取打印机列表
     *
     * @description 通过 usb 和 usb-detection 获取 USB 打印机
     * @description usb 仅能获取 vid & pid; usb-detection 可以获取到设备名称
     * @param refresh 是否不使用缓存的打印机列表重新获取打印机列表
     */
    Printer.prototype.getDevices = function (refresh) {
        if (refresh === void 0) { refresh = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!refresh && Printer.devices)
                    return [2 /*return*/, Printer.devices];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        usbDetect.find(function (err, devices) {
                            if (err)
                                reject(err);
                            // 通过 usb 和 usb-detection 获取 USB 打印机
                            var name = ''; // 设备名称
                            var printerList = {}; // 设备列表
                            var usbList = usb.getDeviceList();
                            for (var _i = 0, usbList_1 = usbList; _i < usbList_1.length; _i++) {
                                var d = usbList_1[_i];
                                var isPrinter = false; // 当前遍历的设备是否是打印机且在 usb-detection 获取的 list 中
                                try {
                                    for (var _a = 0, devices_1 = devices; _a < devices_1.length; _a++) {
                                        var _d = devices_1[_a];
                                        if (d.deviceDescriptor && d.deviceDescriptor.idVendor && d.deviceDescriptor.iProduct && _d.vendorId && _d.productId
                                            && d.deviceDescriptor.idVendor === _d.vendorId && d.deviceDescriptor.iProduct === _d.productId) {
                                            name = _d.deviceName;
                                            isPrinter = true;
                                            break;
                                        }
                                    }
                                    return isPrinter && d.configDescriptor.interfaces.filter(function (iface) {
                                        return iface.filter(function (conf) {
                                            return conf.bInterfaceClass === Printer.IFACE_CLASS.PRINTER;
                                        }).length;
                                    }).length;
                                }
                                catch (error) {
                                    if (process.env.NODE_ENV === 'dev')
                                        console.log('[Printer]<getDevice()> error: ', error);
                                }
                                if (isPrinter) {
                                    printerList[name] = d;
                                }
                            }
                            Printer.devices = printerList;
                            resolve(Printer.devices);
                        });
                    })];
            });
        });
    };
    /**
     * 必须调用该方法获取实例
     *
     * @example 示例
     *  const finder = Printer.getInstance();
     *  Printer.getDevices().then(list => console.log(list))
     */
    Printer.getInstance = function () {
        return Printer.instance || (Printer.instance = new Printer());
    };
    /**
     * USB Class Codes
     * @docs http://www.usb.org/developers/defined_class
    */
    Printer.IFACE_CLASS = {
        AUDIO: 0x01,
        HID: 0x03,
        PRINTER: 0x07,
        HUB: 0x09
    };
    return Printer;
}());
exports.Printer = Printer;
