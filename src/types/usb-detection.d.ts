/**
 * Type definitions for usb-detection 4.1.0
 * source: https://github.com/MadLittleMods/node-usb-detection
 * @author sven
 */
declare module 'usb-detection' {
    /**
     * 设备信息
     */
    export class Device {
        readonly locationId: number;
        readonly vendorId: number;
        readonly productId: number;
        readonly deviceName: string;
        readonly manufacturer: string;
        readonly serialNumber: string;
        readonly deviceAddress: number;
    }
    export function find(cb: (err: Error, devices: Device[]) => void): void; 
    export function startMonitoring(): void; 
    export function stopMonitoring(): void; 
}