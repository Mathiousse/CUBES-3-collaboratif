#!/bin/bash

if [ ! -d /var/www/html/vendor ]; then
  echo "Installing PHP dependencies..."
  cd /var/www/html && composer install --no-interaction --optimize-autoloader --no-scripts
  composer dump-autoload --optimize || true
fi

echo "Preparing var directories..."
mkdir -p /var/www/html/var/cache /var/www/html/var/log
rm -rf /var/www/html/var/cache/*
chown -R www-data:www-data /var/www/html/var

echo "Updating database schema..."
/var/www/html/init-db.sh

echo "Fixing permissions after init..."
rm -rf /var/www/html/var/cache/*
chown -R www-data:www-data /var/www/html/var
chmod -R 777 /var/www/html/var

echo "Starting Apache..."
exec apache2-foreground
