# Shilposetu (শিল্পসেতু) 🏭

**Shilposetu** is an Industrial SaaS Platform and B2B Subcontracting Marketplace designed for Bangladesh's manufacturing and industrial ecosystem. It seamlessly bridges factories, subcontracting vendors, and service providers—facilitating subcontract bidding, quotation comparison, factory directories, and tier-based SaaS subscriptions.

---

## 🚀 Tech Stack

- **Backend:** [Laravel 12 / 13](https://laravel.com) (PHP 8.3)
- **Frontend:** [React 18](https://react.dev) with [Inertia.js v2](https://inertiajs.com) & [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) & [Lucide React](https://lucide.dev)
- **Database:** [MySQL 8.0](https://www.mysql.com)
- **Cache / Sessions:** [Redis](https://redis.io) / MySQL
- **Containerization:** [Docker](https://www.docker.com) & Docker Compose
- **Web Server:** [Nginx Alpine](https://nginx.org) (reverse proxy + PHP-FPM)

---

## 🐳 Docker Container Architecture

The application is **fully containerized** with a multi-container stack configured via [`docker-compose.yml`](file:///d:/laragon/www/silposetu/docker-compose.yml):

| Service | Container Name | Image / Base | Host Port | Internal Port | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`app`** | `silposetu-app` | Custom `php:8.3-fpm` + Node 20 + Composer | `5173` | `9000`, `5173` | PHP-FPM application & Vite dev server |
| **`webserver`** | `silposetu-webserver` | `nginx:alpine` | `8000` | `80` | High-performance Nginx reverse proxy |
| **`db`** | `silposetu-db` | `mysql:8.0` | `3306` | `3306` | MySQL database with persistent volume |
| **`redis`** | `silposetu-redis` | `redis:alpine` | `6379` | `6379` | High-speed cache, sessions & queues |
| **`queue`** | `silposetu-queue` | `silposetu-app` | — | — | Background queue worker (`queue:work`) |
| **`scheduler`** | `silposetu-scheduler` | `silposetu-app` | — | — | Periodic cron runner (`schedule:work`) |
| **`phpmyadmin`** | `silposetu-phpmyadmin` | `phpmyadmin/phpmyadmin` | `8080` | `80` | Web-based database management GUI |

---

## ⚡ Quick Start with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Git.

### 1. Clone & Configure Environment
```bash
git clone https://github.com/mizanur090148/shilposetu.git
cd silposetu

# Create .env from template
cp .env.example .env
```

Ensure the database & host credentials in your `.env` match your Docker setup:
```env
APP_PORT=8000
FORWARD_DB_PORT=3306
FORWARD_REDIS_PORT=6379
PMA_PORT=8080
VITE_PORT=5173

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=silposetu
DB_USERNAME=silposetu
DB_PASSWORD=secret
DB_ROOT_PASSWORD=secret

REDIS_HOST=redis
REDIS_PORT=6379
```

### 2. Build & Start Containers
```bash
docker compose up -d --build
```
> [!NOTE]
> The initial build will install PHP 8.3 extensions (including `pdo_mysql`, `gd`, `intl`, `redis`, `opcache`), Node.js 20, and Composer.

### 3. Initialize Laravel Application
Run dependencies installation, key generation, migrations, and seeders inside the `app` container:
```bash
# 1. Install Composer dependencies
docker compose exec app composer install

# 2. Generate application encryption key
docker compose exec app php artisan key:generate

# 3. Run database migrations (with seed data)
docker compose exec app php artisan migrate --seed

# 4. Install NPM packages and build assets
docker compose exec app npm install
docker compose exec app npm run build
```

### 4. Access the Application
- 🌐 **Web Application:** [http://localhost:8000](http://localhost:8000)
- 🗄️ **phpMyAdmin Database GUI:** [http://localhost:8080](http://localhost:8080)
  - *Server:* `db`
  - *User:* `silposetu` (or `root`)
  - *Password:* `secret`
- ⚡ **Vite Dev Server (HMR):** [http://localhost:5173](http://localhost:5173)

---

## 💻 Frontend Development with Vite HMR

When developing React / TypeScript components in real-time, run the Vite development server inside the container:
```bash
docker compose exec app npm run dev
```
> [!TIP]
> The Vite config is pre-configured with `server: { host: '0.0.0.0', hmr: { host: 'localhost' }, watch: { usePolling: true } }`, guaranteeing fast hot reload across host filesystem and Docker containers.

---

## 🛠️ Everyday Docker Command Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Start all containers** | `docker compose up -d` |
| **Stop all containers** | `docker compose down` |
| **Stop and remove volumes** | `docker compose down -v` |
| **View logs (live tail)** | `docker compose logs -f` |
| **View app logs only** | `docker compose logs -f app` |
| **Run Artisan commands** | `docker compose exec app php artisan <command>` |
| **Run Migrations** | `docker compose exec app php artisan migrate` |
| **Rollback Migrations** | `docker compose exec app php artisan migrate:rollback` |
| **Seed Database** | `docker compose exec app php artisan db:seed` |
| **Open Laravel Tinker** | `docker compose exec app php artisan tinker` |
| **Run Test Suite** | `docker compose exec app php artisan test` |
| **Run Code Formatter (Pint)** | `docker compose exec app ./vendor/bin/pint` |
| **Bash into App Container** | `docker compose exec app bash` |
| **Restart Queue Worker** | `docker compose restart queue` |

---

## 💻 Alternative: Running Locally without Docker (Laragon / Native)

If you prefer running directly on your host machine (e.g. using Laragon, XAMPP, or native PHP):

1. **Prerequisites:**
   - PHP 8.3+ with `pdo_mysql`, `gd`, `intl`, `mbstring`, `zip` extensions enabled.
   - Composer 2.x
   - Node.js 20+ & npm
   - MySQL 8.0 running locally on port 3306

2. **Configuration in `.env`:**
   ```env
   APP_URL=http://localhost:8000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=silposetu
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. **Install and Run:**
   ```bash
   composer install
   php artisan key:generate
   php artisan migrate --seed
   npm install
   npm run dev
   php artisan serve
   ```

---

## 📂 Key Project Directories

```text
silposetu/
├── app/
│   ├── Http/Controllers/    # Feed, Vendor, Quotation, Subscription controllers
│   └── Models/                 # Factory, SubcontractPost, Quotation, Subscription, User
├── database/
│   ├── migrations/            # Database schema definitions
│   └── seeders/               # Factories & realistic mock dataset seeders
├── docker/
│   ├── Dockerfile             # PHP 8.3 FPM + Node 20 + Composer
│   ├── entrypoint.sh          # Permissions and bootstrap initialization
│   ├── nginx/default.conf     # Nginx reverse proxy configuration
│   └── php/local.ini          # PHP runtime settings (upload limits, opcache)
├── resources/
│   ├── js/
│   │   ├── Components/        # UI components
│   │   ├── Pages/             # Inertia.js React pages (Feed, Vendors, Dashboard, etc.)
│   │   └── app.tsx            # Main frontend entrypoint
│   └── css/app.css            # Tailwind CSS styling
├── routes/
│   ├── web.php                # Web routes (Feed, Vendors, Quotations, Subscriptions)
│   └── auth.php               # Authentication routes (Breeze)
├── docker-compose.yml         # Full multi-container composition
└── vite.config.js             # Vite + React + Docker HMR configuration
```

---

## ❓ Troubleshooting

<details>
<summary><b>1. Port 8000 or 3306 is already in use on the host machine</b></summary>

Change the mapped ports in your `.env` without modifying `docker-compose.yml`:
```env
APP_PORT=8081
FORWARD_DB_PORT=3307
PMA_PORT=8082
```
Then restart containers:
```bash
docker compose up -d
```
</details>

<details>
<summary><b>2. Storage & bootstrap cache permission errors</b></summary>

Run the following permissions fix inside the container:
```bash
docker compose exec app chown -R laravel:laravel storage bootstrap/cache
docker compose exec app chmod -R 775 storage bootstrap/cache
```
</details>

<details>
<summary><b>3. Database connection refused during first startup</b></summary>

The MySQL container initializes for a few seconds on first boot. The `docker-compose.yml` file includes a `healthcheck` on `db` to ensure `app` waits until MySQL is healthy before processing requests. If running artisan commands right away, wait 10 seconds or check status:
```bash
docker compose ps
```
</details>

---

## 📄 License

The Shilposetu platform is proprietary software. All rights reserved.
