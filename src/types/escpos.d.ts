/**
 * Type definitions for escpos 2.4.11
 * source: https://github.com/haavardlian/escpos
 * @author sven
 */
declare module 'escpos' {
    export class USB {
        constructor(vid: number, pid: number);
        open(callback: (err?: Error, self?: USB) => void): void;
        write(data: Buffer, callback: (err?: Error) => void): USB;
        close(callback?: () => void): void;
    }
    export class Printer<T> {
        constructor(device: T);
        adapter: T;
        close(callback: () => void): void;
    }
}