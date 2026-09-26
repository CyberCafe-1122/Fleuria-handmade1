import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/content
router.get('/', requireAuth, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM website_content').all();
    const content = {};
    for (const r of rows) {
      try {
        content[r.section_key] = JSON.parse(r.content_json);
      } catch (e) {
        content[r.section_key] = r.content_json;
      }
    }
    res.json({ content });
  } catch (err) {
    console.error('Get website content error:', err);
    res.status(500).json({ error: 'Failed to retrieve website content.' });
  }
});

// PUT /api/admin/content/:section
router.put('/:section', requireAuth, (req, res) => {
  try {
    const { section } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Content data is required.' });
    }

    const jsonStr = JSON.stringify(data);
    const existing = db.prepare('SELECT section_key FROM website_content WHERE section_key = ?').get(section);

    if (existing) {
      db.prepare('UPDATE website_content SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE section_key = ?')
        .run(jsonStr, section);
    } else {
      db.prepare('INSERT INTO website_content (section_key, content_json) VALUES (?, ?)')
        .run(section, jsonStr);
    }

    res.json({ message: `Section "${section}" updated successfully`, section, data });
  } catch (err) {
    console.error('Update website content error:', err);
    res.status(500).json({ error: 'Failed to update website content.' });
  }
});

export default router;
