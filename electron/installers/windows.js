const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

const rootPath = path.join(__dirname, '..')
const outPath = path.join(rootPath, 'release-builds')
const outputDirectory = path.join(outPath, 'windows-installer')

function getInstallerConfig () {
  console.log('creating windows installer')
  return Promise.resolve({
    appDirectory: path.join(outPath, 'TerrHelper-win32-ia32/'),
    authors: 'osajw',
    noMsi: true,
    outputDirectory,
    loadingGif: path.join(rootPath, 'assets', 'install-spinner.gif'),
    exe: 'TerrHelper.exe',
    setupExe: 'TerrHelperInstaller.exe',
    setupIcon: path.join(rootPath, 'assets', 'icons', 'icon.ico')
  })
}

getInstallerConfig()
  .then(createWindowsInstaller)
  .then(() => console.log(`✨ Windows installer: ${outputDirectory}`))
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })