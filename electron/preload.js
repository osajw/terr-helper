const { ipcRenderer } = require('electron')
const { Color, Titlebar } = require('custom-electron-titlebar')

let titlebar

window.onmessage = (e) => {
  if (e.data === 'is-top-iframe-electron') {
    return document.querySelector('iframe')
      .contentWindow.postMessage('top-iframe-is-electron', '*');
  }
  if (e.data === 'set-dark-mode') {
    return titlebar.updateBackground(Color.fromHex("#272727"))
  }
  if (e.data === 'set-light-mode') {
    return titlebar.updateBackground(Color.fromHex("#fff"))
  }
  ipcRenderer.send('asynchronous-message', e.data)
}

window.addEventListener('DOMContentLoaded', () => {
  titlebar = new Titlebar({
    backgroundColor: Color.fromHex("#fff"),
    icon: './assets/icons/icon.ico',
    titleHorizontalAlignment: 'left',
    onMinimize: () => ipcRenderer.send('window-minimize'),
    onMaximize: () => ipcRenderer.send('window-maximize'),
    onClose: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.sendSync('window-is-maximized'),
    onMenuItemClick: () => {}
  })
})