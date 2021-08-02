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
const serialport_1 = __importDefault(require("serialport"));
const os_1 = __importDefault(require("os"));
const events_1 = __importDefault(require("events"));
class Balance extends events_1.default {
    constructor() {
        super();
        this._weightDataLine = ''; // 电子秤返回数据
        console.log('\n\tuse Balance\n');
    }
    /**
     * 必须调用该方法获取实例
     */
    static getInstance() {
        return Balance.instance || (Balance.instance = new Balance());
    }
    /**
     * 获取电子秤
     * @param refresh 是否重新获取电子秤, 否则将从缓存中读取
     */
    getBlances(refresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refresh && Balance.balance)
                return Balance.balance;
            const ports = yield serialport_1.default.list();
            if (Balance.debug)
                console.log('同步检测并获取电子秤, 串口设备列表', ports, JSON.stringify(ports));
            // 同步检测并获取电子秤
            for (const port of ports) {
                const isBalance = yield this._checkBalance(port);
                if (Balance.debug)
                    console.warn('检测结果: ', isBalance);
                if (isBalance) {
                    Balance.balance = port;
                    this.emit('get-balance', port);
                    return port;
                }
            }
            // 未检测到电子秤时返回 undefined
            this.emit('get-balance', undefined);
            return;
        });
    }
    /**
     * 检测是不是电子秤
     * @version 1.1.0 增加串口设备 pid & vid 检测; [fixed #4537](http://jira.93521.com/browse/WEBMER-4537)
     * @param name 串口名
     */
    _checkBalance(port) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 在 MacOS 上忽略没有 pid 和 vid 的设备, PC 端没有蓝牙打印需求
                if (os_1.default.platform() === 'darwin' && (!port.productId || !port.vendorId))
                    return false;
                Balance.port = new serialport_1.default(port.comName, Balance.serialPortOpt);
                return new Promise((resolve, reject) => {
                    Balance.port.on('data', data => {
                        // console.log('检测是不是电子秤...')
                        this._formatWeightData(data);
                    });
                    Balance.port.once('error', err => {
                        console.error('[Balance] error listener: ', err);
                        resolve(false);
                    });
                    Balance.port.once('open', () => {
                        if (Balance.debug)
                            console.debug('[Balance] open listener: ', arguments);
                        // 避免连接成功但硬件未开启的情况
                        setTimeout(() => {
                            const rows = this._formatWeightData();
                            this.close();
                            if (Balance.debug)
                                console.log('CLOSE ...', rows, rows[1]);
                            resolve(rows.length > 1 && this._validateRowsData(rows[1]));
                        }, 1000);
                    });
                    Balance.port.open();
                });
            }
            catch (err) {
                return false;
            }
        });
    }
    /**
     * 遍历电子秤数据格式, 记录电子秤类型
     * @param row string
     */
    _validateRowsData(row) {
        for (const scale of Balance.balancePatterns) {
            if (scale.regexp.test(row)) {
                Balance.currentScale = scale; // 记录电子秤类型
                return true;
            }
        }
        return false;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Balance.balance)
                throw new Error('balance info not exists.');
            yield this.close();
            yield this._openDelay();
            Balance.port = new serialport_1.default(Balance.balance.comName, Balance.serialPortOpt);
            Balance.port.on('open', () => this.emit('open'));
            Balance.port.on('close', () => this.emit('close'));
            Balance.port.on('data', data => this._listenData(data));
            Balance.port.on('error', (err) => this.emit('error', err));
            Balance.port.open();
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this._weightDataLine = '';
            if (Balance.port) {
                Balance.port.close(err => {
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    /**
     * 在 windows 上 open 延时执行
     *
     * @description [see](https://github.com/node-serialport/node-serialport/issues/1379)
     */
    _openDelay() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (os_1.default.platform() === 'win32') {
                    setTimeout(() => {
                        resolve();
                    }, Balance.openDelay);
                }
                else {
                    resolve();
                }
            });
        });
    }
    _listenData(data) {
        const rows = this._formatWeightData(data);
        if (rows.length > 2) {
            const matches = rows[rows.length - 2].match(Balance.currentScale.matchRegExp);
            // 若匹配到的重量值则触发更新事件, 否则打印该错误
            if (!matches || !Array.isArray(matches)) {
                console.error('[Balance] Internal Error: match failed');
            }
            else {
                this.emit('refresh', matches[0]);
            }
        }
    }
    _formatWeightData(data) {
        // 内部存储的重量大于指定长度时执行出队列
        if (this._weightDataLine.length > 200)
            this._weightDataLine = this._weightDataLine.substr(-100);
        if (data)
            this._weightDataLine += data.toString();
        const rows = this._weightDataLine.split('\n\r');
        return rows;
    }
}
Balance.debug = true;
// static balancePattern: RegExp = /\s?-?\d{4,5}\s+\d{3,5}\s+\d{3,6}/; // 电子秤返回数据格式 pattern
Balance.balancePatterns = [
    { name: '大华', regexp: /\s?-?\d{4,5}\s+\d{3,5}\s+\d{3,6}/, matchRegExp: /-?\d+/ },
    { name: '富米', regexp: /^\s*-?\d{4,5}/, matchRegExp: /-?\d+/ }
    // S  0.000kgqS 
];
Balance.openDelay = 350; // 每次 open() 的延迟时间, 直接 open 在 Windows 下会报错 access denied, 所以延迟执行
Balance.serialPortOpt = {
    autoOpen: false,
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    /**
     * 将 stop bits 改为 1, 在 Mac 上 1 或 2 都可以正常使用, windows 上只能用 1
     */
    stopBits: 1 //停止位
    // stopBits: 2 //停止位
};
exports.Balance = Balance;
