![Capture d'écran](https://raw.githubusercontent.com/osajw/terr-helper/main/doc/images/screenshot.png)

### Traduction: [English](README.md) | [Français](README.fr.md)

# Fonctionnalités

- Ajout de territoires
- Trie par date, nom ou territoire
- Afficher les territoires à sortir, à rentrer, sorti par untel.
- Historique des sorties / entrée, modifications et suppressions
- Exportation des territoires en PDF
- Exportation automatique de la S-13
- Importation et exportation des données avec chiffrage

# Installation
## Windows
Télécharger et exécuter [l’exécutable](https://github.com/osajw/terr-helper/releases/download/v1.1.0/Territory-Helper-Setup-1.1.0.exe).

## Serveur
```sh
nano .env # edit all DB_... and MAIL_...
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate
```

# Sécurité
Aucune donnée n’est stockée en ligne. L’application est 100% locale. Pour plus de sécurité et protéger les donnés, installer l’application sur un disque crypté (via [Veracrypt](https://www.veracrypt.fr/code/VeraCrypt/) par exemple).

# Contribution et bugs
Le projet est ouvert aux contributions (via [pull request](https://github.com/osajw/terr-helper/pulls)). Si vous rencontrez un bug vous pouvez le signaler [ici](https://github.com/osajw/terr-helper/issues).

##### Comment puis-je traduire dans une autre langue ?
Voici un exemple pour ajouter la langue anglaise :\
Créer le fichier /resources/**js**/lang/**en.js**, et écrivez vos traductions, par exemple :
```javascript
export default {
  langName: 'English',
  password: {
    label: "Password",
    enter: "Enter a password",
    ...
}
```
Créez ensuite une [pull request](https://github.com/osajw/terr-helper/pulls).