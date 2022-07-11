import { app, BrowserWindow, nativeTheme } from 'electron'
import path from 'path'
import os from 'os'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) {
}

function createWindow () {
  /**
   * Initial window options
   */
  global.mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1200,
    height: 800,
    useContentSize: true,
    webPreferences: {
      contextIsolation: false,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      nodeIntegration: true,
    }
  })

  global.mainWindow.loadURL(process.env.APP_URL).then()

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    global.mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    // global.mainWindow.webContents.on('devtools-opened', () => {
    //   global.mainWindow.webContents.closeDevTools()
    // })
  }

  global.mainWindow.on('closed', () => {
    if (global.childWindow && !global.childWindow.isDestroyed()) global.childWindow.destroy()
    global.mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (global.mainWindow === null) {
    createWindow()
  }
})

require('./help/ipcMain')
