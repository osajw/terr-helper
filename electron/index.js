const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return
}


const { app, screen, BrowserWindow, ipcMain, shell } = require('electron')

const phpServer = require('node-php-server')
const port = 8123
const host = '127.0.0.1'

let mainWindow
const createWindow = () => {
  // Create a PHP Server
  phpServer.createServer({
    port: port,
    hostname: host,
    base: `${__dirname}/www/public`,
    keepalive: false,
    open: false,
    bin: `${__dirname}/php/php.exe`,
    router: __dirname + '/www/server.php'
  })
  
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

  // mainWindow.loadURL(`http://${host}:${port}`)
  mainWindow.loadFile('index.html')

  mainWindow.webContents.once('dom-ready', function () {
    mainWindow.show()
    mainWindow.removeMenu()
    // mainWindow.maximize()
    mainWindow.webContents.openDevTools() // DEV ONLY
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    phpServer.close()
    mainWindow = null
  })

  ipcMain.on('asynchronous-message', (event, arg) => {
    if (arg === 'open-image-folder') {
      shell.openPath(`${__dirname}/www/public/images`)
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

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    // PHP SERVER QUIT
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