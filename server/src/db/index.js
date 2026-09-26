import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../fleuria.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      badge TEXT,
      badge_type TEXT DEFAULT 'artisan',
      image TEXT NOT NULL,
      images TEXT,
      short_description TEXT,
      description TEXT,
      features TEXT,
      care TEXT,
      options TEXT,
      stock_quantity INTEGER DEFAULT 10,
      stock_status TEXT DEFAULT 'in_stock',
      is_featured INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      is_bestseller INTEGER DEFAULT 0,
      is_sale INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      city_wilaya TEXT NOT NULL,
      gift_note TEXT,
      payment_method TEXT,
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'New',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT,
      selected_options TEXT,
      total_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      project_type TEXT NOT NULL,
      palette TEXT,
      required_date TEXT,
      budget TEXT,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      review_text TEXT NOT NULL,
      avatar_text TEXT,
      avatar_url TEXT,
      is_verified INTEGER DEFAULT 1,
      is_approved INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      store_name TEXT DEFAULT 'Fleuria Handmade',
      tagline TEXT DEFAULT 'Artisan Pipe Cleaner Florals, Botanical Candles & Handcrafted Gifts',
      whatsapp_number TEXT DEFAULT '213555812564',
      whatsapp_display TEXT DEFAULT '+213 555 81 25 64',
      currency TEXT DEFAULT 'DA',
      currency_code TEXT DEFAULT 'DZD',
      free_shipping_threshold REAL DEFAULT 8000,
      standard_shipping_fee REAL DEFAULT 600,
      email TEXT DEFAULT 'orders@fleuriahandmade.com',
      instagram TEXT DEFAULT '@fleuria.handmade',
      location TEXT DEFAULT 'Artisan Botanical Studio, Suite 4B',
      working_hours TEXT DEFAULT 'Mon - Sat: 9:00 AM - 7:00 PM',
      response_time TEXT DEFAULT 'Usually replies within 10 minutes',
      welcome_offer_code TEXT DEFAULT 'FLEURIA10',
      hero_title TEXT,
      hero_subtitle TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS website_content (
      section_key TEXT PRIMARY KEY,
      content_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default db;
