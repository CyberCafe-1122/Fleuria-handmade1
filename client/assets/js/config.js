/**
 * Fleuria Handmade - Store & Business Configuration
 * Store owners can customize the WhatsApp number, currency, and business details via the Admin Panel.
 */
const DEFAULT_CONFIG = {
  storeName: "Fleuria Handmade",
  tagline: "Artisan Pipe Cleaner Florals, Botanical Candles & Handcrafted Gifts",
  // WhatsApp business number in international format without '+' or spaces
  whatsappNumber: "213555812564",
  whatsappDisplay: "+213 555 81 25 64",
  currency: "DA",
  currencyCode: "DZD",
  freeShippingThreshold: 8000,
  standardShippingFee: 600,
  instagram: "@fleuria.handmade",
  email: "orders@fleuriahandmade.com",
  location: "Artisan Botanical Studio, Suite 4B",
  workingHours: "Mon - Sat: 9:00 AM - 7:00 PM",
  responseTime: "Usually replies within 10 minutes",
  welcomeOfferCode: "FLEURIA10"
};

// Determine backend API host
const API_HOST = window.FLEURIA_API_HOST || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : ''
);
window.FLEURIA_API_HOST = API_HOST;

// Load persistent config or fallback to defaults
const StoreConfig = {
  ...DEFAULT_CONFIG,
  ...(function() {
    try {
      const saved = localStorage.getItem("fleuria_store_config");
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return parsed;
    } catch (e) {
      return {};
    }
  })()
};

// Save updated config locally & dispatch event
function updateStoreConfig(newValues) {
  Object.assign(StoreConfig, newValues);
  try {
    localStorage.setItem("fleuria_store_config", JSON.stringify(StoreConfig));
  } catch (e) {
    console.warn("Could not persist store config", e);
  }
  // Dispatch event so UI updates immediately
  window.dispatchEvent(new CustomEvent("storeConfigChanged", { detail: StoreConfig }));
}

// Fetch live store settings from Admin Backend database
async function syncStoreConfigFromAPI() {
  try {
    const res = await fetch(`${API_HOST}/api/public/config`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.storeName) {
      updateStoreConfig({
        storeName: data.storeName,
        tagline: data.tagline,
        whatsappNumber: data.whatsappNumber,
        whatsappDisplay: data.whatsappDisplay,
        currency: data.currency,
        currencyCode: data.currencyCode,
        freeShippingThreshold: Number(data.freeShippingThreshold) || 8000,
        standardShippingFee: Number(data.standardShippingFee) || 600,
        instagram: data.instagram,
        email: data.email,
        location: data.location,
        workingHours: data.workingHours,
        responseTime: data.responseTime,
        welcomeOfferCode: data.welcomeOfferCode
      });
    }
  } catch (err) {
    // Backend offline or loading, local StoreConfig fallback active
  }
}

// Auto-sync on startup and when user focuses back on window
syncStoreConfigFromAPI();
window.addEventListener('focus', syncStoreConfigFromAPI);

// Helper to format currency
function formatCurrency(amount) {
  const val = Number(amount) || 0;
  const curr = (StoreConfig.currency || "DA").trim();
  const isDZD = curr === "DA" || curr === "DZD" || StoreConfig.currencyCode === "DZD" || curr === "د.ج";

  if (isDZD) {
    // Standard Algerian Dinar pricing: whole numbers with thousands space separator (e.g. 4 800 DA)
    const formatted = Math.round(val)
      .toLocaleString("fr-DZ", { maximumFractionDigits: 0 })
      .replace(/\u202F/g, " ");
    return `${formatted} ${curr}`;
  }

  // Prefix currencies (e.g. $, £, €, ¥)
  if (["$", "£", "€", "¥"].includes(curr)) {
    return `${curr}${val.toFixed(2)}`;
  }

  // Suffix text-based currencies (e.g. AED, MAD, SAR)
  if (/^[A-Za-z]+$/.test(curr)) {
    const formatted = val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${formatted} ${curr}`;
  }

  return `${curr} ${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Helper to build WhatsApp URL with encoded message
function buildWhatsAppUrl(phone, textMessage) {
  const cleanPhone = (phone || StoreConfig.whatsappNumber).replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(textMessage);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

// Expose globally
window.StoreConfig = StoreConfig;
window.updateStoreConfig = updateStoreConfig;
window.syncStoreConfigFromAPI = syncStoreConfigFromAPI;
window.formatCurrency = formatCurrency;
window.buildWhatsAppUrl = buildWhatsAppUrl;
