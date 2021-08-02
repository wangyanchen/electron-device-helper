# ppp
----
## 说明
---
### 类型
工具类

### 所属项目
收银软件

### 项目组人员
#### 负责人： 丁茂龙
#### 成员： 孙冲
### 主要功能

- web端
- electorn电子秤钱箱问题处理

# electron-device-helper

## links

- 主项目[文档](http://192.168.1.28:10003/#/other/build?id=%E7%BD%B2%E5%90%8D%EF%BC%8F%E6%89%93%E5%8C%85%EF%BC%8F%E5%8F%91%E5%B8%83%E4%BB%A5%E5%8F%8A%E8%87%AA%E5%8A%A8%E6%9B%B4%E6%96%B0)

## 功能
- 打印机
    - 获取 `usb打印机` 和 `网络打印机` 信息(`name`, `pid`, `vid`)
    - 发送指令
    - 弹出钱箱
- 电子秤
    - 获取电子秤信息(`name`, `pid`, `vid`)
    - 监听称重数据

## API
- [Handler](https://gogs.yunss.com/vue/electron-device-helper/src/branch/master/build/index.d.ts)
- [打印机](https://gogs.yunss.com/vue/electron-device-helper/src/branch/master/build/models/printer.d.ts)
- [电子秤](https://gogs.yunss.com/vue/electron-device-helper/src/branch/master/build/balance.d.ts)
- [电子秤 example](https://gogs.yunss.com/vue/electron-device-helper/src/branch/master/examples/balance.ts)

## Development

```bash
# use yarn or npm
yarn global add typescript ts-node
yarn
# escpos 库只能在库目录中引入类型描述文件
mv src/types/escpos.d.ts node_modules/escpos/index.d.ts
# develop
ts-node xxx.ts
# build
tsc
```

## Usage

```bash
yarn add git+ssh://git@gogs.yunss.com:vue/electron-device-helper.git
```

## 关于 `window.Printer` 实现
1. `window.Printer()`

## 系统兼容性
> 打印机功能在 `Mac` & `Windows` 下采用完全不同的底层库, 且底层库在不同的平台上互不兼容(将其设置为 `optionalDependencies` 解决这个问题), 但对外提供的 `API` 是一致的

- `Mac` 使用 `usb` & `usb-detection` & `escpos`
- `Windows` 使用 `node-escpos-addon`

## rebuild 报错解决方案

1. `rebuild` 时下载的 `nodejs` 版本与当前版本不同

**node-gyp 问题** 执行 `node-gyp rebuild` 时可能会遇到下载其他版本 `nodejs/iojs` 的情况; `/Users/test/.config/yarn/global/node_modules/node-gyp/lib/process-release.js` `/usr/local/lib/node_modules/npm/node_modules/node-gyp/lib/process-release.js` 中修改版本号判断逻辑
```javascript
function processRelease (argv, gyp, defaultVersion, defaultRelease) {
    // process.version.substr(1) 获取当前执行环境的 Nodejs 版本
    var version = (semver.valid(argv[0]) && argv[0]) || process.version.substr(1) || gyp.opts.target
    // ...
}
```

然后再执行 `node-gyp rebuild --target=v10.2.1 --verbose --dist-url=https://npm.taobao.org/mirrors/node`

2. `rebuild` 时 `module_name` / `module_path` 等未指定的问题

使用 `node-pre-gyp` 代替 `node-gyp` 解决

3. 根据当前 `electron` (开发)环境重新编译 `C++` 模块
[文档](https://electronjs.org/docs/tutorial/using-native-node-modules#%E4%B8%BA-electron-%E5%AE%89%E8%A3%85%E5%B9%B6%E9%87%8D%E6%96%B0%E7%BC%96%E8%AF%91%E6%A8%A1%E5%9D%97)

```bash
$ npm i -D electron-rebuild
$ ./node_modules/.bin/electron-rebuild -f -w electron-device-helper
```
