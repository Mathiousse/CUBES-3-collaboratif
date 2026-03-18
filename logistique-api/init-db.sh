#!/bin/bash

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h logistique-db -U logistics_user; do
  sleep 1
done

echo "Updating database schema..."
php bin/console doctrine:schema:update --force --no-interaction

echo "Seeding database..."
php bin/console app:seed-database

echo "Database initialized successfully!"
