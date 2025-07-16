FROM php:8.1-apache

# Install PHP extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy seluruh project ke /var/www/html
COPY . /var/www/html/

# Optional permission fix
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
