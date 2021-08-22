
## Start

```
nano .env # edit all DB_... and MAIL_...
composer install
php artisan jwt:secret
php artisan migrate
```