const { src, dest, series } = require('gulp')
const rename = require('gulp-rename')
const execa = require('execa')
const del = require('del')
const fs = require('fs')

const stdio = 'inherit'
const execaOptInLaravel = { stdio, cwd: './electron/www/' }
const execaOptInElectron = { stdio, cwd: './electron/' }

const buildLocal = () => execa('npm', ['run', 'prod'], { stdio })

const cloneFolder = () => src([
  'app/**/*',
  'bootstrap/**/*',
  'config/**/*',
  'database/**/*',
  '!database/database.sqlite',
  'public/**/*',
  '!public/images/*',
  'resources/**/*',
  '!resources/js',
  'routes/**/*',
  'storage/**/*',
  '!storage/framework/cache/*',
  '!storage/framework/sessions/*',
  '!storage/framework/testing',
  '!storage/framework/views/*',
  '!storage/.gitignore',
  '!storage/app',
  'artisan',
  'composer.json',
  'composer.lock',
  'package.json',
  'server.php'
], { base: './' }).pipe(dest('electron/www/'))

const setEnvFile = () => src('.env.electron')
  .pipe(rename('.env'))
  .pipe(dest('electron/www/'))

const buildLaravel = async () => {
  await execa('composer', ['install', '--optimize-autoloader', '--no-dev'], execaOptInLaravel)
  await execa('php', ['artisan', 'key:generate', '--force'], execaOptInLaravel)
  await execa('php', ['artisan', 'jwt:secret', '--force'], execaOptInLaravel)
  fs.writeFileSync(`${__dirname}/electron/www/database/database.sqlite`, '')
  await execa('php', ['artisan', 'migrate', '--force'], execaOptInLaravel)
}

const makeInstaller = async () => {
  await execa('npm', ['install'], execaOptInElectron)
  await execa('node', ['node_modules/electron-packager/bin/electron-packager.js', '.', 'TerrHelper', '--overwrite', '--platform=win32', '--arch=ia32', '--icon=assets/icons/icon.ico', '--prune=true', '--out=release-builds', '--version-string.CompanyName=CE', '--version-string.FileDescription=CE', '--version-string.ProductName="Territory', 'Helper"'], execaOptInElectron)
  await execa('node', ['installers/windows.js'], execaOptInElectron)
}

const clean = () => del('electron/www/**', { force:true })

exports.default = series(clean, buildLocal, cloneFolder, setEnvFile, buildLaravel, makeInstaller)