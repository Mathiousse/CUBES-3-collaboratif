FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    postgresql-client \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Configure Apache
RUN a2enmod rewrite
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html/var || true
RUN chmod +x /var/www/html/init-db.sh || true
RUN chmod +x /var/www/html/bin/console || true

EXPOSE 80

# Create startup script
RUN echo '#!/bin/bash\n\
if [ ! -d /var/www/html/vendor ]; then\n\
  echo "Installing PHP dependencies..."\n\
  cd /var/www/html && composer install --no-interaction --optimize-autoloader\n\
fi\n\
if [ ! -f /var/www/html/.db-initialized ]; then\n\
  echo "First run - initializing database..."\n\
  /var/www/html/init-db.sh\n\
  touch /var/www/html/.db-initialized\n\
fi\n\
apache2-foreground' > /usr/local/bin/start.sh && chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]

