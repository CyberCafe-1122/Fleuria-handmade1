import express from 'express';
import crypto from 'node:crypto';
import { db } from '../db/index.js';

const router = express.Router();

// GET /api/public/config (Store settings for the website)
router.get('/config', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM store_settings WHERE id = 1').get();
    if (!settings) {
      return res.status(404).json({ error: 'Settings not configured.' });
    }

    res.json({
      storeName: settings.store_name,
      tagline: settings.tagline,
      whatsappNumber: settings.whatsapp_number,
      whatsappDisplay: settings.whatsapp_display,
      currency: settings.currency,
      currencyCode: settings.currency_code,
      freeShippingThreshold: settings.free_shipping_threshold,
      standardShippingFee: settings.standard_shipping_fee,
      email: settings.email,
      instagram: settings.instagram,
      location: settings.location,
      workingHours: settings.working_hours,
      responseTime: settings.response_time,
      welcomeOfferCode: settings.welcome_offer_code
    });
  } catch (err) {
    console.error('Public config error:', err);
    res.status(500).json({ error: 'Failed to retrieve store configuration.' });
  }
});

// GET /api/public/categories (Active categories)
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT id, name, slug, description, display_order
      FROM categories
      WHERE is_active = 1
      ORDER BY display_order ASC, name ASC
    `).all();

    res.json({ categories });
  } catch (err) {
    console.error('Public categories error:', err);
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// GET /api/public/products (Active products)
router.get('/products', (req, res) => {
  try {
    const { category, search, tag } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category && category !== 'all') {
      sql += ` AND (p.category_id = ? OR c.slug = ?)`;
      params.push(category, category);
    }

    if (search && search.trim()) {
      sql += ` AND (p.title LIKE ? OR p.short_description LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (tag === 'featured') sql += ` AND p.is_featured = 1`;
    if (tag === 'new') sql += ` AND p.is_new = 1`;
    if (tag === 'bestseller') sql += ` AND p.is_bestseller = 1`;
    if (tag === 'sale') sql += ` AND p.is_sale = 1`;

    sql += ` ORDER BY p.display_order ASC, p.created_at DESC`;

    const products = db.prepare(sql).all(...params);

    const formatted = products.map(p => {
      let images = [p.image];
      if (p.images) { try { images = JSON.parse(p.images); } catch (e) {} }
      let features = [];
      if (p.features) { try { features = JSON.parse(p.features); } catch (e) {} }
      let options = {};
      if (p.options) { try { options = JSON.parse(p.options); } catch (e) {} }

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category_id,
        categoryName: p.category_name,
        price: p.price,
        originalPrice: p.original_price,
        rating: p.rating,
        reviewCount: p.review_count,
        badge: p.badge,
        badgeType: p.badge_type,
        image: p.image,
        images,
        shortDescription: p.short_description,
        description: p.description,
        features,
        care: p.care,
        options,
        stockStatus: p.stock_status,
        stockQuantity: p.stock_quantity,
        isFeatured: Boolean(p.is_featured),
        isNew: Boolean(p.is_new),
        isBestseller: Boolean(p.is_bestseller),
        isSale: Boolean(p.is_sale)
      };
    });

    res.json({ products: formatted });
  } catch (err) {
    console.error('Public products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /api/public/products/:id
router.get('/products/:id', (req, res) => {
  try {
    const p = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.id = ? OR p.slug = ?) AND p.is_active = 1
    `).get(req.params.id, req.params.id);

    if (!p) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    let images = [p.image];
    if (p.images) { try { images = JSON.parse(p.images); } catch (e) {} }
    let features = [];
    if (p.features) { try { features = JSON.parse(p.features); } catch (e) {} }
    let options = {};
    if (p.options) { try { options = JSON.parse(p.options); } catch (e) {} }

    res.json({
      product: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category_id,
        categoryName: p.category_name,
        price: p.price,
        originalPrice: p.original_price,
        rating: p.rating,
        reviewCount: p.review_count,
        badge: p.badge,
        badgeType: p.badge_type,
        image: p.image,
        images,
        shortDescription: p.short_description,
        description: p.description,
        features,
        care: p.care,
        options,
        stockStatus: p.stock_status,
        stockQuantity: p.stock_quantity,
        isFeatured: Boolean(p.is_featured),
        isNew: Boolean(p.is_new),
        isBestseller: Boolean(p.is_bestseller),
        isSale: Boolean(p.is_sale)
      }
    });
  } catch (err) {
    console.error('Public product error:', err);
    res.status(500).json({ error: 'Failed to retrieve product.' });
  }
});

// GET /api/public/reviews (Approved reviews)
router.get('/reviews', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT id, customer_name, rating, review_text, avatar_text, avatar_url, is_verified
      FROM reviews
      WHERE is_approved = 1
      ORDER BY display_order ASC, created_at DESC
    `).all();

    res.json({
      reviews: reviews.map(r => ({
        id: r.id,
        name: r.customer_name,
        rating: r.rating,
        text: r.review_text,
        avatar: r.avatar_text,
        avatarUrl: r.avatar_url,
        verified: Boolean(r.is_verified)
      }))
    });
  } catch (err) {
    console.error('Public reviews error:', err);
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// GET /api/public/content (Website CMS content)
router.get('/content', (req, res) => {
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
    console.error('Public content error:', err);
    res.status(500).json({ error: 'Failed to retrieve website content.' });
  }
});

// POST /api/public/orders (Customer checkout via WhatsApp synced to admin database)
router.post('/orders', (req, res) => {
  try {
    const {
      customer,
      items,
      subtotal,
      shippingFee,
      total,
      notes
    } = req.body;

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Customer name and WhatsApp phone number are required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    const orderId = 'ord-' + Date.now();
    const orderNumber = 'FL-' + Math.floor(1000 + Math.random() * 9000);

    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone, delivery_address,
        city_wilaya, gift_note, payment_method, subtotal, shipping_fee, total,
        status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)
    `).run(
      orderId,
      orderNumber,
      customer.name.trim(),
      customer.phone.trim(),
      customer.address ? customer.address.trim() : '',
      customer.city ? customer.city.trim() : '',
      customer.giftNote ? customer.giftNote.trim() : null,
      customer.paymentMethod || 'Cash on Delivery (Paiement à la livraison / COD)',
      Number(subtotal) || 0,
      Number(shippingFee) || 0,
      Number(total) || 0,
      notes || 'Placed via WhatsApp Checkout'
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
        orderId,
        item.productId || null,
        item.title || 'Artisan Creation',
        price,
        qty,
        item.image || null,
        item.selectedOptions ? JSON.stringify(item.selectedOptions) : null,
        price * qty
      );
    }

    res.status(201).json({
      message: 'Order recorded successfully',
      orderId,
      orderNumber
    });
  } catch (err) {
    console.error('Public order creation error:', err);
    res.status(500).json({ error: 'Failed to record order.' });
  }
});

// POST /api/public/custom-orders (Bespoke custom order submission from website)
router.post('/custom-orders', (req, res) => {
  try {
    const {
      name,
      phone,
      type,
      palette,
      date,
      budget,
      description
    } = req.body;

    if (!name || !phone || !description) {
      return res.status(400).json({ error: 'Name, phone, and brief description are required.' });
    }

    const id = 'cust-' + Date.now();
    db.prepare(`
      INSERT INTO custom_orders (
        id, customer_name, customer_phone, project_type, palette, required_date,
        budget, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New')
    `).run(
      id,
      name.trim(),
      phone.trim(),
      type || 'Custom Floral Creation',
      palette ? palette.trim() : null,
      date || null,
      budget ? budget.trim() : null,
      description.trim()
    );

    res.status(201).json({
      message: 'Bespoke custom order request submitted successfully',
      requestId: id
    });
  } catch (err) {
    console.error('Public bespoke submission error:', err);
    res.status(500).json({ error: 'Failed to submit bespoke request.' });
  }
});

export default router;
