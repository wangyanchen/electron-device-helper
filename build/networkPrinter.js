"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const events_1 = __importDefault(require("events"));
const printer_1 = require("./models/printer");
var NetworkState;
(function (NetworkState) {
    NetworkState[NetworkState["AVAILABLE"] = 0] = "AVAILABLE";
    NetworkState[NetworkState["CONNECTING"] = 1] = "CONNECTING";
    NetworkState[NetworkState["CONNECTED"] = 2] = "CONNECTED"; // 连接成功
})(NetworkState = exports.NetworkState || (exports.NetworkState = {}));
let state = NetworkState.AVAILABLE;
class NetworkPrinter extends events_1.default {
    constructor() {
        super();
        this._timeoutHosts = null;
        this._socket = new net_1.default.Socket();
    }
    /**
     * 当前状态, 不考虑并行执行场景
     */
    static get state() {
        return state;
    }
    /**
     * 必须调用该方法获取实例
     */
    static getInstance() {
        return NetworkPrinter.instance || (NetworkPrinter.instance = new NetworkPrinter());
    }
    open(host, port = 9100) {
        state = NetworkState.CONNECTING; // 状态修改为连接中
        this.destroy(true);
        this._socket
            .setTimeout(NetworkPrinter.CONNECT_TIMEOUT)
            .once('timeout', () => {
            // 仅在第一次连接时报错
            // if (!isConnected && (this._timeoutHosts === null || this._timeoutHosts !== host))
            if (state === NetworkState.CONNECTING)
                this.emit('error', new Error('connect timeout !'));
            this.destroy();
            this._timeoutHosts = host;
        })
            .once('error', err => {
            this.destroy();
            this.emit('error', err);
        })
            .once('connect', () => {
            state = NetworkState.CONNECTED; // 状态修改为连接成功
            this.emit('connect');
        })
            .connect(port, host);
    }
    destroy(isInit) {
        console.log('DEBUG-3: destory');
        try {
            this._socket.destroy();
            if (!isInit)
                state = NetworkState.AVAILABLE; // 状态修改为可用
            this.emit('destory');
        }
        catch (err) {
            console.error('[NetworkPrinter] destory failed !');
        }
    }
    /**
     * 向打印机发送指令
     * @param command 指令
     */
    printerDirect(command) {
        if (this._socket.destroyed)
            throw new Error('[NetworkPrinter] connect is destroyed !');
        return new Promise((resolve, reject) => {
            console.log('DEBUG-2: 执行 command: ', command);
            this._socket.write(command, () => {
                console.log('[NetworkPrinter] network printer write success!');
                resolve();
                this.destroy();
            });
        });
    }
    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox() {
        return this.printerDirect(printer_1.Adapter.CASHBOX_OPEN);
    }
}
/**
 * socket 连接超时时间
 */
NetworkPrinter.CONNECT_TIMEOUT = 2000;
/**
 * 弹钱箱指令
 */
NetworkPrinter.CASHBOX_OPEN = printer_1.Adapter.CASHBOX_OPEN;
/**
 * 每次执行指令后的延迟时间
 */
NetworkPrinter.EXEC_DELAY = printer_1.Adapter.EXEC_DELAY;
exports.NetworkPrinter = NetworkPrinter;
