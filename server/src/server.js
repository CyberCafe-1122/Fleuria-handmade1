import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import ordersRoutes from './routes/orders.js';
import customOrdersRoutes from './routes/customOrders.js';
import reviewsRoutes from './routes/reviews.js';
import settingsRoutes from './routes/settings.js';
import contentRoutes from './routes/content.js';
import uploadRoutes from './routes/upload.js';
import publicRoutes from './routes/public.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize & seed database automatically
seedDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for admin panel & customer storefront
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins in dev, or local/vercel
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Serve client assets as well so any relative image paths like assets/images/... resolve if requested
const clientImagesDir = path.resolve(__dirname, '../../client/assets/images');
if (fs.existsSync(clientImagesDir)) {
  app.use('/assets/images', express.static(clientImagesDir));
}
const clientAssetsDir = path.resolve(__dirname, '../../client/assets');
if (fs.existsSync(clientAssetsDir)) {
  app.use('/assets', express.static(clientAssetsDir));
}

// Serve client storefront statically for local preview and testing
const clientDir = path.resolve(__dirname, '../../client');
if (fs.existsSync(clientDir)) {
  app.use('/client', express.static(clientDir));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Fleuria Handmade',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Admin API Routes (Protected)
app.use('/api/auth', authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/categories', categoriesRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/custom-orders', customOrdersRoutes);
app.use('/api/admin/reviews', reviewsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/content', contentRoutes);
app.use('/api/admin/upload', uploadRoutes);

// Public API Routes (For Customer Storefront)
app.use('/api/public', publicRoutes);
// Legacy compatibility routes
app.use('/api/settings', (req, res) => res.redirect(307, '/api/public/config'));
app.use('/api/products', (req, res) => res.redirect(307, '/api/public/products'));
app.use('/api/categories', (req, res) => res.redirect(307, '/api/public/categories'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`🌸 Fleuria Handmade Backend API running at http://localhost:${PORT}`);
  console.log(`   Public endpoints: http://localhost:${PORT}/api/public/...`);
  console.log(`   Admin endpoints:  http://localhost:${PORT}/api/admin/...`);
});
