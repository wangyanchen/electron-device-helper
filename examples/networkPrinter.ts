import { NetworkPrinter } from '../src/networkPrinter'
import iconv from 'iconv-lite'

const np = NetworkPrinter.getInstance()
np.on('connect', () => {
    const commands = []
    commands.push(Buffer.from(iconv.encode('--start--测试--', 'GBK')))
    commands.push(Buffer.from('\x0A'))
    commands.push(Buffer.from('---- line ----'))
    commands.push(Buffer.from('\x0A'))
    commands.push(Buffer.from('\x0A'))
    commands.push(Buffer.from('\x0A'))
    commands.push(Buffer.from('----- end ------'))
    commands.push(Buffer.from('\x0A'))
    np.printerDirect(Buffer.concat(commands))
})
np.on('error', err => {
    console.log('[NetworkPrinter] connect failed !')
    throw err
})
np.open('192.168.1.204')