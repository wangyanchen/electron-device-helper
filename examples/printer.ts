import { Printer } from '../src/printer'

console.log('%c[platform test]', 'color: teal', '2. 开始测试打印机')
const printer = Printer.getInstance()
printer.getDevices().then(list => {
    console.log('%c[platform test]', 'color: teal', 'printer list: ', list)
    const commands = []
    commands.push(Buffer.from('---- start ----'))
    commands.push(Buffer.from('\x0A'))
    commands.push(Buffer.from('\x0A'))
    commands.push(Buffer.from('\x0A'))
    commands.push(Buffer.from('----- end ------'))
    commands.push(Buffer.from('\x0A'))
    printer.printerDirect(1046, 20497, Buffer.concat(commands))
})