import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', requireAuth, (req, res) => {
  try {
    // 1. Products stats
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count;
    const outOfStockProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_status = 'out_of_stock' OR stock_quantity = 0").get().count;
    const lowStockProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_status = 'low_stock' OR (stock_quantity > 0 AND stock_quantity <= 5)").get().count;

    // 2. Orders stats
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('New', 'Pending Confirmation', 'Preparing', 'Ready to Dispatch')").get().count;
    const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'").get().count;
    const revenueResult = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status != 'Cancelled'").get();
    const totalRevenue = revenueResult.revenue || 0;

    // 3. Custom orders stats
    const totalCustomOrders = db.prepare('SELECT COUNT(*) as count FROM custom_orders').get().count;
    const pendingCustomOrders = db.prepare("SELECT COUNT(*) as count FROM custom_orders WHERE status IN ('New', 'Contacted', 'Quotation Sent', 'In Production')").get().count;

    // 4. Recent orders (with items)
    const recentOrders = db.prepare(`
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    for (const order of recentOrders) {
      order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      for (const item of order.items) {
        if (item.selected_options) {
          try { item.selected_options = JSON.parse(item.selected_options); } catch (e) {}
        }
      }
    }

    // 5. Recent custom requests
    const recentCustomOrders = db.prepare(`
      SELECT * FROM custom_orders
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    // 6. Category breakdown
    const categoryStats = db.prepare(`
      SELECT c.name, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      GROUP BY c.id
    `).all();

    // 7. Order status distribution
    const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all();

    res.json({
      summary: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalCustomOrders,
        pendingCustomOrders
      },
      recentOrders,
      recentCustomOrders,
      categoryStats,
      statusStats
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' });
  }
});

export default router;
