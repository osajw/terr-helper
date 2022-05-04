![Capture d'écran](https://raw.githubusercontent.com/osajw/terr-helper/main/doc/images/screenshot.png)

### Translation: [English](README.md) | [Français](README.fr.md)
# Features

- Add territories
- Sort by date, name or territory
- Display the territories to exit, to enter, exited by ...
- History of exits / entries, modifications and deletions
- Export of territories in PDF
- Automatic export of the S-13
- Import and export data with encryption

# Installation
## Windows
Download and run [the executable](https://github.com/osajw/terr-helper/releases/download/v1.1.1/Territory-Helper-Setup-1.1.1.exe).

## Server
```sh
nano .env # edit all DB_... and MAIL_...
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate
```

# Security
No data is stored online. The application is 100% local. For more security and data protection, install the application on an encrypted disk (via [Veracrypt](https://www.veracrypt.fr/code/VeraCrypt/) for example).

# Contribution and bugs
The project is open to contributions (via [pull request](https://github.com/osajw/terr-helper/pulls)). If you encounter a bug you can report it [here](https://github.com/osajw/terr-helper/issues).

##### How can I translate into another language?
Here is an example to add the English language:\
Create the file /resources/**js**/lang/**en.js**, and write your translations, for example:
```javascript
export default {
  langName: 'English',
  password: {
    label: "Password",
    enter: "Enter a password",
    ...
}
```
Next create a [pull request](https://github.com/osajw/terr-helper/pulls).