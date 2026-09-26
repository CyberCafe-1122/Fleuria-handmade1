import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/settings
router.get('/', requireAuth, (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM store_settings WHERE id = 1').get();
    res.json({ settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to retrieve store settings.' });
  }
});

// PUT /api/admin/settings
router.put('/', requireAuth, (req, res) => {
  try {
    const {
      store_name,
      tagline,
      whatsapp_number,
      whatsapp_display,
      currency,
      currency_code,
      free_shipping_threshold,
      standard_shipping_fee,
      email,
      instagram,
      location,
      working_hours,
      response_time,
      welcome_offer_code
    } = req.body;

    const existing = db.prepare('SELECT * FROM store_settings WHERE id = 1').get();

    db.prepare(`
      UPDATE store_settings SET
        store_name = ?,
        tagline = ?,
        whatsapp_number = ?,
        whatsapp_display = ?,
        currency = ?,
        currency_code = ?,
        free_shipping_threshold = ?,
        standard_shipping_fee = ?,
        email = ?,
        instagram = ?,
        location = ?,
        working_hours = ?,
        response_time = ?,
        welcome_offer_code = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      store_name !== undefined ? store_name.trim() : existing.store_name,
      tagline !== undefined ? tagline.trim() : existing.tagline,
      whatsapp_number !== undefined ? whatsapp_number.replace(/[^\d]/g, '') : existing.whatsapp_number,
      whatsapp_display !== undefined ? whatsapp_display.trim() : existing.whatsapp_display,
      currency !== undefined ? currency.trim() : existing.currency,
      currency_code !== undefined ? currency_code.trim() : existing.currency_code,
      free_shipping_threshold !== undefined ? Number(free_shipping_threshold) : existing.free_shipping_threshold,
      standard_shipping_fee !== undefined ? Number(standard_shipping_fee) : existing.standard_shipping_fee,
      email !== undefined ? email.trim() : existing.email,
      instagram !== undefined ? instagram.trim() : existing.instagram,
      location !== undefined ? location.trim() : existing.location,
      working_hours !== undefined ? working_hours.trim() : existing.working_hours,
      response_time !== undefined ? response_time.trim() : existing.response_time,
      welcome_offer_code !== undefined ? welcome_offer_code.trim() : existing.welcome_offer_code
    );

    const updated = db.prepare('SELECT * FROM store_settings WHERE id = 1').get();
    res.json({ message: 'Store settings updated successfully', settings: updated });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update store settings.' });
  }
});

export default router;
