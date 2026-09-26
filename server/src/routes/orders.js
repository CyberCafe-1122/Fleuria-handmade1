import express from 'express';
import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const VALID_STATUSES = [
  'New',
  'Pending Confirmation',
  'Confirmed',
  'Preparing',
  'Ready to Dispatch',
  'Shipped',
  'Delivered',
  'Cancelled'
];

// GET /api/admin/orders
router.get('/', requireAuth, (req, res) => {
  try {
    const { q, status, startDate, endDate, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (q && q.trim()) {
      sql += ' AND (id LIKE ? OR order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR city_wilaya LIKE ?)';
      const term = `%${q.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (startDate) {
      sql += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND created_at <= ?';
      params.push(endDate + ' 23:59:59');
    }

    const safeSort = ['created_at', 'total', 'customer_name', 'status'].includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${safeSort} ${safeOrder}`;

    const orders = db.prepare(sql).all(...params);

    // Attach items to each order
    for (const ord of orders) {
      ord.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      for (const item of ord.items) {
        if (item.selected_options) {
          try { item.selected_options = JSON.parse(item.selected_options); } catch (e) {}
        }
      }
    }

    res.json({ orders });
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// GET /api/admin/orders/:id
router.get('/:id', requireAuth, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    for (const item of order.items) {
      if (item.selected_options) {
        try { item.selected_options = JSON.parse(item.selected_options); } catch (e) {}
      }
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
});

// POST /api/admin/orders (Admin manual creation)
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      delivery_address,
      city_wilaya,
      gift_note,
      payment_method = 'Cash on Delivery (Paiement à la livraison / COD)',
      subtotal = 0,
      shipping_fee = 0,
      total = 0,
      status = 'New',
      notes,
      items = []
    } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({ error: 'Customer name and phone number are required.' });
    }

    const id = 'ord-' + Date.now();
    const orderNumber = 'FL-' + Math.floor(1000 + Math.random() * 9000);

    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone, delivery_address,
        city_wilaya, gift_note, payment_method, subtotal, shipping_fee, total,
        status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orderNumber,
      customer_name.trim(),
      customer_phone.trim(),
      delivery_address ? delivery_address.trim() : '',
      city_wilaya ? city_wilaya.trim() : '',
      gift_note ? gift_note.trim() : null,
      payment_method,
      Number(subtotal) || 0,
      Number(shipping_fee) || 0,
      Number(total) || (Number(subtotal) + Number(shipping_fee)),
      VALID_STATUSES.includes(status) ? status : 'New',
      notes ? notes.trim() : null
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, title, price, quantity, image, selected_options, total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      insertItem.run(
        id,
        item.product_id || null,
        item.title || 'Custom Handcrafted Item',
        price,
        qty,
        item.image || null,
        item.selected_options ? JSON.stringify(item.selected_options) : null,
        price * qty
      );
    }

    const created = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    created.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    res.status(201).json({ message: 'Order created successfully', order: created });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/:id/status', requireAuth, (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid statuses: ${VALID_STATUSES.join(', ')}` });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (notes !== undefined) {
      db.prepare('UPDATE orders SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, notes, req.params.id);
    } else {
      db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, req.params.id);
    }

    res.json({ message: `Order status updated to "${status}"`, status });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// PUT /api/admin/orders/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const {
      customer_name,
      customer_phone,
      delivery_address,
      city_wilaya,
      gift_note,
      payment_method,
      status,
      notes
    } = req.body;

    const safeStatus = VALID_STATUSES.includes(status) ? status : existing.status;

    db.prepare(`
      UPDATE orders SET
        customer_name = ?,
        customer_phone = ?,
        delivery_address = ?,
        city_wilaya = ?,
        gift_note = ?,
        payment_method = ?,
        status = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      customer_name ? customer_name.trim() : existing.customer_name,
      customer_phone ? customer_phone.trim() : existing.customer_phone,
      delivery_address !== undefined ? delivery_address.trim() : existing.delivery_address,
      city_wilaya !== undefined ? city_wilaya.trim() : existing.city_wilaya,
      gift_note !== undefined ? gift_note.trim() : existing.gift_note,
      payment_method || existing.payment_method,
      safeStatus,
      notes !== undefined ? notes.trim() : existing.notes,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    updated.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);

    res.json({ message: 'Order updated successfully', order: updated });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: 'Failed to update order.' });
  }
});

// DELETE /api/admin/orders/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

export default router;
