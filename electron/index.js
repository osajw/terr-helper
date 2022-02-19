const path = require('path')
const fs = require('fs')
const { app, screen, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const Store = require('electron-store')
const log = require('electron-log')

const store = new Store()
log.info(`Start - v${app.getVersion()}`)

// Create a PHP Server
const phpServer = require('node-php-server')
const port = 8123
const host = '127.0.0.1'
phpServer.createServer({
  port: port,
  hostname: host,
  base: `${__dirname}/www/public`,
  keepalive: false,
  open: false,
  bin: `${__dirname}/php/php.exe`,
  router: __dirname + '/www/server.php'
})

const imagesDir = path.join(__dirname, '/www/public/images')
const dbFile = path.join(__dirname, '/www/database/database.sqlite')
const tempDir = app.getPath('temp')
fs.mkdirSync(imagesDir, { recursive: true })

let mainWindow
const createWindow = () => {  
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width: Math.min(1200, width),
    height: Math.min(900, height),
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: `${__dirname}/preload.js`
    }
  })

  mainWindow.loadFile('index.html')
  
  mainWindow.webContents.send('version', app.getVersion())

  mainWindow.webContents.once('dom-ready', function () {
    mainWindow.show()
    mainWindow.removeMenu()
    // mainWindow.maximize()
    // mainWindow.webContents.openDevTools() // DEV ONLY
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  })

  ipcMain.on('asynchronous-message', (event, arg) => {
    if (arg === 'open-image-folder') {
      shell.openPath(imagesDir)
    }
  })
  
  ipcMain.on('window-minimize', function (event) {
    BrowserWindow.fromWebContents(event.sender).minimize();
  })
  
  ipcMain.on('window-maximize', function (event) {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.isMaximized() ? window.unmaximize() : window.maximize();
  })
  
  ipcMain.on('window-close', function (event) {
    BrowserWindow.fromWebContents(event.sender).close()
  })
  
  ipcMain.on('window-is-maximized', function (event) {
    event.returnValue = BrowserWindow.fromWebContents(event.sender).isMaximized()
  })
}

const copyData = () => {
  const randomKey = `TH-${Math.random().toString(32).slice(2, 9)}`
  const randomFolder = path.join(tempDir, randomKey)
  const imgFolder = path.join(randomFolder, 'images')
  store.set('updateKey', randomKey)
  fs.mkdirSync(imgFolder, { recursive: true })
  fs.copyFileSync(dbFile, path.join(randomFolder, 'database.sqlite'))
  fs.readdirSync(imagesDir).forEach(fileName => {
    fs.copyFileSync(path.join(imagesDir, fileName), path.join(imgFolder, fileName))
  })
}

const restorData = () => {
  const randomKey = store.get('updateKey')
  if (randomKey) {
    store.delete('updateKey')
    const randomFolder = path.join(tempDir, randomKey)
    // restore /tmp database & images:
    fs.copyFileSync(path.join(randomFolder, 'database.sqlite'), dbFile)
    const imgFolder = path.join(randomFolder, 'images')
    fs.readdirSync(imgFolder).forEach(fileName => {
      fs.copyFileSync(path.join(imgFolder, fileName), path.join(imagesDir, fileName))
    })
    // delete /tmp database & images:
    fs.rmSync(randomFolder, { recursive: true, force: true })
  }
}

autoUpdater.on('update-downloaded', (event) => {
  log.info('update-downloaded', event)

  const dialogOpts = {
    type: 'info',
    buttons: [],
    title: 'Mise à jour',
    message: event.releaseName,
    detail: 'Une nouvelle version a été téléchargée. L\'application va redémarrer pour appliquer les mises à jour.'
  }

  dialog.showMessageBox(dialogOpts).then(() => {
    copyData() // save data before update
    autoUpdater.quitAndInstall()
  })
})

app.on('ready', () => {
  restorData() // after an update restore data
  createWindow()
  autoUpdater.checkForUpdates()
})

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    log.info('Closing PHP Server...')
    phpServer.close()
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})