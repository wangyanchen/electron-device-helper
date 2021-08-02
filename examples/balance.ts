import { Balance } from '../src/balance'

const serialPort = Balance.getInstance()
serialPort.on('get-balance', b => {
    console.log('<balance> get-balance')
    serialPort.on('open', () => {
        console.log('<balance> open')
        setTimeout(() => serialPort.close(), 5000)
    })
    serialPort.on('refresh', weight => console.log('<balance> weight: ' + weight))
    serialPort.open()
})
console.log('%c[platform test]', 'color: teal', '1. 开始测试电子秤')
serialPort.getBlances()
console.log('_______________________________________')