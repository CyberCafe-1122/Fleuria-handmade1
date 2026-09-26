import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET /api/admin/categories
router.get('/', requireAuth, (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.created_at ASC
    `).all();

    res.json({ categories });
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// POST /api/admin/categories
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, slug, description, display_order = 0, is_active = 1 } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    let finalSlug = slug ? slugify(slug) : slugify(name);
    let counter = 1;
    while (db.prepare('SELECT id FROM categories WHERE slug = ?').get(finalSlug)) {
      finalSlug = `${slugify(name)}-${counter++}`;
    }

    const id = finalSlug;
    db.prepare(`
      INSERT INTO categories (id, name, slug, description, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      finalSlug,
      description ? description.trim() : null,
      Number(display_order) || 0,
      is_active !== 0 ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json({ message: 'Category created successfully', category: created });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

// PUT /api/admin/categories/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const { name, slug, description, display_order, is_active } = req.body;

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      const collision = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(finalSlug, req.params.id);
      if (collision) {
        return res.status(400).json({ error: 'This slug is already used by another category.' });
      }
    }

    db.prepare(`
      UPDATE categories SET
        name = ?,
        slug = ?,
        description = ?,
        display_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name ? name.trim() : existing.name,
      finalSlug,
      description !== undefined ? (description ? description.trim() : null) : existing.description,
      display_order !== undefined ? Number(display_order) : existing.display_order,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json({ message: 'Category updated successfully', category: updated });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// PATCH /api/admin/categories/:id/toggle
router.patch('/:id/toggle', requireAuth, (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const newVal = category.is_active ? 0 : 1;
    db.prepare('UPDATE categories SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newVal, req.params.id);

    res.json({ message: `Category ${newVal ? 'activated' : 'disabled'}`, is_active: newVal });
  } catch (err) {
    console.error('Toggle category error:', err);
    res.status(500).json({ error: 'Failed to toggle category.' });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    // Check if products belong to this category
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(req.params.id).count;
    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category: ${productCount} product(s) are currently assigned to it. Please reassign or delete the products first.`
      });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

export default router;
