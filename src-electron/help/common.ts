/**
 * 获取执行脚本的字符串
 */
import {IpcRes, PageData} from './type';

export const getExecuteStr = (jsPath: string) => {
  const fs = require('fs')
  const readFile = fs.readFileSync(jsPath)
  return readFile.toString()
};

/**
 * 获取公共目录
 */
export const getPublicPath = () => require('path').resolve(__dirname, process.env.QUASAR_PUBLIC_FOLDER)

export const IpcSuccess = (data: PageData | string | boolean | any, msg = 'success', code = 0): IpcRes => {
  return {
    code: code,
    data: data,
    msg: msg
  }
}

export const IpcFail = (msg: string, data = '', code = 1): IpcRes => {
  return {
    code: code,
    data: data,
    msg: msg
  }
}
