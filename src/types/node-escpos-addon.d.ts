/**
 * Type definitions for escpos 2.4.11
 * source: https://github.com/haavardlian/escpos
 * @author sven
 */
declare module 'node-escpos-addon' {
    /**
     * 打印设备数据结构
     * 
     * @description such as {"path":"\\\\?\\usb#vid_0416&pid_5011#5&212ac8fc&0&6#{a5dcbf10-6530-11d2-901f-00c04fb951ed}","name":"USB Thermal Printer","desc":"USB 打印支持","service":"usbprint"}
     */
    interface Device {
        path: string
        name: string
        desc: string
        service: string | 'usbprint' | 'usbccgp' | 'libusb0' | 'winusb' | 'Unknown'
    }
    export type DeviceType = 'USB' | 'LPT' | 'COM'
    export function GetUsbDeviceList(): Device[]
    export function PrintRaw(path: Device['path'], command: Buffer): { success: boolean, err: number } // err is c/c++ GetLastError()'s result
    export function GetUsbDeviceList(): Device[]
    export function GetLptDeviceList(): Device[]
    export function GetComDeviceList(): Device[]
    export function DisConnect(path: string): boolean
}
