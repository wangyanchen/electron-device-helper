/// <reference types="node" />
import SerialPort from 'serialport';
import { ScalePattern } from './models/balance';
import EventEmitter from 'events';
export declare class Balance extends EventEmitter {
    private static instance;
    static balance: SerialPort.PortInfo;
    static debug: boolean;
    private static port;
    static readonly balancePatterns: ScalePattern[];
    static currentScale: ScalePattern;
    private _weightDataLine;
    static openDelay: number;
    static readonly serialPortOpt: SerialPort.OpenOptions;
    private constructor();
    /**
     * 必须调用该方法获取实例
     */
    static getInstance(): Balance;
    /**
     * 获取电子秤
     * @param refresh 是否重新获取电子秤, 否则将从缓存中读取
     */
    getBlances(refresh?: boolean): Promise<SerialPort.PortInfo | undefined>;
    /**
     * 检测是不是电子秤
     * @version 1.1.0 增加串口设备 pid & vid 检测; [fixed #4537](http://jira.93521.com/browse/WEBMER-4537)
     * @param name 串口名
     */
    private _checkBalance;
    /**
     * 遍历电子秤数据格式, 记录电子秤类型
     * @param row string
     */
    private _validateRowsData;
    open(): Promise<void>;
    close(): Promise<void>;
    /**
     * 在 windows 上 open 延时执行
     *
     * @description [see](https://github.com/node-serialport/node-serialport/issues/1379)
     */
    private _openDelay;
    private _listenData;
    private _formatWeightData;
}
