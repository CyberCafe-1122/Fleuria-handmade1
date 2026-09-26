import express from 'express';
import crypto from 'node:crypto';
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

// GET /api/admin/products
router.get('/', requireAuth, (req, res) => {
  try {
    const { q, category, status, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (q && q.trim()) {
      sql += ` AND (p.title LIKE ? OR p.short_description LIKE ? OR p.description LIKE ?)`;
      const term = `%${q.trim()}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'all') {
      sql += ` AND p.category_id = ?`;
      params.push(category);
    }

    if (status) {
      if (status === 'active') {
        sql += ` AND p.is_active = 1`;
      } else if (status === 'inactive') {
        sql += ` AND p.is_active = 0`;
      } else if (['in_stock', 'low_stock', 'out_of_stock'].includes(status)) {
        sql += ` AND p.stock_status = ?`;
        params.push(status);
      }
    }

    const allowedSortFields = ['created_at', 'title', 'price', 'stock_quantity', 'display_order'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY p.${safeSort} ${safeOrder}`;

    const products = db.prepare(sql).all(...params);

    // Parse JSON fields
    for (const p of products) {
      if (p.images) { try { p.images = JSON.parse(p.images); } catch (e) { p.images = [p.image]; } }
      else { p.images = [p.image]; }
      if (p.features) { try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; } }
      else { p.features = []; }
      if (p.options) { try { p.options = JSON.parse(p.options); } catch (e) { p.options = {}; } }
      else { p.options = {}; }
    }

    res.json({ products });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /api/admin/products/:id
router.get('/:id', requireAuth, (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (product.images) { try { product.images = JSON.parse(product.images); } catch (e) { product.images = [product.image]; } }
    else { product.images = [product.image]; }
    if (product.features) { try { product.features = JSON.parse(product.features); } catch (e) { product.features = []; } }
    else { product.features = []; }
    if (product.options) { try { product.options = JSON.parse(product.options); } catch (e) { product.options = {}; } }
    else { product.options = {}; }

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// POST /api/admin/products
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      title,
      category_id,
      price,
      original_price,
      image,
      images,
      short_description,
      description,
      features,
      care,
      options,
      badge,
      badge_type = 'artisan',
      stock_quantity = 10,
      stock_status,
      is_featured = 0,
      is_new = 0,
      is_bestseller = 0,
      is_sale = 0,
      display_order = 0,
      is_active = 1
    } = req.body;

    if (!title || !category_id || price === undefined || price === null) {
      return res.status(400).json({ error: 'Title, category, and price are required fields.' });
    }

    // Ensure valid category foreign key
    let finalCategoryId = category_id;
    const catExists = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!catExists) {
      const fallbackCat = db.prepare('SELECT id FROM categories ORDER BY display_order ASC LIMIT 1').get();
      if (fallbackCat) {
        finalCategoryId = fallbackCat.id;
      }
    }

    // Auto-generate ID and slug
    const id = 'fh-' + crypto.randomBytes(4).toString('hex');
    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (db.prepare('SELECT id FROM products WHERE slug = ?').get(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Determine stock status
    const qty = Number(stock_quantity) || 0;
    let computedStockStatus = stock_status;
    if (!computedStockStatus) {
      if (qty === 0) computedStockStatus = 'out_of_stock';
      else if (qty <= 5) computedStockStatus = 'low_stock';
      else computedStockStatus = 'in_stock';
    }

    const primaryImg = image || (Array.isArray(images) && images.length > 0 ? images[0] : 'assets/images/pipe-cleaner-tulips.jpg');
    const imagesJson = JSON.stringify(Array.isArray(images) && images.length > 0 ? images : [primaryImg]);
    const featuresJson = JSON.stringify(Array.isArray(features) ? features : []);
    const optionsJson = JSON.stringify(typeof options === 'object' && options !== null ? options : {});

    db.prepare(`
      INSERT INTO products (
        id, category_id, title, slug, price, original_price,
        badge, badge_type, image, images, short_description, description,
        features, care, options, stock_quantity, stock_status,
        is_featured, is_new, is_bestseller, is_sale, display_order, is_active
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `).run(
      id,
      finalCategoryId,
      title.trim(),
      finalSlug,
      Number(price),
      original_price ? Number(original_price) : null,
      badge ? badge.trim() : null,
      badge_type,
      primaryImg,
      imagesJson,
      short_description ? short_description.trim() : null,
      description ? description.trim() : null,
      featuresJson,
      care ? care.trim() : null,
      optionsJson,
      qty,
      computedStockStatus,
      is_featured ? 1 : 0,
      is_new ? 1 : 0,
      is_bestseller ? 1 : 0,
      is_sale ? 1 : 0,
      Number(display_order) || 0,
      is_active !== 0 ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json({ message: 'Product created successfully', product: created });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message || 'Failed to create product.' });
  }
});

// PUT /api/admin/products/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const {
      title,
      category_id,
      price,
      original_price,
      image,
      images,
      short_description,
      description,
      features,
      care,
      options,
      badge,
      badge_type,
      stock_quantity,
      stock_status,
      is_featured,
      is_new,
      is_bestseller,
      is_sale,
      display_order,
      is_active
    } = req.body;

    const qty = stock_quantity !== undefined ? Number(stock_quantity) : existing.stock_quantity;
    let computedStockStatus = stock_status || existing.stock_status;
    if (stock_quantity !== undefined && !stock_status) {
      if (qty === 0) computedStockStatus = 'out_of_stock';
      else if (qty <= 5) computedStockStatus = 'low_stock';
      else computedStockStatus = 'in_stock';
    }

    const primaryImg = image || existing.image;
    const imagesJson = images !== undefined ? JSON.stringify(Array.isArray(images) ? images : [images]) : existing.images;
    const featuresJson = features !== undefined ? JSON.stringify(Array.isArray(features) ? features : []) : existing.features;
    const optionsJson = options !== undefined ? JSON.stringify(typeof options === 'object' && options !== null ? options : {}) : existing.options;

    let finalCategoryId = existing.category_id;
    if (category_id) {
      const catExists = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
      if (catExists) {
        finalCategoryId = category_id;
      }
    }

    db.prepare(`
      UPDATE products SET
        title = ?,
        category_id = ?,
        price = ?,
        original_price = ?,
        badge = ?,
        badge_type = ?,
        image = ?,
        images = ?,
        short_description = ?,
        description = ?,
        features = ?,
        care = ?,
        options = ?,
        stock_quantity = ?,
        stock_status = ?,
        is_featured = ?,
        is_new = ?,
        is_bestseller = ?,
        is_sale = ?,
        display_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ? title.trim() : existing.title,
      finalCategoryId,
      price !== undefined ? Number(price) : existing.price,
      original_price !== undefined ? (original_price ? Number(original_price) : null) : existing.original_price,
      badge !== undefined ? (badge ? badge.trim() : null) : existing.badge,
      badge_type || existing.badge_type,
      primaryImg,
      imagesJson,
      short_description !== undefined ? short_description.trim() : existing.short_description,
      description !== undefined ? description.trim() : existing.description,
      featuresJson,
      care !== undefined ? care.trim() : existing.care,
      optionsJson,
      qty,
      computedStockStatus,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
      is_new !== undefined ? (is_new ? 1 : 0) : existing.is_new,
      is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : existing.is_bestseller,
      is_sale !== undefined ? (is_sale ? 1 : 0) : existing.is_sale,
      display_order !== undefined ? Number(display_order) : existing.display_order,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: err.message || 'Failed to update product.' });
  }
});

// PATCH /api/admin/products/:id/toggle (fast inline toggle for is_active, is_featured, is_bestseller, is_new, is_sale)
router.patch('/:id/toggle', requireAuth, (req, res) => {
  try {
    const { field } = req.body;
    const allowedFields = ['is_active', 'is_featured', 'is_bestseller', 'is_new', 'is_sale'];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid field to toggle.' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const newVal = product[field] ? 0 : 1;
    db.prepare(`UPDATE products SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(newVal, req.params.id);

    res.json({ message: `Updated ${field}`, [field]: newVal });
  } catch (err) {
    console.error('Toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle product status.' });
  }
});

// PATCH /api/admin/products/:id/stock (adjust stock quantity)
router.patch('/:id/stock', requireAuth, (req, res) => {
  try {
    const { quantity, delta, status } = req.body;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    let newQty = product.stock_quantity;
    if (quantity !== undefined) {
      newQty = Math.max(0, Number(quantity));
    } else if (delta !== undefined) {
      newQty = Math.max(0, newQty + Number(delta));
    }

    let newStatus = status;
    if (!newStatus) {
      if (newQty === 0) newStatus = 'out_of_stock';
      else if (newQty <= 5) newStatus = 'low_stock';
      else newStatus = 'in_stock';
    }

    db.prepare(`
      UPDATE products SET
        stock_quantity = ?,
        stock_status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newQty, newStatus, req.params.id);

    res.json({ message: 'Stock updated', stock_quantity: newQty, stock_status: newStatus });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ error: 'Failed to update stock.' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

export default router;
