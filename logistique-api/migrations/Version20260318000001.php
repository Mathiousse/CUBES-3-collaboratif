<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260318000001 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // Add image column to menu_items if not exists
        $this->addSql('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image TEXT DEFAULT NULL');

        // Create promotions table
        $this->addSql('
            CREATE TABLE promotions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT DEFAULT NULL,
                type VARCHAR(50) NOT NULL,
                value NUMERIC(10, 2) NOT NULL,
                code VARCHAR(50) DEFAULT NULL,
                start_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                end_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                active BOOLEAN NOT NULL DEFAULT true,
                franchise_ids JSON DEFAULT NULL
            )
        ');

        // Create suppliers table
        $this->addSql('
            CREATE TABLE suppliers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) DEFAULT NULL,
                address TEXT DEFAULT NULL,
                categories JSON DEFAULT NULL,
                active BOOLEAN NOT NULL DEFAULT true
            )
        ');

        // Create franchises table
        $this->addSql('
            CREATE TABLE franchises (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                postal_code VARCHAR(10) NOT NULL,
                address TEXT NOT NULL,
                phone VARCHAR(20) DEFAULT NULL,
                manager VARCHAR(255) DEFAULT NULL,
                email VARCHAR(255) DEFAULT NULL,
                opening_hours JSON DEFAULT NULL,
                active BOOLEAN NOT NULL DEFAULT true
            )
        ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS promotions');
        $this->addSql('DROP TABLE IF EXISTS suppliers');
        $this->addSql('DROP TABLE IF EXISTS franchises');
        $this->addSql('ALTER TABLE menu_items DROP COLUMN IF EXISTS image');
    }
}
