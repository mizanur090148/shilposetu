FROM php:8.3-fpm

# Set working directory
WORKDIR /var/www/html

# Environment arguments
ENV DEBIAN_FRONTEND=noninteractive

# Install essential system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    zip \
    unzip \
    default-mysql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions using the official extension installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    opcache \
    redis

# Install Node.js & NPM from official Node image
COPY --from=node:20-bookworm-slim /usr/local/bin /usr/local/bin
COPY --from=node:20-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules

# Install Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user to run Composer and Artisan Commands
RUN groupadd -g 1000 laravel \
    && useradd -u 1000 -ms /bin/bash -g laravel laravel

# Copy php configuration
COPY ./docker/php/local.ini /usr/local/etc/php/conf.d/local.ini

# Copy entrypoint script
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 9000 for php-fpm
EXPOSE 9000

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default command
CMD ["php-fpm"]
