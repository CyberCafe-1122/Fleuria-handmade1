import express from 'express';
import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/reviews
router.get('/', requireAuth, (req, res) => {
  try {
    const { status, q } = req.query;

    let sql = 'SELECT * FROM reviews WHERE 1=1';
    const params = [];

    if (q && q.trim()) {
      sql += ' AND (customer_name LIKE ? OR review_text LIKE ?)';
      const term = `%${q.trim()}%`;
      params.push(term, term);
    }

    if (status === 'approved') {
      sql += ' AND is_approved = 1';
    } else if (status === 'pending') {
      sql += ' AND is_approved = 0';
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const reviews = db.prepare(sql).all(...params);
    res.json({ reviews });
  } catch (err) {
    console.error('List reviews error:', err);
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// POST /api/admin/reviews
router.post('/', requireAuth, (req, res) => {
  try {
    const { customer_name, rating = 5, review_text, avatar_text, avatar_url, is_verified = 1, is_approved = 1, display_order = 0 } = req.body;

    if (!customer_name || !review_text) {
      return res.status(400).json({ error: 'Customer name and review text are required.' });
    }

    const id = 'rev-' + crypto.randomBytes(4).toString('hex');
    const initials = avatar_text || customer_name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    db.prepare(`
      INSERT INTO reviews (
        id, customer_name, rating, review_text, avatar_text, avatar_url,
        is_verified, is_approved, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      customer_name.trim(),
      Math.min(5, Math.max(1, Number(rating) || 5)),
      review_text.trim(),
      initials,
      avatar_url ? avatar_url.trim() : null,
      is_verified ? 1 : 0,
      is_approved ? 1 : 0,
      Number(display_order) || 0
    );

    const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    res.status(201).json({ message: 'Review added successfully', review: created });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Failed to create review.' });
  }
});

// PUT /api/admin/reviews/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const { customer_name, rating, review_text, avatar_text, avatar_url, is_verified, is_approved, display_order } = req.body;

    db.prepare(`
      UPDATE reviews SET
        customer_name = ?,
        rating = ?,
        review_text = ?,
        avatar_text = ?,
        avatar_url = ?,
        is_verified = ?,
        is_approved = ?,
        display_order = ?
      WHERE id = ?
    `).run(
      customer_name ? customer_name.trim() : existing.customer_name,
      rating !== undefined ? Math.min(5, Math.max(1, Number(rating) || 5)) : existing.rating,
      review_text ? review_text.trim() : existing.review_text,
      avatar_text !== undefined ? avatar_text.trim() : existing.avatar_text,
      avatar_url !== undefined ? (avatar_url ? avatar_url.trim() : null) : existing.avatar_url,
      is_verified !== undefined ? (is_verified ? 1 : 0) : existing.is_verified,
      is_approved !== undefined ? (is_approved ? 1 : 0) : existing.is_approved,
      display_order !== undefined ? Number(display_order) : existing.display_order,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
    res.json({ message: 'Review updated successfully', review: updated });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: 'Failed to update review.' });
  }
});

// PATCH /api/admin/reviews/:id/approve
router.patch('/:id/approve', requireAuth, (req, res) => {
  try {
    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const newVal = review.is_approved ? 0 : 1;
    db.prepare('UPDATE reviews SET is_approved = ? WHERE id = ?').run(newVal, req.params.id);
    res.json({ message: `Review ${newVal ? 'approved' : 'hidden'}`, is_approved: newVal });
  } catch (err) {
    console.error('Toggle approve error:', err);
    res.status(500).json({ error: 'Failed to toggle review approval.' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM reviews WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

export default router;
