import SerialPort from 'serialport'
import { ScalePattern } from './models/balance'
import os from 'os'
import EventEmitter from 'events'

export class Balance extends EventEmitter {
    private static instance: Balance; // 单例
    static balance: SerialPort.PortInfo; // 电子秤信息
    static debug: boolean = true;
    // static serportInstance: SerialPort; // 串口连接实例
    private static port: SerialPort; // 串口连接实例
    // static balancePattern: RegExp = /\s?-?\d{4,5}\s+\d{3,5}\s+\d{3,6}/; // 电子秤返回数据格式 pattern
    static readonly balancePatterns: ScalePattern[] = [
        { name: '大华', regexp: /\s?-?\d{4,5}\s+\d{3,5}\s+\d{3,6}/, matchRegExp: /-?\d+/ },
        { name: '富米', regexp: /^\s*-?\d{4,5}/, matchRegExp: /-?\d+/ }
        // S  0.000kgqS 
    ]
    static currentScale: ScalePattern; // 当前电子秤类型
    private _weightDataLine: string = ''; // 电子秤返回数据
    static openDelay: number = 350; // 每次 open() 的延迟时间, 直接 open 在 Windows 下会报错 access denied, 所以延迟执行
    static readonly serialPortOpt: SerialPort.OpenOptions = {
        autoOpen: false, // 自动连接
        baudRate: 9600, //波特率
        dataBits: 8, //数据位
        parity: 'none', //奇偶校验
        /**
         * 将 stop bits 改为 1, 在 Mac 上 1 或 2 都可以正常使用, windows 上只能用 1
         */
        stopBits: 1 //停止位
        // stopBits: 2 //停止位
    }

    private constructor() {
        super()
        console.log('\n\tuse Balance\n')
    }

    /**
     * 必须调用该方法获取实例
     */
    static getInstance(): Balance {
        return Balance.instance || (Balance.instance = new Balance())
    }

    /**
     * 获取电子秤
     * @param refresh 是否重新获取电子秤, 否则将从缓存中读取
     */
    async getBlances(refresh: boolean = false): Promise<SerialPort.PortInfo | undefined> {
        if (!refresh && Balance.balance) return Balance.balance
        const ports = await SerialPort.list()
        if (Balance.debug) console.log('同步检测并获取电子秤, 串口设备列表', ports, JSON.stringify(ports))
        // 同步检测并获取电子秤
        for (const port of ports) {
            const isBalance = await this._checkBalance(port)
            if (Balance.debug) console.warn('检测结果: ', isBalance)
            if (isBalance) {
                Balance.balance = port
                this.emit('get-balance', port)
                return port
            }
        }
        // 未检测到电子秤时返回 undefined
        this.emit('get-balance', undefined)
        return
    }

    /**
     * 检测是不是电子秤
     * @version 1.1.0 增加串口设备 pid & vid 检测; [fixed #4537](http://jira.93521.com/browse/WEBMER-4537)
     * @param name 串口名
     */
    private async _checkBalance(port: SerialPort.PortInfo): Promise<boolean> {
        try {
            // 在 MacOS 上忽略没有 pid 和 vid 的设备, PC 端没有蓝牙打印需求
            if (os.platform() === 'darwin' && (!port.productId || !port.vendorId)) return false
            Balance.port = new SerialPort(port.comName, Balance.serialPortOpt)
            return new Promise<boolean>((resolve, reject) => {
                Balance.port.on('data', data => {
                    // console.log('检测是不是电子秤...')
                    this._formatWeightData(data)
                })
                Balance.port.once('error', err => {
                    console.error('[Balance] error listener: ', err)
                    resolve(false)
                })
                Balance.port.once('open', () => {
                    if (Balance.debug) console.debug('[Balance] open listener: ', arguments)
                    // 避免连接成功但硬件未开启的情况
                    setTimeout(() => {
                        const rows = this._formatWeightData()
                        this.close()
                        if (Balance.debug) console.log('CLOSE ...', rows, rows[1])
                        resolve(rows.length > 1 && this._validateRowsData(rows[1]))
                    }, 1000)
                })
                Balance.port.open()
            })
        } catch (err) {
            return false
        }
    }

    /**
     * 遍历电子秤数据格式, 记录电子秤类型
     * @param row string
     */
    private _validateRowsData (row: string): boolean {
        for (const scale of Balance.balancePatterns) {
            if (scale.regexp.test(row)) {
                Balance.currentScale = scale // 记录电子秤类型
                return true
            }
        }
        return false
    }

    async open (): Promise<void> {
        if (!Balance.balance) throw new Error('balance info not exists.')
        await this.close()
        await this._openDelay()
        Balance.port = new SerialPort(Balance.balance.comName, Balance.serialPortOpt)
        Balance.port.on('open', () => this.emit('open'))
        Balance.port.on('close', () => this.emit('close'))
        Balance.port.on('data', data => this._listenData(data))
        Balance.port.on('error', (err) => this.emit('error', err))
        Balance.port.open()
    }

    close (): Promise<void> {
        return new Promise((resolve, reject) => {
            this._weightDataLine = ''
            if (Balance.port) {
                Balance.port.close(err => {
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    /**
     * 在 windows 上 open 延时执行
     * 
     * @description [see](https://github.com/node-serialport/node-serialport/issues/1379)
     */
    private async _openDelay(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (os.platform() === 'win32') {
                setTimeout(() => {
                    resolve()
                }, Balance.openDelay)
            } else {
                resolve()
            }
        })
    }

    private _listenData(data: Buffer): void {
        const rows = this._formatWeightData(data)
        if (rows.length > 2) {
            const matches = rows[rows.length - 2].match(Balance.currentScale.matchRegExp)
            // 若匹配到的重量值则触发更新事件, 否则打印该错误
            if (!matches || !Array.isArray(matches)) {
                console.error('[Balance] Internal Error: match failed')
            } else {
                this.emit('refresh', matches[0])
            }
        }
    }

    private _formatWeightData (data?: Buffer) {
        // 内部存储的重量大于指定长度时执行出队列
        if (this._weightDataLine.length > 200) this._weightDataLine = this._weightDataLine.substr(-100)
        if (data) this._weightDataLine += data.toString()
        const rows = this._weightDataLine.split('\n\r')
        return rows
    }
}
