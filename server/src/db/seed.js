import bcrypt from 'bcryptjs';
import { db, initDatabase } from './index.js';

export function seedDatabase() {
  initDatabase();

  // 1. Seed Admin
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCount.count === 0) {
    const passwordHash = bcrypt.hashSync(process.env.ADMIN_DEFAULT_PASSWORD || 'iness2131', 10);
    const email = process.env.ADMIN_DEFAULT_EMAIL || 'Iness@Fleuria.com';
    const name = process.env.ADMIN_DEFAULT_NAME || 'Iness';
    db.prepare(`
      INSERT INTO admins (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run(email, passwordHash, name, 'superadmin');
    console.log(`[Seed] Created default admin: ${name} (${email})`);
  }

  // 2. Seed Categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (catCount.count === 0) {
    const categories = [
      { id: 'pipe-cleaner', name: 'Pipe Cleaner Flowers', slug: 'pipe-cleaner', description: 'Handcrafted velvety chenille flower bouquets that never wilt', display_order: 1 },
      { id: 'candles', name: 'Botanical Soy Candles', slug: 'candles', description: '100% natural soy wax hand-poured in small artisan batches', display_order: 2 },
      { id: 'preserved', name: 'Preserved Eternal Roses', slug: 'preserved', description: 'Real authentic garden roses preserved in bell glass cloches', display_order: 3 },
      { id: 'jewelry', name: 'Pressed Floral Jewelry', slug: 'jewelry', description: 'Hand-pressed garden petals encased in 24K gold & crystal resin', display_order: 4 },
      { id: 'hampers', name: 'Signature Gift Hampers', slug: 'hampers', description: 'Luxury handcrafted gift wooden boxes for cherished milestones', display_order: 5 }
    ];

    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    for (const c of categories) {
      insertCat.run(c.id, c.name, c.slug, c.description, c.display_order);
    }
    console.log(`[Seed] Seeded ${categories.length} categories.`);
  }

  // 3. Seed Products
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (prodCount.count === 0) {
    const products = [
      {
        id: 'fh-001',
        category_id: 'pipe-cleaner',
        title: 'Pastel Bloom Pipe Cleaner Tulip Bouquet',
        slug: 'pastel-bloom-pipe-cleaner-tulip-bouquet',
        price: 4800,
        original_price: 5800,
        rating: 4.9,
        review_count: 42,
        badge: 'Bestseller',
        badge_type: 'bestseller',
        image: 'assets/images/pipe-cleaner-tulips.jpg',
        images: JSON.stringify(['assets/images/pipe-cleaner-tulips.jpg', 'assets/images/hero-banner.jpg']),
        short_description: 'A forever-blooming bouquet of hand-sculpted pastel pink tulips and cheerful mini daisies, crafted from velvety chenille stems and wrapped in Korean aesthetic floral paper with silk ribbon.',
        description: 'Meticulously handcrafted petal by petal using premium ultra-dense plush chenille stems (pipe cleaners). Unlike fresh florals, these velvety blooms will remain fresh, tactile, and vibrant forever without watering or wilting, with bendable stems for custom arrangements.',
        features: JSON.stringify([
          '100% Handcrafted with ultra-soft plush chenille stems (pipe cleaners)',
          'Includes 5 pastel tulips, 3 mini daisies, and textured bendable foliage',
          'Arrives pre-wrapped with aesthetic floral paper and blush satin bow',
          'Everlasting, flexible stems, dust-resistant, and hypoallergenic'
        ]),
        care: 'Gently shape or fluff petals if desired. Dust occasionally with a soft makeup brush or gentle cool air blower. Keep away from water.',
        options: JSON.stringify({
          ribbonColor: ['Dusty Rose', 'Sage Olive', 'Champagne Gold', 'Soft Cream'],
          scentSpritz: ['Light Lavender Mist', 'English Rose Petals', 'Unscented Natural']
        }),
        stock_quantity: 18,
        stock_status: 'in_stock',
        is_featured: 1,
        is_new: 0,
        is_bestseller: 1,
        is_sale: 1,
        display_order: 1
      },
      {
        id: 'fh-002',
        category_id: 'candles',
        title: 'Botanical Blossom Hand-Poured Soy Candle',
        slug: 'botanical-blossom-soy-candle',
        price: 2800,
        original_price: null,
        rating: 5.0,
        review_count: 38,
        badge: 'Hand-Poured',
        badge_type: 'artisan',
        image: 'assets/images/botanical-candle.jpg',
        images: JSON.stringify(['assets/images/botanical-candle.jpg']),
        short_description: '100% natural soy wax candle adorned with real dried rose petals, French lavender buds, and delicate edible gold flakes in frosted amber glass.',
        description: 'Infused with therapeutic essential oils and crackling wooden wicks, our botanical candle brings serene calm to any living sanctuary. Each batch is hand-poured in small studio batches of only 12 jars.',
        features: JSON.stringify([
          '100% Pure organic soy wax with crackling wood wick',
          'Adorned with real dried botanicals and shimmering gold accents',
          'Clean 45+ hour burn time without toxic paraffins or soot',
          'Frosted amber apothecary jar with minimalist gold foil label'
        ]),
        care: 'Trim wooden wick to 1/4 inch before each lighting. Burn for at least 2 hours on first burn to establish an even wax pool.',
        options: JSON.stringify({
          scent: ['Rose & Velvet Peony', 'French Lavender & Bergamot', 'Warm Honey & Amber Vanilla'],
          packaging: ['Standard Gift Box', 'Luxury Gift Box with Dried Posy (+500 DA)']
        }),
        stock_quantity: 25,
        stock_status: 'in_stock',
        is_featured: 1,
        is_new: 0,
        is_bestseller: 0,
        is_sale: 0,
        display_order: 2
      },
      {
        id: 'fh-003',
        category_id: 'preserved',
        title: "Eternal Rose & Baby's Breath Glass Cloche",
        slug: 'eternal-rose-glass-cloche',
        price: 6800,
        original_price: 7900,
        rating: 4.9,
        review_count: 29,
        badge: 'Limited Edition',
        badge_type: 'limited',
        image: 'assets/images/preserved-roses.jpg',
        images: JSON.stringify(['assets/images/preserved-roses.jpg']),
        short_description: "Grade-A natural preserved garden roses and airy gypsophila preserved at peak beauty inside a tall bell glass cloche on a walnut base.",
        description: 'Specially preserved using non-toxic botanical humectants, these authentic roses maintain their supple texture, velvety touch, and soft blush tones for 3 to 5 years. A timeless gift for anniversaries and memorable milestones.',
        features: JSON.stringify([
          'Real authentic Ecuadorian garden roses preserved at prime bloom',
          'Handmade solid walnut wood base with crystal clear glass dome',
          'Accented with preserved baby\'s breath and fairy golden strands',
          'Lifespan of 3+ years with zero maintenance'
        ]),
        care: 'Keep in a climate-controlled room away from high humidity and harsh direct sun. Do not remove glass cloche frequently.',
        options: JSON.stringify({
          roseShade: ['Blush Peach & Ivory', 'Romantic Crimson Red', 'Dusty Lavender & White'],
          engravedPlate: ['No Engraving', 'Custom Gold Engraved Nameplate (+800 DA)']
        }),
        stock_quantity: 8,
        stock_status: 'low_stock',
        is_featured: 1,
        is_new: 0,
        is_bestseller: 0,
        is_sale: 1,
        display_order: 3
      },
      {
        id: 'fh-004',
        category_id: 'jewelry',
        title: 'Forget-Me-Not Pressed Floral 24K Gold Necklace',
        slug: 'forget-me-not-resin-pendant',
        price: 3600,
        original_price: null,
        rating: 4.8,
        review_count: 51,
        badge: 'Staff Pick',
        badge_type: 'featured',
        image: 'assets/images/resin-necklace.jpg',
        images: JSON.stringify(['assets/images/resin-necklace.jpg']),
        short_description: 'Delicate oval pendant encasing hand-pressed real blue forget-me-not flowers and 24K gold flakes suspended in crystal-clear jewellery grade resin.',
        description: 'Every flower is organically grown, hand-harvested at dawn, pressed for two weeks, and delicately preserved in optical UV-resistant resin. Fitted on an 18-inch 14K gold-filled hypoallergenic dainty chain.',
        features: JSON.stringify([
          'Genuine miniature pressed flowers picked from our home garden',
          'Embedded with genuine 24K gold flakes that shimmer in sunlight',
          '14K Gold-filled cable chain (18 inches with 2-inch extender)',
          'Hypoallergenic, nickel-free, and lead-free'
        ]),
        care: 'Avoid spraying perfume or lotions directly on the resin pendant. Store in the provided velvet pouch when not worn.',
        options: JSON.stringify({
          chainLength: ['16 inches (Choker length)', '18 inches (Standard)', '20 inches (Medium)'],
          chainMetal: ['14K Gold Filled', '925 Sterling Silver']
        }),
        stock_quantity: 14,
        stock_status: 'in_stock',
        is_featured: 1,
        is_new: 0,
        is_bestseller: 0,
        is_sale: 0,
        display_order: 4
      },
      {
        id: 'fh-005',
        category_id: 'candles',
        title: 'Botanical Floral Wax Sachets (Set of 2)',
        slug: 'botanical-floral-wax-sachets-duo',
        price: 2400,
        original_price: 2800,
        rating: 5.0,
        review_count: 31,
        badge: 'New Arrival',
        badge_type: 'new',
        image: 'assets/images/botanical-sachet.jpg',
        images: JSON.stringify(['assets/images/botanical-sachet.jpg']),
        short_description: 'Aesthetic natural soy wax hanging freshener tablets decorated with dried wild florals and finished with raw-edge blush silk ribbon.',
        description: 'Designed to scent wardrobes, linen closets, study nooks, or powder rooms naturally. Slowly radiates an uplifting scent of wild berries, fresh meadow herbs, and English garden blossoms for up to 6 months.',
        features: JSON.stringify([
          'Set contains 2 unique handcrafted wax tablets',
          'Hand-pressed dried lavender, chamomile, and garden petals',
          'Pure soy & beeswax blend for enhanced scent retention',
          'Finished with hand-torn raw silk ribbon for effortless hanging'
        ]),
        care: 'Hang in a cool, dry closet or drawer. Avoid placing in hot vehicles or direct intense sunlight.',
        options: JSON.stringify({
          fragranceDuo: ['Wild Rose & Sweet Lavender', 'White Tea & Bergamot Blossom', 'Fresh Linen & Jasmine']
        }),
        stock_quantity: 20,
        stock_status: 'in_stock',
        is_featured: 0,
        is_new: 1,
        is_bestseller: 0,
        is_sale: 1,
        display_order: 5
      },
      {
        id: 'fh-006',
        category_id: 'hampers',
        title: 'The Grand Artisan Botanical Gift Hamper',
        slug: 'grand-artisan-botanical-gift-hamper',
        price: 8900,
        original_price: 10500,
        rating: 5.0,
        review_count: 64,
        badge: 'Bestseller',
        badge_type: 'bestseller',
        image: 'assets/images/gift-hamper.jpg',
        images: JSON.stringify(['assets/images/gift-hamper.jpg']),
        short_description: 'Our signature luxury pine gift chest filled with a mini pipe cleaner rose posy, botanical candle, wax tablets, and a personalized calligraphy card.',
        description: 'The ultimate unboxing gift experience! Encased in a handcrafted natural pine wooden chest, tied with double-faced satin ribbon, and cushioned in fragrant dried floral potpourri petals.',
        features: JSON.stringify([
          'Custom pine wood presentation box with slide lid',
          '1x Handcrafted 5-bloom velvety pipe cleaner rose posy',
          '1x Full-sized Botanical Blossom Soy Candle (8 oz)',
          '2x Scented Botanical Wardrobe Wax Tablets',
          'Handwritten personalized calligraphy greeting card'
        ]),
        care: 'Gift box comes ready to gift. Perfect for birthdays, weddings, anniversaries, or corporate appreciation.',
        options: JSON.stringify({
          cardMessage: ['Blank Card for Self-Writing', 'Personalized Calligraphy (Leave note at checkout)'],
          boxRibbon: ['Ivory Champagne', 'Rose Petal Pink', 'Forest Sage Green']
        }),
        stock_quantity: 6,
        stock_status: 'in_stock',
        is_featured: 1,
        is_new: 0,
        is_bestseller: 1,
        is_sale: 1,
        display_order: 6
      },
      {
        id: 'fh-007',
        category_id: 'pipe-cleaner',
        title: 'Sun-Kissed Pipe Cleaner Sunflower Ceramic Pot',
        slug: 'sun-kissed-pipe-cleaner-sunflower-pot',
        price: 3200,
        original_price: null,
        rating: 4.9,
        review_count: 22,
        badge: 'Customer Favorite',
        badge_type: 'artisan',
        image: 'assets/images/pipe-cleaner-sunflower.jpg',
        images: JSON.stringify(['assets/images/pipe-cleaner-sunflower.jpg']),
        short_description: 'A cheerful handmade velvety pipe cleaner sunflower potted in an authentic miniature terracotta clay pot with textured moss base.',
        description: 'Brighten any desk, study table, or window sill with sunny everlasting optimism. Every petal is individually hand-shaped and twisted from rich golden and chocolate chenille craft stems with flexible wired structure.',
        features: JSON.stringify([
          'Handcrafted with vibrant mustard and chocolate plush chenille stems',
          'Real rustic terracotta miniature ceramic pot with faux moss base',
          'Flexible wired stem allows you to angle the flower towards light',
          'Zero watering required — never withers'
        ]),
        care: 'No water needed! Occasionally wipe pot with dry cloth and gently dust petals with a soft brush.',
        options: JSON.stringify({
          potStyle: ['Classic Terracotta', 'Modern Matte White Ceramic (+400 DA)']
        }),
        stock_quantity: 12,
        stock_status: 'in_stock',
        is_featured: 1,
        is_new: 0,
        is_bestseller: 0,
        is_sale: 0,
        display_order: 7
      }
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (
        id, category_id, title, slug, price, original_price, rating, review_count,
        badge, badge_type, image, images, short_description, description,
        features, care, options, stock_quantity, stock_status,
        is_featured, is_new, is_bestseller, is_sale, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const p of products) {
      insertProd.run(
        p.id, p.category_id, p.title, p.slug, p.price, p.original_price, p.rating, p.review_count,
        p.badge, p.badge_type, p.image, p.images, p.short_description, p.description,
        p.features, p.care, p.options, p.stock_quantity, p.stock_status,
        p.is_featured, p.is_new, p.is_bestseller, p.is_sale, p.display_order
      );
    }
    console.log(`[Seed] Seeded ${products.length} products.`);
  }

  // 4. Seed Reviews
  const revCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
  if (revCount.count === 0) {
    const reviews = [
      {
        id: 'rev-001',
        customer_name: 'Sophia Chen',
        rating: 5,
        review_text: 'I ordered the Pastel Bloom Tulip bouquet for my sister\'s graduation. Ordering on WhatsApp was so seamless! The artisan sent me photos of the bouquet before dispatch. My sister cried happy tears!',
        avatar_text: 'SC',
        is_verified: 1,
        is_approved: 1,
        display_order: 1
      },
      {
        id: 'rev-002',
        customer_name: 'Maya Kensington',
        rating: 5,
        review_text: 'The Botanical Blossom Soy Candle smells incredible and the crackling wood wick creates the coziest ambience! The dried rose petals on top look so luxurious. Will definitely order the gift hamper next.',
        avatar_text: 'MK',
        is_verified: 1,
        is_approved: 1,
        display_order: 2
      },
      {
        id: 'rev-003',
        customer_name: 'Liam & Rebecca',
        rating: 5,
        review_text: 'We commissioned 35 mini pipe cleaner flower favors for our intimate garden wedding. The velvety texture, vibrant colors, ribbon wrapping, and personal calligraphy cards exceeded our highest expectations!',
        avatar_text: 'LR',
        is_verified: 1,
        is_approved: 1,
        display_order: 3
      }
    ];

    const insertRev = db.prepare(`
      INSERT INTO reviews (id, customer_name, rating, review_text, avatar_text, is_verified, is_approved, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of reviews) {
      insertRev.run(r.id, r.customer_name, r.rating, r.review_text, r.avatar_text, r.is_verified, r.is_approved, r.display_order);
    }
    console.log(`[Seed] Seeded ${reviews.length} reviews.`);
  }

  // 5. Seed Store Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM store_settings').get();
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO store_settings (
        id, store_name, tagline, whatsapp_number, whatsapp_display,
        currency, currency_code, free_shipping_threshold, standard_shipping_fee,
        email, instagram, location, working_hours, response_time, welcome_offer_code
      ) VALUES (
        1, 'Fleuria Handmade', 'Artisan Pipe Cleaner Florals, Botanical Candles & Handcrafted Gifts',
        '213555812564', '+213 555 81 25 64', 'DA', 'DZD', 8000, 600,
        'orders@fleuriahandmade.com', '@fleuria.handmade', 'Artisan Botanical Studio, Suite 4B',
        'Mon - Sat: 9:00 AM - 7:00 PM', 'Usually replies within 10 minutes', 'FLEURIA10'
      )
    `).run();
    console.log('[Seed] Seeded store settings.');
  }

  // 6. Seed Website Content
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM website_content').get();
  if (contentCount.count === 0) {
    const contents = [
      {
        section_key: 'hero',
        content_json: JSON.stringify({
          badge: '✦ 100% Handcrafted • Hand-Poured in Small Batches',
          title: 'Everlasting Floral Artistry, <em>Crafted with Love</em>',
          subtitle: 'Discover hand-sculpted pipe cleaner flower bouquets that never wilt, hand-poured botanical soy candles, and bespoke gifts. Connect directly with our artisan team on WhatsApp for custom orders and instant purchasing.',
          buttonPrimaryText: 'Explore Handcrafted Blooms',
          buttonWaText: 'Order via WhatsApp',
          image: 'assets/images/hero-banner.jpg',
          floatingCardTitle: '100% Hand-Sculpted',
          floatingCardSubtitle: 'Velvety petals that never wither'
        })
      },
      {
        section_key: 'about',
        content_json: JSON.stringify({
          tag: 'Meet The Maker',
          heading: 'Handcrafted with Intention, Cherished for a Lifetime',
          quote: 'Every stem is sculpted by hand, every petal is shaped with care, and every candle is poured with pure organic botanical oils. We treat each order as an heirloom piece for someone you cherish.',
          p1: 'Fleuria was born out of a deep passion for botanical wonder and the desire to create flowers that outlive fleeting moments. Fresh blooms bring joy for a few days, but our pipe cleaner and preserved florals hold sentimental memories that never fade.',
          p2: 'We pride ourselves on personal customer connections. When you message us on WhatsApp, you\'re talking directly with the maker who crafts your bouquet and hand-pours your candles.',
          image: 'assets/images/artisan-maker.jpg',
          statNumber: '2,400+',
          statLabel: 'Keepsake Blooms Hand-Crafted'
        })
      },
      {
        section_key: 'care_guide',
        content_json: JSON.stringify([
          {
            icon: '✨',
            title: 'Pipe Cleaner Flowers Care',
            text: 'Keep in a dry indoor spot away from water. Bend and pose the flexible stems into your favorite arrangement whenever you wish. To remove dust, gently brush with a soft dry makeup brush or blow with cool, low hairdryer air.'
          },
          {
            icon: '🕯️',
            title: 'Botanical Candle Burn Care',
            text: 'Always trim the wooden wick to 1/4 inch before lighting. Allow the top wax layer to completely melt to the edges during the first burn to prevent tunneling and optimize fragrance throw.'
          },
          {
            icon: '🌹',
            title: 'Preserved Roses Cloche Care',
            text: 'Preserved flowers need zero watering! Keep the glass cloche closed in an air-conditioned or ambient room away from harsh direct sunlight to preserve vibrant petal pigmentation for 3+ years.'
          }
        ])
      },
      {
        section_key: 'footer',
        content_json: JSON.stringify({
          description: 'Artisan Pipe Cleaner Florals, Botanical Candles & Handcrafted Gifts. Each creation is made slowly and sustainably to bring everlasting botanical wonder to your home.',
          email: 'orders@fleuriahandmade.com',
          phone: '+213 555 81 25 64',
          whatsapp: '213555812564',
          instagram: '@fleuria.handmade',
          copyright: '© 2026 Fleuria Handmade. All rights reserved. Artisan Crafted with Love.'
        })
      }
    ];

    const insertContent = db.prepare(`
      INSERT INTO website_content (section_key, content_json)
      VALUES (?, ?)
    `);

    for (const item of contents) {
      insertContent.run(item.section_key, item.content_json);
    }
    console.log(`[Seed] Seeded ${contents.length} CMS content blocks.`);
  }

  // 7. Seed Sample Orders and Custom Orders (so dashboard has authentic operational data to show)
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  if (orderCount.count === 0) {
    const orders = [
      {
        id: 'ord-2026-001',
        order_number: 'FL-8491',
        customer_name: 'Amira Benali',
        customer_phone: '+213 551 23 45 67',
        delivery_address: '14 Rue Didouche Mourad, Apt 3',
        city_wilaya: 'Algiers',
        gift_note: 'Happy Birthday dearest Mama! May your life bloom with joy.',
        payment_method: 'Cash on Delivery (Paiement à la livraison / COD)',
        subtotal: 4800,
        shipping_fee: 600,
        total: 5400,
        status: 'Preparing',
        notes: 'Requested dusty rose ribbon',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        items: [
          {
            product_id: 'fh-001',
            title: 'Pastel Bloom Pipe Cleaner Tulip Bouquet',
            price: 4800,
            quantity: 1,
            image: 'assets/images/pipe-cleaner-tulips.jpg',
            selected_options: JSON.stringify({ ribbonColor: 'Dusty Rose', scentSpritz: 'English Rose Petals' }),
            total_price: 4800
          }
        ]
      },
      {
        id: 'ord-2026-002',
        order_number: 'FL-8492',
        customer_name: 'Yacine Mansouri',
        customer_phone: '+213 770 98 76 54',
        delivery_address: 'Boulevard de la Soummam',
        city_wilaya: 'Oran',
        gift_note: 'For our wedding anniversary.',
        payment_method: 'BaridiMob / CCP Transfer',
        subtotal: 9600,
        shipping_fee: 0,
        total: 9600,
        status: 'Confirmed',
        notes: 'BaridiMob receipt confirmed via WhatsApp',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        items: [
          {
            product_id: 'fh-003',
            title: 'Eternal Rose & Baby\'s Breath Glass Cloche',
            price: 6800,
            quantity: 1,
            image: 'assets/images/preserved-roses.jpg',
            selected_options: JSON.stringify({ roseShade: 'Romantic Crimson Red' }),
            total_price: 6800
          },
          {
            product_id: 'fh-002',
            title: 'Botanical Blossom Hand-Poured Soy Candle',
            price: 2800,
            quantity: 1,
            image: 'assets/images/botanical-candle.jpg',
            selected_options: JSON.stringify({ scent: 'Rose & Velvet Peony' }),
            total_price: 2800
          }
        ]
      },
      {
        id: 'ord-2026-003',
        order_number: 'FL-8493',
        customer_name: 'Selma Kadri',
        customer_phone: '+213 661 11 22 33',
        delivery_address: 'Cite 500 Logements, Bloc C',
        city_wilaya: 'Constantine',
        gift_note: 'Congratulations on your new home!',
        payment_method: 'Cash on Delivery (Paiement à la livraison / COD)',
        subtotal: 8900,
        shipping_fee: 0,
        total: 8900,
        status: 'Delivered',
        notes: 'Customer confirmed parcel receipt with glowing praise',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        items: [
          {
            product_id: 'fh-006',
            title: 'The Grand Artisan Botanical Gift Hamper',
            price: 8900,
            quantity: 1,
            image: 'assets/images/gift-hamper.jpg',
            selected_options: JSON.stringify({ boxRibbon: 'Rose Petal Pink' }),
            total_price: 8900
          }
        ]
      }
    ];

    const insertOrd = db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone, delivery_address,
        city_wilaya, gift_note, payment_method, subtotal, shipping_fee, total,
        status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, title, price, quantity, image, selected_options, total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ord of orders) {
      insertOrd.run(
        ord.id, ord.order_number, ord.customer_name, ord.customer_phone, ord.delivery_address,
        ord.city_wilaya, ord.gift_note, ord.payment_method, ord.subtotal, ord.shipping_fee, ord.total,
        ord.status, ord.notes, ord.created_at
      );
      for (const item of ord.items) {
        insertItem.run(
          ord.id, item.product_id, item.title, item.price, item.quantity, item.image, item.selected_options, item.total_price
        );
      }
    }
    console.log(`[Seed] Seeded ${orders.length} initial orders.`);
  }

  // 8. Seed Sample Custom Orders
  const customCount = db.prepare('SELECT COUNT(*) as count FROM custom_orders').get();
  if (customCount.count === 0) {
    const customOrders = [
      {
        id: 'cust-2026-001',
        customer_name: 'Nadia Cherif',
        customer_phone: '+213 552 44 88 12',
        project_type: 'Custom Pipe Cleaner Bouquet',
        palette: 'Blush pink, champagne & sage green',
        required_date: '2026-10-15',
        budget: '12 000 DA',
        description: 'Need a large bridal bouquet with 15 pipe cleaner roses and delicate baby\'s breath for my bridal photoshoot.',
        status: 'Quotation Sent',
        admin_notes: 'Sent photo palette via WhatsApp, waiting for confirmation on rose count.',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'cust-2026-002',
        customer_name: 'Farid Louali',
        customer_phone: '+213 771 33 55 77',
        project_type: 'Bulk Wedding / Event Favors',
        palette: 'Emerald green & warm gold',
        required_date: '2026-11-02',
        budget: '25 000 DA',
        description: '50 mini pipe cleaner calla lily boutonnieres with customized calligraphy thank you tags.',
        status: 'In Production',
        admin_notes: 'Deposit received. Production 60% complete.',
        created_at: new Date(Date.now() - 3600000 * 72).toISOString()
      }
    ];

    const insertCustom = db.prepare(`
      INSERT INTO custom_orders (
        id, customer_name, customer_phone, project_type, palette, required_date,
        budget, description, status, admin_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of customOrders) {
      insertCustom.run(
        c.id, c.customer_name, c.customer_phone, c.project_type, c.palette, c.required_date,
        c.budget, c.description, c.status, c.admin_notes, c.created_at
      );
    }
    console.log(`[Seed] Seeded ${customOrders.length} initial custom orders.`);
  }

  console.log('[Seed] Database initialization and seeding complete! ✨');
}

// If executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
