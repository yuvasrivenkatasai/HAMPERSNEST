# HampersNest-Backend

Robust Node.js & Express RESTful API backend for the **HampersNest** luxury gifting e-commerce platform and admin management portal.

---

## 🏗️ Architecture & Tech Stack

- **Runtime & Framework**: Node.js (ES Modules) with [Express.js](https://expressjs.com/)
- **Database Engine**: [Oracle Cloud Autonomous Database](https://www.oracle.com/autonomous-database/) via mTLS Connection Wallet
- **ORM / Query Engine**: [Sequelize](https://sequelize.org/) with `oracledb` dialect
- **Cloud Storage**: [Cloudflare R2 Object Storage](https://www.cloudflare.com/developer-platform/r2/) via AWS S3 SDK for image processing and high-performance delivery
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) for watermarking, resizing, and web-optimization
- **Security & Rate Limiting**: JSON Web Tokens (JWT), Bcrypt password hashing, and Express Rate Limiter

---

## 📁 Project Structure

```text
hampersnest-backend/
├── assets/                  # Branding assets (logo, official watermarks)
├── controllers/             # Business logic controllers
│   ├── authController.js
│   ├── categoryController.js
│   ├── categoryShowcaseController.js
│   ├── dashboardController.js
│   ├── exportImportController.js
│   ├── galleryController.js
│   ├── heroBannerController.js
│   ├── inquiryController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── settingsController.js
│   └── testimonialController.js
├── database/                # Runtime database connection & models
│   ├── db.js                # Oracle Cloud Autonomous DB connection provider
│   └── models.js            # Sequelize data models
├── middleware/              # Authentication & authorization middlewares
│   └── auth.js
├── routes/                  # Express API route definitions
├── utils/                   # Shared utilities (R2 Client, Sharp Image Processor, Default Policies)
├── .env.example             # Environment configuration template
├── package.json             # Dependencies and scripts
├── server.js                # Application entry point
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Oracle Cloud and Cloudflare R2 credentials:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm start
```

---

## 📡 API Endpoints Overview

| Route Prefix | Description | Auth Required |
| :--- | :--- | :--- |
| `/api/auth` | Admin authentication, login, and token verification | Public / Protected |
| `/api/products` | Catalog browsing, filters, search, and stock management | Public (GET) / Protected (POST, PUT, DELETE) |
| `/api/categories` | Product categories & subcategory hierarchy | Public (GET) / Protected (POST, PUT, DELETE) |
| `/api/orders` | Checkout, order tracking, and status updates | Public (POST) / Protected (GET, PUT) |
| `/api/inquiries` | Custom hamper requests and corporate gifting inquiries | Public (POST) / Protected (GET) |
| `/api/dashboard` | Sales metrics, revenue analytics, and stock alerts | Protected (Admin) |
| `/api/settings` | Store configuration, pricing rules, and policies | Public (GET) / Protected (POST, PUT) |
| `/api/upload` | Cloudflare R2 media upload and image watermarking | Protected (Admin) |
| `/api/hero-banner` | Homepage banners and promotional slides | Public (GET) / Protected |
| `/api/testimonials` | Customer reviews and ratings | Public (GET) / Protected |
| `/api/category-showcase` | Homepage featured category cards | Public (GET) / Protected |

---

## 🔒 Security & Database Best Practices
- Database migrations, schema versioning, and table alterations are isolated in the dedicated [`HampersNest-Database`](https://github.com/GruhaSankalp/HampersNest-Database) repository.
- Sensitive files (`.env`, `wallet/`) are strictly git-ignored and never committed to source control.

---

## 🤖 GitHub Actions CI/CD Deployment

Automated production deployment is configured in `.github/workflows/deploy.yml`. Whenever code is pushed to `main`, GitHub Actions connects to the production server via SSH, pulls the latest code, installs dependencies, and gracefully reloads PM2 without downtime.

### Required GitHub Repository Secrets
Navigate to **GitHub Repository -> Settings -> Secrets and variables -> Actions** and add:

| Secret Name | Value Description | Example |
| :--- | :--- | :--- |
| `SERVER_HOST` | Production Server IP / Host | `140.245.235.248` |
| `SERVER_USER` | SSH Username | `ubuntu` |
| `SERVER_SSH_KEY` | Entire private SSH key content | Contents of `ssh-key-2026-06-27.key` |


