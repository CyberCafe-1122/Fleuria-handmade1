/**
 * Fleuria Handmade - Main Application Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // State
  let currentCategory = "all";
  let currentSearch = "";
  let activeQuickViewProduct = null;
  let quickViewSelectedOptions = {};
  let quickViewQuantity = 1;

  // DOM Elements
  const productsGrid = document.getElementById("productsGrid");
  const filterPills = document.querySelectorAll(".filter-pill");
  const catalogSearch = document.getElementById("catalogSearch");
  const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const btnOpenCart = document.getElementById("btnOpenCart");
  const btnCloseDrawer = document.getElementById("btnCloseDrawer");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartBadge = document.getElementById("cartBadge");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartShippingEl = document.getElementById("cartShipping");
  const cartGrandTotalEl = document.getElementById("cartGrandTotal");
  const shippingMeterText = document.getElementById("shippingMeterText");
  const shippingMeterFill = document.getElementById("shippingMeterFill");
  const btnCheckoutWhatsApp = document.getElementById("btnCheckoutWhatsApp");
  const toggleCheckoutFields = document.getElementById("toggleCheckoutFields");
  const checkoutFieldsContainer = document.getElementById("checkoutFieldsContainer");

  function formatProductImageUrl(path) {
    if (!path) return 'assets/images/pipe-cleaner-tulips.jpg';
    const trimmed = String(path).trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
      const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
      const host = window.FLEURIA_API_HOST || '';
      return host + cleanPath;
    }
    if (trimmed.startsWith('/assets/')) {
      return trimmed.substring(1);
    }
    return trimmed;
  }

  // Modal Elements
  const quickViewModal = document.getElementById("quickViewModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const modalImg = document.getElementById("modalImg");
  const modalCategory = document.getElementById("modalCategory");
  const modalTitle = document.getElementById("modalTitle");
  const modalPrice = document.getElementById("modalPrice");
  const modalOriginalPrice = document.getElementById("modalOriginalPrice");
  const modalDescription = document.getElementById("modalDescription");
  const modalFeatures = document.getElementById("modalFeatures");
  const modalCare = document.getElementById("modalCare");
  const modalOptions = document.getElementById("modalOptions");
  const modalQtySpan = document.getElementById("modalQtySpan");
  const btnModalQtyMinus = document.getElementById("btnModalQtyMinus");
  const btnModalQtyPlus = document.getElementById("btnModalQtyPlus");
  const btnModalAddToCart = document.getElementById("btnModalAddToCart");
  const btnModalQuickWa = document.getElementById("btnModalQuickWa");

  // Floating WhatsApp Concierge Elements
  const waConciergeToggle = document.getElementById("waConciergeToggle");
  const waConciergeCard = document.getElementById("waConciergeCard");
  const btnCloseConcierge = document.getElementById("btnCloseConcierge");
  const quickTopicButtons = document.querySelectorAll(".quick-topic-btn");

  // Bespoke Form
  const bespokeForm = document.getElementById("bespokeForm");

  // Config Modal
  const configModal = document.getElementById("configModal");
  const btnOpenConfig = document.getElementById("btnOpenConfig");
  const btnCloseConfig = document.getElementById("btnCloseConfig");
  const configForm = document.getElementById("configForm");
  const btnResetConfig = document.getElementById("btnResetConfig");

  // =========================================================================
  // INITIALIZATION & STORE BRANDING
  // =========================================================================
  function applyStoreBranding() {
    // Update dynamic texts
    document.querySelectorAll(".store-name-text").forEach(el => el.textContent = StoreConfig.storeName);
    document.querySelectorAll(".store-tagline-text").forEach(el => el.textContent = StoreConfig.tagline);
    document.querySelectorAll(".store-wa-display").forEach(el => el.textContent = StoreConfig.whatsappDisplay);
    
    // Update direct WhatsApp CTA links in header & hero
    const headerWa = document.getElementById("headerWaLink");
    if (headerWa) {
      headerWa.href = buildWhatsAppUrl(
        StoreConfig.whatsappNumber,
        `Hello ${StoreConfig.storeName}! 🌸 I'm visiting your website and would love to ask a quick question.`
      );
    }
    const heroWa = document.getElementById("heroWaLink");
    if (heroWa) {
      heroWa.href = buildWhatsAppUrl(
        StoreConfig.whatsappNumber,
        `Hello ${StoreConfig.storeName}! 🌸 I'm looking for a handcrafted gift / bouquet. Can you recommend something special?`
      );
    }

    renderProducts();
    updateCartUI();
  }

  // Listen for config changes
  window.addEventListener("storeConfigChanged", applyStoreBranding);

  // =========================================================================
  // PRODUCT CATALOG RENDERING
  // =========================================================================
  function renderProducts() {
    if (!productsGrid) return;
    const items = filterProducts(currentCategory, currentSearch);

    if (items.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🌸</div>
          <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--color-forest);">No handmade items found</h3>
          <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Try searching with different keywords or browse all categories.</p>
          <button class="btn-primary" id="btnClearSearch">Browse All Items</button>
        </div>
      `;
      const btnClearSearch = document.getElementById("btnClearSearch");
      if (btnClearSearch) {
        btnClearSearch.addEventListener("click", () => {
          currentCategory = "all";
          currentSearch = "";
          if (catalogSearch) catalogSearch.value = "";
          filterPills.forEach(p => p.classList.toggle("active", p.dataset.category === "all"));
          renderProducts();
        });
      }
      return;
    }

    productsGrid.innerHTML = items.map(product => {
      const originalPriceHtml = product.originalPrice 
        ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` 
        : "";

      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="product-media">
            <span class="product-badge badge-${product.badgeType}">${product.badge}</span>
            <img src="${formatProductImageUrl(product.image)}" alt="${product.title}" loading="lazy" onerror="this.src='assets/images/pipe-cleaner-tulips.jpg'" />
            <button class="btn-quickview-overlay" data-action="quickview" data-id="${product.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Quick Preview
            </button>
          </div>
          <div class="product-info">
            <span class="product-category-name">${product.categoryName}</span>
            <h3 class="product-title">${product.title}</h3>
            <p class="product-desc-snippet">${product.shortDescription}</p>
            <div class="product-rating">
              <span class="rating-stars">★★★★★</span>
              <span class="rating-num">${product.rating.toFixed(1)}</span>
              <span class="rating-count">(${product.reviewCount})</span>
            </div>
            <div class="product-price-row">
              <span class="current-price">${formatCurrency(product.price)}</span>
              ${originalPriceHtml}
            </div>
            <div class="product-actions-group">
              <button class="btn-add-cart" data-action="add-cart" data-id="${product.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Add to Cart
              </button>
              <button class="btn-quick-wa" data-action="quick-wa" data-id="${product.id}" title="Order instantly via WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachProductCardListeners();
  }

  function attachProductCardListeners() {
    // Add to Cart buttons
    document.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const product = getProductById(id);
        if (!product) return;

        // Collect default first option if any
        const defaultOptions = {};
        if (product.options) {
          Object.keys(product.options).forEach(optKey => {
            defaultOptions[optKey] = product.options[optKey][0];
          });
        }

        Cart.addItem(id, 1, defaultOptions);
        showToast(`Added "${product.title}" to your cart! 🌸`);
        triggerCartBadgeBump();
      });
    });

    // Quick WhatsApp buttons
    document.querySelectorAll('[data-action="quick-wa"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const product = getProductById(id);
        if (!product) return;

        const defaultOptions = {};
        if (product.options) {
          Object.keys(product.options).forEach(optKey => {
            defaultOptions[optKey] = product.options[optKey][0];
          });
        }

        const waUrl = Cart.generateDirectWhatsAppUrl(id, defaultOptions, 1);
        window.open(waUrl, "_blank");
      });
    });

    // Quick Preview buttons
    document.querySelectorAll('[data-action="quickview"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        openQuickViewModal(id);
      });
    });
  }

  // =========================================================================
  // DYNAMIC CATEGORY PILLS RENDERING (Loaded from Admin Database)
  // =========================================================================
  function renderCategories() {
    const pillsContainer = document.querySelector(".category-pills");
    if (!pillsContainer) return;
    const cats = window.CATEGORIES || [];

    pillsContainer.innerHTML = `
      <button class="filter-pill ${currentCategory === 'all' ? 'active' : ''}" data-category="all" role="tab">All Creations</button>
      ${cats.map(c => `
        <button class="filter-pill ${currentCategory === c.id || currentCategory === c.slug ? 'active' : ''}" data-category="${c.slug || c.id}" role="tab">
          ${c.name}
        </button>
      `).join('')}
    `;

    pillsContainer.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        pillsContainer.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        e.currentTarget.classList.add("active");
        currentCategory = e.currentTarget.dataset.category || "all";
        renderProducts();
      });
    });
  }

  // =========================================================================
  // DYNAMIC APPROVED REVIEWS RENDERING (Loaded from Admin Database)
  // =========================================================================
  async function renderReviews() {
    const reviewsGrid = document.querySelector(".reviews-grid");
    if (!reviewsGrid) return;
    const host = window.FLEURIA_API_HOST || '';
    try {
      const res = await fetch(`${host}/api/public/reviews`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        reviewsGrid.innerHTML = data.reviews.map(r => `
          <div class="review-card">
            <div class="review-stars">${'★'.repeat(r.rating || 5)}</div>
            <p class="review-text">"${r.text}"</p>
            <div class="review-author">
              <div class="author-avatar">${r.avatar || r.name.substring(0, 2).toUpperCase()}</div>
              <div class="author-info">
                <h5>${r.name}</h5>
                ${r.verified ? `
                  <span class="author-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    Verified WhatsApp Buyer
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {}
  }

  // =========================================================================
  // DYNAMIC WEBSITE CMS CONTENT RENDERING (Loaded from Admin Database)
  // =========================================================================
  async function renderCMSContent() {
    const host = window.FLEURIA_API_HOST || '';
    try {
      const res = await fetch(`${host}/api/public/content`);
      if (!res.ok) return;
      const { content } = await res.json();
      if (!content) return;

      if (content.hero) {
        const h = content.hero;
        const badge = document.querySelector(".hero-badge");
        if (badge && h.badge) badge.innerHTML = h.badge;
        const title = document.querySelector(".hero-title");
        if (title && h.title) title.innerHTML = h.title;
        const sub = document.querySelector(".hero-subtitle");
        if (sub && h.subtitle) sub.textContent = h.subtitle;
        const heroImg = document.querySelector(".hero-card-frame img");
        if (heroImg && h.image) heroImg.src = formatProductImageUrl(h.image);
        const floatTitle = document.querySelector(".glass-card-info h4");
        if (floatTitle && h.floatingCardTitle) floatTitle.textContent = h.floatingCardTitle;
        const floatSub = document.querySelector(".glass-card-info p");
        if (floatSub && h.floatingCardSubtitle) floatSub.textContent = h.floatingCardSubtitle;
      }

      if (content.about) {
        const a = content.about;
        const title = document.querySelector(".artisan-content h3");
        if (title && a.heading) title.textContent = a.heading;
        const quote = document.querySelector(".artisan-quote");
        if (quote && a.quote) quote.textContent = `"${a.quote.replace(/"/g, '')}"`;
        const img = document.querySelector(".artisan-portrait");
        if (img && a.image) img.src = formatProductImageUrl(a.image);
        const statNum = document.querySelector(".stat-number");
        if (statNum && a.statNumber) statNum.textContent = a.statNumber;
        const statLabel = document.querySelector(".stat-label");
        if (statLabel && a.statLabel) statLabel.textContent = a.statLabel;
      }

      if (Array.isArray(content.care_guide) && content.care_guide.length > 0) {
        const careGrid = document.querySelector(".care-grid");
        if (careGrid) {
          careGrid.innerHTML = content.care_guide.map(c => `
            <div class="care-card">
              <div class="care-icon">${c.icon || '✨'}</div>
              <h4>${c.title}</h4>
              <p>${c.text}</p>
            </div>
          `).join('');
        }
      }
    } catch (e) {}
  }

  // Search Input
  if (catalogSearch) {
    catalogSearch.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      renderProducts();
    });
  }

  // =========================================================================
  // QUICK VIEW MODAL
  // =========================================================================
  function openQuickViewModal(productId) {
    const product = getProductById(productId);
    if (!product || !quickViewModal) return;

    activeQuickViewProduct = product;
    quickViewQuantity = 1;
    quickViewSelectedOptions = {};

    modalImg.src = formatProductImageUrl(product.image);
    modalImg.alt = product.title;
    modalCategory.textContent = product.categoryName;
    modalTitle.textContent = product.title;
    modalPrice.textContent = formatCurrency(product.price);
    
    if (product.originalPrice) {
      modalOriginalPrice.style.display = "inline";
      modalOriginalPrice.textContent = formatCurrency(product.originalPrice);
    } else {
      modalOriginalPrice.style.display = "none";
    }

    modalDescription.textContent = product.description;
    modalQtySpan.textContent = quickViewQuantity;

    // Render features
    modalFeatures.innerHTML = product.features.map(f => `
      <li>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${f}</span>
      </li>
    `).join("");

    // Render care tips
    modalCare.textContent = product.care;

    // Render options
    if (product.options && Object.keys(product.options).length > 0) {
      modalOptions.innerHTML = Object.entries(product.options).map(([key, vals]) => {
        quickViewSelectedOptions[key] = vals[0]; // default first
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `
          <div class="option-group" style="margin-bottom: 0.85rem;">
            <label class="option-group-label">${formattedKey}:</label>
            <div class="option-chips" data-option-key="${key}">
              ${vals.map((v, i) => `
                <button type="button" class="chip-btn ${i === 0 ? 'active' : ''}" data-val="${v}">
                  ${v}
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }).join("");

      // Attach chip click listeners
      modalOptions.querySelectorAll(".chip-btn").forEach(chip => {
        chip.addEventListener("click", (e) => {
          const parentGroup = e.currentTarget.closest(".option-chips");
          const optKey = parentGroup.dataset.optionKey;
          parentGroup.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
          e.currentTarget.classList.add("active");
          quickViewSelectedOptions[optKey] = e.currentTarget.dataset.val;
        });
      });
    } else {
      modalOptions.innerHTML = "";
    }

    quickViewModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeQuickViewModal() {
    if (!quickViewModal) return;
    quickViewModal.classList.remove("active");
    document.body.style.overflow = "";
    activeQuickViewProduct = null;
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", closeQuickViewModal);
  }

  if (quickViewModal) {
    quickViewModal.addEventListener("click", (e) => {
      if (e.target === quickViewModal) closeQuickViewModal();
    });
  }

  // Modal Quantity Handlers
  if (btnModalQtyMinus) {
    btnModalQtyMinus.addEventListener("click", () => {
      if (quickViewQuantity > 1) {
        quickViewQuantity--;
        modalQtySpan.textContent = quickViewQuantity;
      }
    });
  }

  if (btnModalQtyPlus) {
    btnModalQtyPlus.addEventListener("click", () => {
      if (quickViewQuantity < 99) {
        quickViewQuantity++;
        modalQtySpan.textContent = quickViewQuantity;
      }
    });
  }

  // Modal Add to Cart
  if (btnModalAddToCart) {
    btnModalAddToCart.addEventListener("click", () => {
      if (!activeQuickViewProduct) return;
      Cart.addItem(activeQuickViewProduct.id, quickViewQuantity, quickViewSelectedOptions);
      showToast(`Added ${quickViewQuantity}× "${activeQuickViewProduct.title}" to cart! 🌸`);
      triggerCartBadgeBump();
      closeQuickViewModal();
      openCartDrawer();
    });
  }

  // Modal Direct WhatsApp Order
  if (btnModalQuickWa) {
    btnModalQuickWa.addEventListener("click", () => {
      if (!activeQuickViewProduct) return;
      const url = Cart.generateDirectWhatsAppUrl(activeQuickViewProduct.id, quickViewSelectedOptions, quickViewQuantity);
      window.open(url, "_blank");
    });
  }

  // =========================================================================
  // CART DRAWER & WHATSAPP CHECKOUT
  // =========================================================================
  function openCartDrawer() {
    if (cartDrawerOverlay) {
      cartDrawerOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeCartDrawer() {
    if (cartDrawerOverlay) {
      cartDrawerOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (btnOpenCart) btnOpenCart.addEventListener("click", openCartDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener("click", closeCartDrawer);

  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener("click", (e) => {
      if (e.target === cartDrawerOverlay) closeCartDrawer();
    });
  }

  // Toggle delivery details accordion
  if (toggleCheckoutFields) {
    toggleCheckoutFields.addEventListener("click", () => {
      checkoutFieldsContainer.classList.toggle("open");
      const icon = toggleCheckoutFields.querySelector(".accordion-icon");
      if (icon) {
        icon.textContent = checkoutFieldsContainer.classList.contains("open") ? "−" : "+";
      }
    });
  }

  function updateCartUI() {
    const items = Cart.getItems();
    const count = Cart.getTotalCount();
    const subtotal = Cart.getSubtotal();
    const shipping = Cart.getShippingFee();
    const grandTotal = Cart.getGrandTotal();
    const progress = Cart.getFreeShippingProgress();

    // Update count badge
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? "flex" : "none";
    }

    // Update free shipping bar
    if (shippingMeterText && shippingMeterFill) {
      if (subtotal === 0) {
        shippingMeterText.innerHTML = `<span>Free shipping on orders over <strong>${formatCurrency(StoreConfig.freeShippingThreshold)}</strong></span>`;
        shippingMeterFill.style.width = "0%";
      } else if (progress.reached) {
        shippingMeterText.innerHTML = `<span>🎉 <strong>Congratulations!</strong> You qualified for <strong>FREE Delivery</strong>!</span>`;
        shippingMeterFill.style.width = "100%";
      } else {
        shippingMeterText.innerHTML = `<span>Add <strong>${formatCurrency(progress.remaining)}</strong> more to unlock <strong>FREE Delivery</strong>!</span><span>${progress.percentage}%</span>`;
        shippingMeterFill.style.width = `${progress.percentage}%`;
      }
    }

    // Render cart items
    if (cartItemsContainer) {
      if (items.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart-state">
            <div class="empty-cart-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <h4>Your Artisan Bag is Empty</h4>
            <p>Explore our handcrafted bouquets, botanical candles, and forever gifts to fill your cart!</p>
            <button class="btn-primary" id="btnShopNowEmpty">Browse Handcrafted Florals</button>
          </div>
        `;
        const btnShopNowEmpty = document.getElementById("btnShopNowEmpty");
        if (btnShopNowEmpty) {
          btnShopNowEmpty.addEventListener("click", () => {
            closeCartDrawer();
            const catalogSection = document.getElementById("catalogSection");
            if (catalogSection) catalogSection.scrollIntoView({ behavior: "smooth" });
          });
        }
      } else {
        cartItemsContainer.innerHTML = items.map(item => {
          const optEntries = Object.entries(item.selectedOptions || {});
          const optionsString = optEntries.length > 0 
            ? optEntries.map(([k, v]) => `${v}`).join(" • ") 
            : "";

          return `
            <div class="cart-item" data-id="${item.id}">
              <div class="cart-item-thumb">
                <img src="${formatProductImageUrl(item.image)}" alt="${item.title}" onerror="this.src='assets/images/pipe-cleaner-tulips.jpg'" />
              </div>
              <div class="cart-item-details">
                <h4>${item.title}</h4>
                ${optionsString ? `<div class="cart-item-options">${optionsString}</div>` : ""}
                <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
                <div class="cart-item-qty-row">
                  <div class="qty-stepper">
                    <button type="button" class="btn-qty-minus" data-id="${item.id}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="btn-qty-plus" data-id="${item.id}">+</button>
                  </div>
                </div>
              </div>
              <button class="btn-remove-item" data-id="${item.id}" title="Remove item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          `;
        }).join("");

        // Cart Item Listeners
        cartItemsContainer.querySelectorAll(".btn-qty-minus").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            const item = items.find(i => i.id === id);
            if (item) Cart.updateQuantity(id, item.quantity - 1);
          });
        });

        cartItemsContainer.querySelectorAll(".btn-qty-plus").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            const item = items.find(i => i.id === id);
            if (item) Cart.updateQuantity(id, item.quantity + 1);
          });
        });

        cartItemsContainer.querySelectorAll(".btn-remove-item").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            Cart.removeItem(id);
            showToast("Item removed from your cart");
          });
        });
      }
    }

    // Update Totals
    if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(subtotal);
    if (cartShippingEl) cartShippingEl.textContent = shipping === 0 ? "FREE" : formatCurrency(shipping);
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatCurrency(grandTotal);

    // Disable checkout button if empty
    if (btnCheckoutWhatsApp) {
      btnCheckoutWhatsApp.disabled = items.length === 0;
      btnCheckoutWhatsApp.style.opacity = items.length === 0 ? "0.6" : "1";
      btnCheckoutWhatsApp.style.cursor = items.length === 0 ? "not-allowed" : "pointer";
    }
  }

  // Listen for cart changes
  window.addEventListener("cartUpdated", updateCartUI);

  // WhatsApp Checkout Trigger
  if (btnCheckoutWhatsApp) {
    btnCheckoutWhatsApp.addEventListener("click", () => {
      if (Cart.getItems().length === 0) {
        showToast("Your cart is currently empty!");
        return;
      }

      // Collect customer information
      const nameInput = document.getElementById("custName");
      const phoneInput = document.getElementById("custPhone");
      const addressInput = document.getElementById("custAddress");
      const cityInput = document.getElementById("custCity");
      const giftNoteInput = document.getElementById("custGiftNote");
      const paymentInput = document.getElementById("custPaymentMethod");

      const customer = {
        name: nameInput ? nameInput.value.trim() : "",
        phone: phoneInput ? phoneInput.value.trim() : "",
        address: addressInput ? addressInput.value.trim() : "",
        city: cityInput ? cityInput.value.trim() : "",
        giftNote: giftNoteInput ? giftNoteInput.value.trim() : "",
        paymentMethod: paymentInput ? paymentInput.value : "Cash on Delivery / Bank Transfer"
      };

      // Prompt user if details not entered
      if (!customer.name || !customer.phone) {
        // Expand the fields container if collapsed
        if (checkoutFieldsContainer && !checkoutFieldsContainer.classList.contains("open")) {
          checkoutFieldsContainer.classList.add("open");
          const icon = toggleCheckoutFields.querySelector(".accordion-icon");
          if (icon) icon.textContent = "−";
        }
        showToast("Please enter your Name and WhatsApp Phone Number to checkout!");
        if (nameInput) nameInput.focus();
        return;
      }

      const orderUrl = Cart.generateWhatsAppOrderUrl(customer);
      if (orderUrl) {
        showToast("Connecting to WhatsApp with your order summary... 🌸");
        window.open(orderUrl, "_blank");
      }
    });
  }

  // =========================================================================
  // BESPOKE COMMISSION FORM TO WHATSAPP
  // =========================================================================
  if (bespokeForm) {
    bespokeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("bespokeName").value.trim();
      const phone = document.getElementById("bespokePhone").value.trim();
      const type = document.getElementById("bespokeType").value;
      const palette = document.getElementById("bespokePalette").value.trim();
      const date = document.getElementById("bespokeDate").value;
      const budget = document.getElementById("bespokeBudget").value.trim();
      const description = document.getElementById("bespokeDesc").value.trim();

      if (!name || !phone || !description) {
        showToast("Please fill in your name, contact phone, and design vision.");
        return;
      }

      const bespokeUrl = Cart.generateBespokeWhatsAppUrl({
        name,
        phone,
        type,
        palette,
        date,
        budget,
        description
      });

      // Record custom commission request in Admin database
      try {
        const host = window.FLEURIA_API_HOST || '';
        fetch(`${host}/api/public/custom-orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            type,
            palette,
            date,
            budget,
            description
          })
        }).catch(() => {});
      } catch (err) {}

      showToast("Opening WhatsApp with your bespoke request...");
      window.open(bespokeUrl, "_blank");
      bespokeForm.reset();
    });
  }

  // =========================================================================
  // FLOATING WHATSAPP CONCIERGE WIDGET
  // =========================================================================
  if (waConciergeToggle && waConciergeCard) {
    waConciergeToggle.addEventListener("click", () => {
      waConciergeCard.classList.toggle("active");
    });

    if (btnCloseConcierge) {
      btnCloseConcierge.addEventListener("click", () => {
        waConciergeCard.classList.remove("active");
      });
    }

    quickTopicButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const topic = e.currentTarget.dataset.topic;
        let promptMsg = "";

        switch (topic) {
          case "wedding":
            promptMsg = `Hello Fleuria! 🌸 I would like to consult with an artisan about custom wedding bouquets or floral event favors.`;
            break;
          case "scent":
            promptMsg = `Hello Fleuria! 🕯️ I would like personalized candle scent recommendations for my home/gifting.`;
            break;
          case "track":
            promptMsg = `Hello Fleuria! 📦 I placed an order recently and would love an update on its crafting / dispatch status.`;
            break;
          case "bespoke":
            promptMsg = `Hi Fleuria! 🎀 I have a custom handmade gift idea and would like to check if you can craft it for me.`;
            break;
          default:
            promptMsg = `Hi Fleuria Handmade! 🌸 I have a question about your collection.`;
        }

        const url = buildWhatsAppUrl(StoreConfig.whatsappNumber, promptMsg);
        window.open(url, "_blank");
        waConciergeCard.classList.remove("active");
      });
    });
  }

  // =========================================================================
  // STORE CONFIG / OWNER SETTINGS MODAL
  // =========================================================================
  function openConfigModal() {
    if (!configModal) return;
    document.getElementById("cfgWhatsapp").value = StoreConfig.whatsappNumber;
    document.getElementById("cfgDisplay").value = StoreConfig.whatsappDisplay;
    document.getElementById("cfgCurrency").value = StoreConfig.currency;
    document.getElementById("cfgFreeShip").value = StoreConfig.freeShippingThreshold;
    document.getElementById("cfgShipFee").value = StoreConfig.standardShippingFee;
    configModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeConfigModal() {
    if (!configModal) return;
    configModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (btnOpenConfig) btnOpenConfig.addEventListener("click", openConfigModal);
  if (btnCloseConfig) btnCloseConfig.addEventListener("click", closeConfigModal);

  if (configModal) {
    configModal.addEventListener("click", (e) => {
      if (e.target === configModal) closeConfigModal();
    });
  }

  if (configForm) {
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const updated = {
        whatsappNumber: document.getElementById("cfgWhatsapp").value.trim(),
        whatsappDisplay: document.getElementById("cfgDisplay").value.trim(),
        currency: document.getElementById("cfgCurrency").value.trim() || "DA",
        freeShippingThreshold: Number(document.getElementById("cfgFreeShip").value) || 8000,
        standardShippingFee: Number(document.getElementById("cfgShipFee").value) || 600
      };

      updateStoreConfig(updated);
      showToast("Store settings & WhatsApp number updated successfully! ✨");
      closeConfigModal();
    });
  }

  if (btnResetConfig) {
    btnResetConfig.addEventListener("click", () => {
      if (confirm("Reset store settings to original defaults?")) {
        resetStoreConfig();
        showToast("Settings reset to default.");
        closeConfigModal();
      }
    });
  }

  // Newsletter form toast
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thank you for subscribing! Your 10% discount code is FLEURIA10 🌸");
      newsletterForm.reset();
    });
  }

  // =========================================================================
  // UTILITIES & MICRO-INTERACTIONS
  // =========================================================================
  function triggerCartBadgeBump() {
    if (!cartBadge) return;
    cartBadge.classList.add("bump");
    setTimeout(() => cartBadge.classList.remove("bump"), 300);
  }

  function showToast(message, icon = "🌸") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(15px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Initialize dynamic components & sync
  applyStoreBranding();
  renderCategories();
  renderReviews();
  renderCMSContent();

  // Re-render when database sends catalog updates
  window.addEventListener("fleuriaCatalogUpdated", () => {
    renderCategories();
    renderProducts();
  });
});

