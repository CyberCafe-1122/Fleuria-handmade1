/**
 * Fleuria Handmade - Product Catalog & Categories Data Engine
 * Synchronizes with the persistent Admin Panel database via /api/public/products.
 */

// Fallback initial products if API is initializing
let PRODUCTS = [
  {
    id: "fh-001",
    title: "Pastel Bloom Pipe Cleaner Tulip Bouquet",
    slug: "pastel-bloom-pipe-cleaner-tulip-bouquet",
    category: "pipe-cleaner",
    categoryName: "Pipe Cleaner Flowers",
    price: 4800,
    originalPrice: 5800,
    rating: 4.9,
    reviewCount: 42,
    badge: "Bestseller",
    badgeType: "bestseller",
    image: "assets/images/pipe-cleaner-tulips.jpg",
    images: ["assets/images/pipe-cleaner-tulips.jpg", "assets/images/hero-banner.jpg"],
    shortDescription: "A forever-blooming bouquet of hand-sculpted pastel pink tulips and cheerful mini daisies, crafted from velvety chenille stems and wrapped in Korean aesthetic floral paper with silk ribbon.",
    description: "Meticulously handcrafted petal by petal using premium ultra-dense plush chenille stems (pipe cleaners). Unlike fresh florals, these velvety blooms will remain fresh, tactile, and vibrant forever without watering or wilting, with bendable stems for custom arrangements.",
    features: [
      "100% Handcrafted with ultra-soft plush chenille stems (pipe cleaners)",
      "Includes 5 pastel tulips, 3 mini daisies, and textured bendable foliage",
      "Arrives pre-wrapped with aesthetic floral paper and blush satin bow",
      "Everlasting, flexible stems, dust-resistant, and hypoallergenic"
    ],
    care: "Gently shape or fluff petals if desired. Dust occasionally with a soft makeup brush or gentle cool air blower. Keep away from water.",
    options: {
      ribbonColor: ["Dusty Rose", "Sage Olive", "Champagne Gold", "Soft Cream"],
      scentSpritz: ["Light Lavender Mist", "English Rose Petals", "Unscented Natural"]
    },
    stockStatus: "in_stock",
    stockQuantity: 18,
    isFeatured: true,
    isBestseller: true,
    isSale: true
  },
  {
    id: "fh-002",
    title: "Botanical Blossom Hand-Poured Soy Candle",
    slug: "botanical-blossom-soy-candle",
    category: "candles",
    categoryName: "Botanical Candles",
    price: 2800,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 38,
    badge: "Hand-Poured",
    badgeType: "artisan",
    image: "assets/images/botanical-candle.jpg",
    images: ["assets/images/botanical-candle.jpg"],
    shortDescription: "100% natural soy wax candle adorned with real dried rose petals, French lavender buds, and delicate edible gold flakes in frosted amber glass.",
    description: "Infused with therapeutic essential oils and crackling wooden wicks, our botanical candle brings serene calm to any living sanctuary. Each batch is hand-poured in small studio batches of only 12 jars.",
    features: [
      "100% Pure organic soy wax with crackling wood wick",
      "Adorned with real dried botanicals and shimmering gold accents",
      "Clean 45+ hour burn time without toxic paraffins or soot",
      "Frosted amber apothecary jar with minimalist gold foil label"
    ],
    care: "Trim wooden wick to 1/4 inch before each lighting. Burn for at least 2 hours on first burn to establish an even wax pool.",
    options: {
      scent: ["Rose & Velvet Peony", "French Lavender & Bergamot", "Warm Honey & Amber Vanilla"],
      packaging: ["Standard Gift Box", "Luxury Gift Box with Dried Posy (+500 DA)"]
    },
    stockStatus: "in_stock",
    stockQuantity: 25,
    isFeatured: true
  },
  {
    id: "fh-003",
    title: "Eternal Rose & Baby's Breath Glass Cloche",
    slug: "eternal-rose-glass-cloche",
    category: "preserved",
    categoryName: "Preserved Flowers",
    price: 6800,
    originalPrice: 7900,
    rating: 4.9,
    reviewCount: 29,
    badge: "Limited Edition",
    badgeType: "limited",
    image: "assets/images/preserved-roses.jpg",
    images: ["assets/images/preserved-roses.jpg"],
    shortDescription: "Grade-A natural preserved garden roses and airy gypsophila preserved at peak beauty inside a tall bell glass cloche on a walnut base.",
    description: "Specially preserved using non-toxic botanical humectants, these authentic roses maintain their supple texture, velvety touch, and soft blush tones for 3 to 5 years. A timeless gift for anniversaries and memorable milestones.",
    features: [
      "Real authentic Ecuadorian garden roses preserved at prime bloom",
      "Handmade solid walnut wood base with crystal clear glass dome",
      "Accented with preserved baby's breath and fairy golden strands",
      "Lifespan of 3+ years with zero maintenance"
    ],
    care: "Keep in a climate-controlled room away from high humidity and harsh direct sun. Do not remove glass cloche frequently.",
    options: {
      roseShade: ["Blush Peach & Ivory", "Romantic Crimson Red", "Dusty Lavender & White"],
      engravedPlate: ["No Engraving", "Custom Gold Engraved Nameplate (+800 DA)"]
    },
    stockStatus: "low_stock",
    stockQuantity: 8,
    isFeatured: true,
    isSale: true
  },
  {
    id: "fh-004",
    title: "Forget-Me-Not Pressed Floral 24K Gold Necklace",
    slug: "forget-me-not-resin-pendant",
    category: "jewelry",
    categoryName: "Floral Jewelry",
    price: 3600,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 51,
    badge: "Staff Pick",
    badgeType: "featured",
    image: "assets/images/resin-necklace.jpg",
    images: ["assets/images/resin-necklace.jpg"],
    shortDescription: "Delicate oval pendant encasing hand-pressed real blue forget-me-not flowers and 24K gold flakes suspended in crystal-clear jewellery grade resin.",
    description: "Every flower is organically grown, hand-harvested at dawn, pressed for two weeks, and delicately preserved in optical UV-resistant resin. Fitted on an 18-inch 14K gold-filled hypoallergenic dainty chain.",
    features: [
      "Genuine miniature pressed flowers picked from our home garden",
      "Embedded with genuine 24K gold flakes that shimmer in sunlight",
      "14K Gold-filled cable chain (18 inches with 2-inch extender)",
      "Hypoallergenic, nickel-free, and lead-free"
    ],
    care: "Avoid spraying perfume or lotions directly on the resin pendant. Store in the provided velvet pouch when not worn.",
    options: {
      chainLength: ["16 inches (Choker length)", "18 inches (Standard)", "20 inches (Medium)"],
      chainMetal: ["14K Gold Filled", "925 Sterling Silver"]
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isFeatured: true
  },
  {
    id: "fh-005",
    title: "Botanical Floral Wax Sachets (Set of 2)",
    slug: "botanical-floral-wax-sachets-duo",
    category: "candles",
    categoryName: "Botanical Candles",
    price: 2400,
    originalPrice: 2800,
    rating: 5.0,
    reviewCount: 31,
    badge: "New Arrival",
    badgeType: "new",
    image: "assets/images/botanical-sachet.jpg",
    images: ["assets/images/botanical-sachet.jpg"],
    shortDescription: "Aesthetic natural soy wax hanging freshener tablets decorated with dried wild florals and finished with raw-edge blush silk ribbon.",
    description: "Designed to scent wardrobes, linen closets, study nooks, or powder rooms naturally. Slowly radiates an uplifting scent of wild berries, fresh meadow herbs, and English garden blossoms for up to 6 months.",
    features: [
      "Set contains 2 unique handcrafted wax tablets",
      "Hand-pressed dried lavender, chamomile, and garden petals",
      "Pure soy & beeswax blend for enhanced scent retention",
      "Finished with hand-torn raw silk ribbon for effortless hanging"
    ],
    care: "Hang in a cool, dry closet or drawer. Avoid placing in hot vehicles or direct intense sunlight.",
    options: {
      fragranceDuo: ["Wild Rose & Sweet Lavender", "White Tea & Bergamot Blossom", "Fresh Linen & Jasmine"]
    },
    stockStatus: "in_stock",
    stockQuantity: 20,
    isNew: true,
    isSale: true
  },
  {
    id: "fh-006",
    title: "The Grand Artisan Botanical Gift Hamper",
    slug: "grand-artisan-botanical-gift-hamper",
    category: "hampers",
    categoryName: "Gift Hampers",
    price: 8900,
    originalPrice: 10500,
    rating: 5.0,
    reviewCount: 64,
    badge: "Bestseller",
    badgeType: "bestseller",
    image: "assets/images/gift-hamper.jpg",
    images: ["assets/images/gift-hamper.jpg"],
    shortDescription: "Our signature luxury pine gift chest filled with a mini pipe cleaner rose posy, botanical candle, wax tablets, and a personalized calligraphy card.",
    description: "The ultimate unboxing gift experience! Encased in a handcrafted natural pine wooden chest, tied with double-faced satin ribbon, and cushioned in fragrant dried floral potpourri petals.",
    features: [
      "Custom pine wood presentation box with slide lid",
      "1x Handcrafted 5-bloom velvety pipe cleaner rose posy",
      "1x Full-sized Botanical Blossom Soy Candle (8 oz)",
      "2x Scented Botanical Wardrobe Wax Tablets",
      "Handwritten personalized calligraphy greeting card"
    ],
    care: "Gift box comes ready to gift. Perfect for birthdays, weddings, anniversaries, or corporate appreciation.",
    options: {
      cardMessage: ["Blank Card for Self-Writing", "Personalized Calligraphy (Leave note at checkout)"],
      boxRibbon: ["Ivory Champagne", "Rose Petal Pink", "Forest Sage Green"]
    },
    stockStatus: "in_stock",
    stockQuantity: 6,
    isFeatured: true,
    isBestseller: true,
    isSale: true
  },
  {
    id: "fh-007",
    title: "Sun-Kissed Pipe Cleaner Sunflower Ceramic Pot",
    slug: "sun-kissed-pipe-cleaner-sunflower-pot",
    category: "pipe-cleaner",
    categoryName: "Pipe Cleaner Flowers",
    price: 3200,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 22,
    badge: "Customer Favorite",
    badgeType: "artisan",
    image: "assets/images/pipe-cleaner-sunflower.jpg",
    images: ["assets/images/pipe-cleaner-sunflower.jpg"],
    shortDescription: "A cheerful handmade velvety pipe cleaner sunflower potted in an authentic miniature terracotta clay pot with textured moss base.",
    description: "Brighten any desk, study table, or window sill with sunny everlasting optimism. Every petal is individually hand-shaped and twisted from rich golden and chocolate chenille craft stems with flexible wired structure.",
    features: [
      "Handcrafted with vibrant mustard and chocolate plush chenille stems",
      "Real rustic terracotta miniature ceramic pot with faux moss base",
      "Flexible wired stem allows you to angle the flower towards light",
      "Zero watering required — never withers"
    ],
    care: "No water needed! Occasionally wipe pot with dry cloth and gently dust petals with a soft brush.",
    options: {
      potStyle: ["Classic Terracotta", "Modern Matte White Ceramic (+400 DA)"]
    },
    stockStatus: "in_stock",
    stockQuantity: 12,
    isFeatured: true
  }
];

// Fallback categories
let CATEGORIES = [
  { id: "pipe-cleaner", name: "Pipe Cleaner Flowers", slug: "pipe-cleaner" },
  { id: "candles", name: "Botanical Candles", slug: "candles" },
  { id: "preserved", name: "Preserved Flowers", slug: "preserved" },
  { id: "jewelry", name: "Floral Jewelry", slug: "jewelry" },
  { id: "hampers", name: "Gift Hampers", slug: "hampers" }
];

// Asynchronously sync catalog and categories from the Admin Database
async function syncCatalogFromAPI() {
  const host = window.FLEURIA_API_HOST || '';
  try {
    const [prodsRes, catsRes] = await Promise.all([
      fetch(`${host}/api/public/products`),
      fetch(`${host}/api/public/categories`)
    ]);

    if (catsRes.ok) {
      const catsData = await catsRes.json();
      if (Array.isArray(catsData.categories) && catsData.categories.length > 0) {
        CATEGORIES = catsData.categories;
        window.CATEGORIES = CATEGORIES;
      }
    }

    if (prodsRes.ok) {
      const prodsData = await prodsRes.json();
      if (Array.isArray(prodsData.products)) {
        PRODUCTS = prodsData.products;
        window.PRODUCTS = PRODUCTS;
      }
    }

    // Notify the UI to re-render
    window.dispatchEvent(new CustomEvent("fleuriaCatalogUpdated", {
      detail: { products: PRODUCTS, categories: CATEGORIES }
    }));
  } catch (err) {
    // API starting or offline, use default catalog
  }
}

// Helper to find product by ID
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

// Helper to filter products
function filterProducts(category = "all", searchQuery = "") {
  return PRODUCTS.filter(p => {
    const matchCategory = category === "all" || p.category === category;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });
}

// Initialize sync
syncCatalogFromAPI();
window.addEventListener('focus', syncCatalogFromAPI);

// Expose globally
window.PRODUCTS = PRODUCTS;
window.CATEGORIES = CATEGORIES;
window.getProductById = getProductById;
window.filterProducts = filterProducts;
window.syncCatalogFromAPI = syncCatalogFromAPI;
