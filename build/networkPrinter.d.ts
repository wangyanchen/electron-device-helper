/// <reference types="node" />
import EventEmitter from 'events';
export declare enum NetworkState {
    AVAILABLE = 0,
    CONNECTING = 1,
    CONNECTED = 2
}
export declare class NetworkPrinter extends EventEmitter {
    /**
     * socket 连接超时时间
     */
    static readonly CONNECT_TIMEOUT = 2000;
    /**
     * 弹钱箱指令
     */
    static readonly CASHBOX_OPEN: Buffer;
    /**
     * 每次执行指令后的延迟时间
     */
    static readonly EXEC_DELAY: number;
    private static instance;
    private _socket;
    private _timeoutHosts;
    /**
     * 当前状态, 不考虑并行执行场景
     */
    static readonly state: NetworkState;
    private constructor();
    /**
     * 必须调用该方法获取实例
     */
    static getInstance(): NetworkPrinter;
    open(host: string, port?: number): void;
    destroy(isInit?: boolean): void;
    /**
     * 向打印机发送指令
     * @param command 指令
     */
    printerDirect(command: Buffer): Promise<void>;
    /**
     * 开钱箱
     * @param vid number
     * @param pid number
     */
    openCashBox(): Promise<void>;
}
