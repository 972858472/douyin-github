import sqlite from './sqlite';
import {ipcMain} from 'electron';
import IpcApi from './ipcApi';
import {IpcFail} from './common';


import {autoUpdater} from 'electron-updater'

global.DB = sqlite

ipcMain.on('DouYin', function (event, ...args) {
  const method = args[0]
  if (IpcApi.hasOwnProperty(method)) {
    args.splice(0, 1)
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      IpcApi[method](event, args)
    } catch (e: any) {
      event.returnValue = IpcFail('执行异常：' + e.message)
    }
  } else {
    console.log('no found method:', method)
    event.returnValue = IpcFail('no found method:' + method)
  }
})

const log = require('electron-log')
log.transports.file.level = 'debug'
autoUpdater.logger = log
autoUpdater.checkForUpdatesAndNotify().then()



