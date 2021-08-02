import os from 'os'
import { Adapter } from './models/printer'

export function getPrinterAdapter(): Promise<Adapter> {
    const path = os.platform() === 'win32'
        ? './printerWinAdapter'
        : './printerMacAdapter'
    return new Promise((resolve, reject) => {
        import(path).then(pkg => {
            pkg ? resolve(pkg.default) : reject('[electron-device-helper] Internal error: load PrinterAdapter failed.')
        })
    })
}
