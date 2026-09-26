/**
 * Fleuria Handmade - Shopping Cart & WhatsApp Order Engine
 */

class CartManager {
  constructor() {
    this.storageKey = "fleuria_cart_items";
    this.items = this.loadCart();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return [];
      const items = JSON.parse(saved);
      // Migrate legacy cart items with old USD prices (< 500) to current Algerian Dinar prices
      let modified = false;
      const updatedItems = items.map(item => {
        const prod = typeof getProductById === "function" ? getProductById(item.productId) : null;
        if (prod && item.price < 500 && prod.price >= 500) {
          item.price = prod.price;
          modified = true;
        }
        return item;
      });
      if (modified) {
        localStorage.setItem(this.storageKey, JSON.stringify(updatedItems));
      }
      return updatedItems;
    } catch (e) {
      console.warn("Could not read cart from localStorage", e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { items: this.items, count: this.getTotalCount(), subtotal: this.getSubtotal() } }));
  }

  generateItemId(productId, options) {
    const sortedOptions = Object.entries(options || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
    return `${productId}-${sortedOptions}`;
  }

  addItem(productId, quantity = 1, selectedOptions = {}, customNote = "") {
    const product = getProductById(productId);
    if (!product) return false;

    const itemId = this.generateItemId(productId, selectedOptions);
    const existingIndex = this.items.findIndex(item => item.id === itemId);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
      if (customNote) {
        this.items[existingIndex].customNote = customNote;
      }
    } else {
      this.items.push({
        id: itemId,
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        categoryName: product.categoryName,
        quantity: Math.max(1, quantity),
        selectedOptions: { ...selectedOptions },
        customNote: customNote || ""
      });
    }

    this.saveCart();
    return true;
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveCart();
  }

  updateQuantity(itemId, newQty) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index > -1) {
      if (newQty <= 0) {
        this.removeItem(itemId);
      } else {
        this.items[index].quantity = Math.min(99, newQty);
        this.saveCart();
      }
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getItems() {
    return this.items;
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= StoreConfig.freeShippingThreshold ? 0 : StoreConfig.standardShippingFee;
  }

  getGrandTotal() {
    return this.getSubtotal() + this.getShippingFee();
  }

  getFreeShippingProgress() {
    const subtotal = this.getSubtotal();
    const threshold = StoreConfig.freeShippingThreshold;
    if (subtotal >= threshold) {
      return { reached: true, remaining: 0, percentage: 100 };
    }
    const remaining = threshold - subtotal;
    const percentage = Math.min(100, Math.round((subtotal / threshold) * 100));
    return { reached: false, remaining, percentage };
  }

  /**
   * Builds the formatted WhatsApp order URL
   */
  generateWhatsAppOrderUrl(customer) {
    if (this.items.length === 0) return null;

    const subtotal = this.getSubtotal();
    const shipping = this.getShippingFee();
    const grandTotal = this.getGrandTotal();
    const shippingText = shipping === 0 ? "FREE (Qualified for free shipping)" : formatCurrency(shipping);

    let msg = `🌸 *NEW ORDER - ${StoreConfig.storeName.toUpperCase()}* 🌸\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *CUSTOMER DETAILS*\n`;
    msg += `• *Name:* ${customer.name || "Valued Customer"}\n`;
    msg += `• *Phone / WA:* ${customer.phone || "Not provided"}\n`;
    msg += `• *Delivery Address:* ${customer.address || "To be confirmed"}\n`;
    if (customer.city) msg += `• *City:* ${customer.city}\n`;
    if (customer.paymentMethod) msg += `• *Preferred Payment:* ${customer.paymentMethod}\n`;
    
    if (customer.giftNote && customer.giftNote.trim()) {
      msg += `\n💌 *PERSONAL GIFT CARD MESSAGE:*\n`;
      msg += `"${customer.giftNote.trim()}"\n`;
    }

    msg += `\n🛍️ *ORDERED ITEMS (${this.getTotalCount()} items)*\n`;
    this.items.forEach((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      msg += `\n${index + 1}. *${item.title}*\n`;
      msg += `   • Qty: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(itemSubtotal)}\n`;
      
      const optEntries = Object.entries(item.selectedOptions || {});
      if (optEntries.length > 0) {
        const optStr = optEntries.map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${v}`).join(", ");
        msg += `   • Customization: ${optStr}\n`;
      }
      if (item.customNote) {
        msg += `   • Note: ${item.customNote}\n`;
      }
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 *Subtotal:* ${formatCurrency(subtotal)}\n`;
    msg += `🚚 *Delivery:* ${shippingText}\n`;
    msg += `✨ *ESTIMATED TOTAL:* ${formatCurrency(grandTotal)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💬 *Next Steps:* Please confirm order availability and send payment details. Thank you!`;

    // Automatically record order in Admin Panel persistent database in background
    try {
      const host = window.FLEURIA_API_HOST || '';
      fetch(`${host}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: this.items,
          subtotal,
          shippingFee: shipping,
          total: grandTotal
        })
      }).catch(() => {});
    } catch (e) {}

    return buildWhatsAppUrl(StoreConfig.whatsappNumber, msg);
  }

  /**
   * Generates a direct WhatsApp inquiry link for a single product
   */
  generateDirectWhatsAppUrl(productId, selectedOptions = {}, quantity = 1, customNote = "") {
    const product = getProductById(productId);
    if (!product) return buildWhatsAppUrl(StoreConfig.whatsappNumber, "Hi Fleuria Handmade! I would like to inquire about your handcrafted collection.");

    const itemTotal = product.price * quantity;
    let msg = `🌸 *DIRECT PRODUCT ORDER - ${StoreConfig.storeName.toUpperCase()}* 🌸\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Hello! I'd love to order this handcrafted item:\n\n`;
    msg += `✨ *Product:* ${product.title}\n`;
    msg += `💵 *Price:* ${formatCurrency(product.price)} each\n`;
    msg += `🔢 *Quantity:* ${quantity}\n`;
    msg += `💰 *Subtotal:* ${formatCurrency(itemTotal)}\n`;

    const optEntries = Object.entries(selectedOptions || {});
    if (optEntries.length > 0) {
      const optStr = optEntries.map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${v}`).join(", ");
      msg += `🎀 *Options:* ${optStr}\n`;
    }

    if (customNote && customNote.trim()) {
      msg += `📝 *Note / Customization:* ${customNote.trim()}\n`;
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Could you please confirm if this is currently available to craft/dispatch and how I can proceed with payment? Thank you!`;

    return buildWhatsAppUrl(StoreConfig.whatsappNumber, msg);
  }

  /**
   * Generates a custom commission/bespoke request WhatsApp message
   */
  generateBespokeWhatsAppUrl(commissionData) {
    let msg = `🌸 *BESPOKE / CUSTOM COMMISSION REQUEST* 🌸\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Hello Fleuria team! I would like to commission a custom handcrafted design:\n\n`;
    msg += `👤 *Client Name:* ${commissionData.name}\n`;
    msg += `📞 *Contact:* ${commissionData.phone}\n`;
    msg += `🎨 *Project Type:* ${commissionData.type}\n`;
    msg += `📅 *Needed By Date:* ${commissionData.date || "Flexible"}\n`;
    msg += `🎨 *Color Palette / Theme:* ${commissionData.palette || "Artisan's Choice"}\n`;
    msg += `💰 *Approximate Budget:* ${commissionData.budget || "Standard"}\n`;
    msg += `\n📝 *Design Details & Notes:*\n`;
    msg += `"${commissionData.description}"\n`;
    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Looking forward to your artisan suggestions and quote!`;

    return buildWhatsAppUrl(StoreConfig.whatsappNumber, msg);
  }
}

// Instantiate global cart instance
const Cart = new CartManager();
window.Cart = Cart;
