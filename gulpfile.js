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
  'resources/lang/**/*',
  'resources/views/**/*',
  'routes/**/*',
  'storage/framework/cache/_.txt', // '_.txt' file in order to have the folder created
  'storage/framework/sessions/_.txt',
  'storage/framework/testing/_.txt',
  'storage/framework/views/_.txt',
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
  await execa('npm', ['run', 'dist'], execaOptInElectron)
}

const clean = () => del(['electron/www/**', 'electron/out'], { force:true })

exports.default = series(clean, buildLocal, cloneFolder, setEnvFile, buildLaravel, makeInstaller)