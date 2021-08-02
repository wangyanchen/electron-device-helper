import net from 'net'
import EventEmitter from 'events'
import { Adapter } from './models/printer'

export enum NetworkState {
    AVAILABLE, // 可以使用, 没有未结束的任务
    CONNECTING, // 正在连接 socket
    CONNECTED // 连接成功
}

let state: NetworkState = NetworkState.AVAILABLE

export class NetworkPrinter extends EventEmitter {
    /**
     * socket 连接超时时间
     */
    static readonly CONNECT_TIMEOUT = 2000
    /**
     * 弹钱箱指令
     */
    static readonly CASHBOX_OPEN: Buffer = Adapter.CASHBOX_OPEN
    /**
     * 每次执行指令后的延迟时间
     */
    static readonly EXEC_DELAY: number = Adapter.EXEC_DELAY
    private static instance: NetworkPrinter
    private _socket: net.Socket
    private _timeoutHosts: string | null = null

    /**
     * 当前状态, 不考虑并行执行场景
     */
    static get state () {
        return state
    }

    private constructor() {
        super()
        this._socket = new net.Socket()
    }

    /**
     * 必须调用该方法获取实例
     */
    static getInstance(): NetworkPrinter {
        return NetworkPrinter.instance || (NetworkPrinter.instance = new NetworkPrinter())
    }

    open(host: string, port: number = 9100): void {
        state = NetworkState.CONNECTING // 状态修改为连接中
        this.destroy(true)
        this._socket
            .setTimeout(NetworkPrinter.CONNECT_TIMEOUT)
            .once('timeout', () => {
                // 仅在第一次连接时报错
                // if (!isConnected && (this._timeoutHosts === null || this._timeoutHosts !== host))
                if (state === NetworkState.CONNECTING) this.emit('error', new Error('connect timeout !'))
                this.destroy()
                this._timeoutHosts = host
            })
            .once('error', err => {
                this.destroy()
                this.emit('error', err)
            })
            .once('connect', () => {
                state = NetworkState.CONNECTED // 状态修改为连接成功
                this.emit('connect')
            })
            .connect(port, host)
    }

    destroy(isInit?: boolean): void {
        console.log('DEBUG-3: destory')
        try {
            this._socket.destroy()
            if (!isInit) state = NetworkState.AVAILABLE // 状态修改为可用
            this.emit('destory')
        } catch (err) {
            console.error('[NetworkPrinter] destory failed !')
        }
    }

    /**
     * 向打印机发送指令
     * @param command 指令
     */
    printerDirect(command: Buffer): Promise<void> {
        if (this._socket.destroyed) throw new Error('[NetworkPrinter] connect is destroyed !')
        return new Promise((resolve, reject) => {
            console.log('DEBUG-2: 执行 command: ', command)
            this._socket.write(command, () => {
                console.log('[NetworkPrinter] network printer write success!')
                resolve()
                this.destroy()
            })
        })
    }

    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(): Promise<void> {
        return this.printerDirect(Adapter.CASHBOX_OPEN)
    }
}
