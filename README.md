# 🌸 Fleuria Handmade — Secure Admin Panel & API Architecture

A dedicated, secure Admin Panel and REST API backend designed for **Fleuria Handmade** ([Live Storefront](https://fleuria-handmade-lac.vercel.app/)).

The admin panel allows the business owner to manage products, categories, stock, orders, custom bespoke briefs, reviews, store settings, and website content dynamically without opening code editors or editing source code.

---

## 🏛️ Architecture & Directory Structure

```
fleuria-admin-panel/
├── admin/                     # Admin Frontend (React + Vite + Modern Floral Design System)
│   ├── src/
│   │   ├── components/        # Sidebar, Header, ProductModal, ConfirmModal, ImageUploader
│   │   ├── context/           # AuthContext (JWT session), ToastContext
│   │   ├── pages/             # Dashboard, Products, Categories, Orders, Custom Orders,
│   │   │                      # Reviews, Website Content (CMS), Store Settings, Profile
│   │   ├── utils/             # API client, Currency & Date formatters
│   │   └── index.css          # Luxury floral design system matching Fleuria branding
│   ├── package.json
│   └── vite.config.js         # Configured with proxy to backend
│
├── server/                    # Backend REST API Server (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── db/                # SQLite connection (WAL mode) & Seeder (fleuria.db)
│   │   ├── middleware/        # JWT Authentication, Multer file upload
│   │   ├── routes/            # Auth, Dashboard, Products, Categories, Orders,
│   │   │                      # Custom Orders, Reviews, Settings, Content, Public API
│   │   └── server.js          # Express app entrypoint, CORS, static uploads
│   ├── uploads/               # Storage directory for uploaded product & banner images
│   ├── test_system.js         # Automated 18-step end-to-end integration test
│   ├── .env                   # Environment variables (port, JWT secret, admin defaults)
│   └── package.json
│
├── client/                    # Customer-Facing Website (Fleuria Handmade)
│   ├── index.html             # Customer storefront with dynamic categories & CMS content
│   └── assets/
│       ├── css/style.css      # Fleuria design system
│       ├── js/
│       │   ├── config.js      # Live store configuration sync with Admin API
│       │   ├── products.js    # Live catalog & categories sync with Admin API
│       │   ├── cart.js        # WhatsApp order generator & background order recorder
│       │   └── app.js         # Storefront rendering & bespoke commission request sync
│       └── images/            # Original handcrafted bouquets & candle photography
│
└── package.json               # Root scripts to orchestrate servers & preview
```

---

## 🔑 Default Administrator Credentials

| Field | Value |
|---|---|
| **Login URL** | `http://localhost:5173/` |
| **Email** | `admin@fleuriahandmade.com` |
| **Password** | `admin12345` |

*(Can be updated at any time from the **Admin Profile** page inside the dashboard)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Install Dependencies
```bash
# In server directory
cd server
npm install

# In admin directory
cd ../admin
npm install
```

### 2. Run Backend API Server
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```
*The server will automatically initialize `fleuria.db` and seed all default categories, products, orders, reviews, settings, and content on first boot.*

### 3. Run Admin Dashboard
```bash
cd admin
npm run dev
# Admin UI starts at http://localhost:5173
```

### 4. View Public Storefront
Open `http://localhost:5000/client/` in your browser. Any change made in the Admin Panel (e.g. changing product price, adding new blooms, changing shipping fee, or updating WhatsApp number) will immediately reflect on this storefront.

---

## 🧪 Automated End-to-End Testing

To run the complete automated integration test suite that verifies the full flow (**Admin Panel ⇄ Database ⇄ Public Storefront**):

```bash
cd server
node test_system.js
```

### What this test validates:
1. Server health check
2. Admin authentication & JWT token generation
3. Dashboard statistics calculation
4. Admin product creation
5. Immediate visibility of new product on the public storefront
6. Admin price change (e.g., 5500 DA → 6200 DA)
7. Immediate price update on the public storefront
8. Disabling a product and verifying it disappears from the active public catalog
9. Customer WhatsApp checkout order placement on the website
10. Automatic receipt of order in the Admin Panel Orders pipeline
11. Order status update workflow ("New" → "Preparing")
12. Customer bespoke custom order commission submission on the website
13. Automatic receipt of commission request in Admin Custom Orders
14. Updating store settings (WhatsApp number, free shipping threshold) and verifying immediate storefront sync

---

## 📡 REST API Reference

### Public API (Used by Public Storefront)
- `GET /api/public/config` — Store configuration (WhatsApp number, currency, shipping rules)
- `GET /api/public/categories` — Active collections
- `GET /api/public/products` — Active product catalog (supports `?category=`, `?search=`, `?tag=`)
- `GET /api/public/products/:id` — Single product details
- `GET /api/public/reviews` — Approved customer testimonials
- `GET /api/public/content` — CMS website content (hero, about, care guide, footer)
- `POST /api/public/orders` — Record customer WhatsApp orders in the database
- `POST /api/public/custom-orders` — Record bespoke commission briefs in the database

### Admin API (Protected by Bearer JWT Token)
- `POST /api/auth/login` — Authenticate admin
- `GET /api/auth/me` — Current session
- `PUT /api/auth/profile` — Update admin name and email
- `PUT /api/auth/password` — Change admin password
- `GET /api/admin/dashboard/stats` — Metrics, charts, revenue, and recent activities
- `GET /api/admin/products` — List products with filters & pagination
- `POST /api/admin/products` — Create new product
- `PUT /api/admin/products/:id` — Update product details
- `PATCH /api/admin/products/:id/toggle` — Fast toggle active/featured/bestseller/sale
- `PATCH /api/admin/products/:id/stock` — Adjust inventory quantities
- `DELETE /api/admin/products/:id` — Remove product
- `GET /api/admin/categories` — List categories with product counts
- `POST /api/admin/categories` — Create category
- `PUT /api/admin/categories/:id` — Update category
- `DELETE /api/admin/categories/:id` — Delete category (safeguarded)
- `GET /api/admin/orders` — Filter orders by status, date, customer
- `PATCH /api/admin/orders/:id/status` — Advance order status
- `GET /api/admin/custom-orders` — Filter custom requests
- `PATCH /api/admin/custom-orders/:id/status` — Update bespoke request status
- `GET /api/admin/reviews` — Manage testimonials
- `PATCH /api/admin/reviews/:id/approve` — Approve/hide review on website
- `GET /api/admin/settings` & `PUT /api/admin/settings` — Business parameters
- `GET /api/admin/content` & `PUT /api/admin/content/:section` — CMS content
- `POST /api/admin/upload` — Multipart image upload (JPEG, PNG, WebP)

---

## 🌐 Production Deployment Guide

### Deploying the Backend (`/server`)
Deployable on Render, Railway, DigitalOcean, or AWS:
1. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `JWT_SECRET=<random-strong-secret-key>`
   - `ADMIN_DEFAULT_EMAIL=admin@fleuriahandmade.com`
   - `ADMIN_DEFAULT_PASSWORD=<your-secure-password>`
2. Start command: `npm start`
3. Persistent volume mounted to `/uploads` and `fleuria.db`.

### Deploying the Admin Panel (`/admin`)
Deployable on Vercel, Netlify, or Cloudflare Pages:
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variable: `VITE_API_URL=https://your-backend-api.com`

### Public Website Integration (`https://fleuria-handmade-lac.vercel.app/`)
On the live storefront, set the backend API host in `<head>` or via `window.FLEURIA_API_HOST`:
```html
<script>
  window.FLEURIA_API_HOST = "https://your-backend-api.com";
</script>
```
Everything else functions automatically!
