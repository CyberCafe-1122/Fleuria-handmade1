import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const VALID_CUSTOM_STATUSES = [
  'New',
  'Contacted',
  'Quotation Sent',
  'Confirmed',
  'In Production',
  'Completed',
  'Cancelled'
];

// GET /api/admin/custom-orders
router.get('/', requireAuth, (req, res) => {
  try {
    const { q, status, startDate, endDate, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let sql = 'SELECT * FROM custom_orders WHERE 1=1';
    const params = [];

    if (q && q.trim()) {
      sql += ' AND (id LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR project_type LIKE ? OR palette LIKE ? OR description LIKE ?)';
      const term = `%${q.trim()}%`;
      params.push(term, term, term, term, term, term);
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

    const safeSort = ['created_at', 'required_date', 'customer_name', 'status'].includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${safeSort} ${safeOrder}`;

    const customOrders = db.prepare(sql).all(...params);
    res.json({ customOrders });
  } catch (err) {
    console.error('List custom orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve custom orders.' });
  }
});

// GET /api/admin/custom-orders/:id
router.get('/:id', requireAuth, (req, res) => {
  try {
    const customOrder = db.prepare('SELECT * FROM custom_orders WHERE id = ?').get(req.params.id);
    if (!customOrder) {
      return res.status(404).json({ error: 'Custom order request not found.' });
    }
    res.json({ customOrder });
  } catch (err) {
    console.error('Get custom order error:', err);
    res.status(500).json({ error: 'Failed to retrieve custom order details.' });
  }
});

// PATCH /api/admin/custom-orders/:id/status
router.patch('/:id/status', requireAuth, (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    if (!VALID_CUSTOM_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid statuses: ${VALID_CUSTOM_STATUSES.join(', ')}` });
    }

    const customOrder = db.prepare('SELECT * FROM custom_orders WHERE id = ?').get(req.params.id);
    if (!customOrder) {
      return res.status(404).json({ error: 'Custom order request not found.' });
    }

    if (admin_notes !== undefined) {
      db.prepare('UPDATE custom_orders SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, admin_notes, req.params.id);
    } else {
      db.prepare('UPDATE custom_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, req.params.id);
    }

    res.json({ message: `Status updated to "${status}"`, status });
  } catch (err) {
    console.error('Update custom order status error:', err);
    res.status(500).json({ error: 'Failed to update custom order status.' });
  }
});

// PUT /api/admin/custom-orders/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM custom_orders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Custom order request not found.' });
    }

    const {
      customer_name,
      customer_phone,
      project_type,
      palette,
      required_date,
      budget,
      description,
      status,
      admin_notes
    } = req.body;

    const safeStatus = VALID_CUSTOM_STATUSES.includes(status) ? status : existing.status;

    db.prepare(`
      UPDATE custom_orders SET
        customer_name = ?,
        customer_phone = ?,
        project_type = ?,
        palette = ?,
        required_date = ?,
        budget = ?,
        description = ?,
        status = ?,
        admin_notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      customer_name ? customer_name.trim() : existing.customer_name,
      customer_phone ? customer_phone.trim() : existing.customer_phone,
      project_type || existing.project_type,
      palette !== undefined ? palette.trim() : existing.palette,
      required_date !== undefined ? required_date : existing.required_date,
      budget !== undefined ? budget.trim() : existing.budget,
      description ? description.trim() : existing.description,
      safeStatus,
      admin_notes !== undefined ? admin_notes.trim() : existing.admin_notes,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM custom_orders WHERE id = ?').get(req.params.id);
    res.json({ message: 'Custom order request updated successfully', customOrder: updated });
  } catch (err) {
    console.error('Update custom order error:', err);
    res.status(500).json({ error: 'Failed to update custom order.' });
  }
});

// DELETE /api/admin/custom-orders/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM custom_orders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Custom order request not found.' });
    }

    db.prepare('DELETE FROM custom_orders WHERE id = ?').run(req.params.id);
    res.json({ message: 'Custom order request deleted successfully' });
  } catch (err) {
    console.error('Delete custom order error:', err);
    res.status(500).json({ error: 'Failed to delete custom order request.' });
  }
});

export default router;
