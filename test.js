// const usbDetect = require('usb-detection')

// usbDetect.find((err, deviceList) => {
//     console.log(err, deviceList)
// })

// const Printer = require('printer')
// const util = require('util')
// const iconv = require('iconv-lite')
// const PRINTER_NAME = Printer.getDefaultPrinterName()

// // const p = new Printer(PRINTER_NAME, (err, msg) => {
// //     console.log(err, msg)
// // })

// // const list = Printer.getPrinter(PRINTER_NAME)
// const commands = []

// commands.push(Buffer.from(iconv.encode('--start--测试--', 'GBK')))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('---- line ----'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('----- end ------'))
// commands.push(Buffer.from('\x0A'))

// Printer.printDirect({
//     data: Buffer.concat(commands),
//     printer: PRINTER_NAME,
//     type: 'RAW',
//     success: jobID => {
//         var jobInfo = Printer.getJob(PRINTER_NAME, jobID)
//         console.log("current job info:" + util.inspect(jobInfo, { depth: 5, colors: true }))
//     },
//     error: err => {
//         console.log(err)
//     }
// })

// console.log('>>>>>')
// console.log(Printer.getPrinters())

// const SerialPort = require('serialport')
// const PORT_NAME = '/dev/tty.usbserial-FTAJM3ZT'
// // const PORT_NAME = '/dev/tty.Bluetooth-Incoming-Port'
// let dataLine = ''

// // SerialPort.list((err, port) => console.log(err, port))

// const opt = {
//     autoOpen: false,
//     baudRate: 9600, //波特率
//     dataBits: 8, //数据位
//     parity: 'none', //奇偶校验
//     stopBits: 2, //停止位
//     flowControl: false
// }
// const balance = new SerialPort(PORT_NAME, opt)

// // balance.on('data', data => dataLine += data)
// balance.on('data', data => console.log(data.toString()))

// balance.open(err => {
//     if (err) throw err
// })

// setTimeout(() => {
//     balance.close(err => console.log('CLOSE ERROR: ', err))
//     console.log(dataLine.split('\n\r'))
// }, 4000);


// const escpos = require('escpos')

// console.log(Object.keys(escpos))

// const usbDetect = require('usb-detection')
// const usb = require('usb')
// const escpos = require('escpos')
// const iconv = require('iconv-lite')

// const commands = []

// commands.push(Buffer.from(iconv.encode('--start--测试--', 'GBK')))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('---- line ----'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('----- end ------'))
// commands.push(Buffer.from('\x0A'))

// // usbDetect.find((err, devices) => {
// //     if (err) throw err
// //     console.log(devices)
// // })
// // const list = usb.getDeviceList()
// // console.log('usb: ', list)

// const device = new escpos.USB(1046, 20497)
// const printer = new escpos.Printer(device)
// console.log(printer)
// device.open(err => {
//     // Buffer.concat(commands)
//     printer.adapter.write(Buffer.concat(commands))
//     printer.close()
// })
// list.forEach(d => {
//     console.log(d.configDescriptor)
// })

// const { getPrinterAdapter } = require('./build/index.js')
// getPrinterAdapter().then(Printer => {
//     console.log('%c[platform test]', 'color: teal', '2. 开始测试打印机')
//     const printer = Printer.getInstance()
//     printer.getDevices().then(list => {
//         console.log('%c[platform test]', 'color: teal', 'printer list: ', list)
//         const commands = []
//         commands.push(Buffer.from('---- start ----'))
//         commands.push(Buffer.from('\x0A'))
//         commands.push(Buffer.from('\x0A'))
//         commands.push(Buffer.from('\x0A'))
//         commands.push(Buffer.from('_______ end _______'))
//         commands.push(Buffer.from('\x0A'))
//         printer.printerDirect(1046, 20497, Buffer.concat(commands))
//     })
// })

// const fun = () => {
//     return new Promise((resolve, reject) => {
//         if (Date.now()) {
//             return resolve(123)
//         }
//         console.log('end')
//     })
// }

// fun().then(res => console.log('res: ', res))

// const net = require('net')

// const s = new net.Socket()

// s.once('error', err => console.log('err: ', err))
//     .on('timeout', (...args) => console.log('timeout: ', ...args))
//     .setTimeout(1000)
//     .once('connect', (...args) => console.log('connect: ', ...args))
//     .connect(9100, '192.168.1.204')

// const fs = require('fs')
// const iconv = require('iconv-lite')

// const commands = []

// commands.push(Buffer.from(iconv.encode('--start--测试--', 'GBK')))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('---- line ----'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('\x0A'))
// commands.push(Buffer.from('----- end ------'))
// commands.push(Buffer.from('\x0A'))

// // Buffer.concat(commands)

// fs.writeFile('./direct', Buffer.concat(commands), {}, err => console.log(err))

const usb = require('usb')
const usbDetect = require('usb-detection')

usbDetect.find((err, list) => {
    console.log(err, list)
})

console.log(usb.getDeviceList())