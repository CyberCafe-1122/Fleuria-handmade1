import React, { useState, useEffect } from 'react';
import { Save, Sliders, MessageCircle, DollarSign, Truck, Mail, Info, Check } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency } from '../utils/formatters.js';

export default function StoreSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    store_name: 'Fleuria Handmade',
    tagline: 'Artisan Pipe Cleaner Florals, Botanical Candles & Handcrafted Gifts',
    whatsapp_number: '213555812564',
    whatsapp_display: '+213 555 81 25 64',
    currency: 'DA',
    currency_code: 'DZD',
    free_shipping_threshold: 8000,
    standard_shipping_fee: 600,
    email: 'orders@fleuriahandmade.com',
    instagram: '@fleuria.handmade',
    location: 'Artisan Botanical Studio, Suite 4B',
    working_hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    response_time: 'Usually replies within 10 minutes',
    welcome_offer_code: 'FLEURIA10'
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load store settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      showToast('Store settings saved! Changes are now live on the public website. ✨');
    } catch (err) {
      showToast(err.message || 'Failed to update store settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        Loading store settings...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Store & Business Settings</h2>
          <p className="page-subtitle">
            Configure WhatsApp numbers, shipping rates, and currency parameters in persistent database storage.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Main Settings Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* WhatsApp Integration Card */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(37, 211, 102, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="card-title">WhatsApp Ordering Engine</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Primary channel for checkout and concierge briefs</p>
                  </div>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="waNumber">
                    Business WhatsApp Number (Digits only with Country Code) *
                  </label>
                  <input
                    id="waNumber"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 213555812564"
                    value={settings.whatsapp_number}
                    onChange={e => handleChange('whatsapp_number', e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>
                    Used for all direct wa.me order and concierge links
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="waDisplay">
                    Display Phone Format (Shown on Website) *
                  </label>
                  <input
                    id="waDisplay"
                    type="text"
                    className="form-control"
                    placeholder="e.g. +213 555 81 25 64"
                    value={settings.whatsapp_display}
                    onChange={e => handleChange('whatsapp_display', e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>
                    Shown in header and footer text
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="waResponse">Artisan Response Time Text</label>
                <input
                  id="waResponse"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Usually replies within 10 minutes"
                  value={settings.response_time}
                  onChange={e => handleChange('response_time', e.target.value)}
                />
              </div>
            </div>

            {/* Currency & Shipping Rates */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="card-title">Currency & Shipping Thresholds</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Pricing display and cart free shipping meter</p>
                  </div>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="cfgCurrency">Currency Symbol *</label>
                  <input
                    id="cfgCurrency"
                    type="text"
                    className="form-control"
                    placeholder="e.g. DA, DZD, $, €"
                    value={settings.currency}
                    onChange={e => handleChange('currency', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cfgCurrencyCode">Currency Code</label>
                  <input
                    id="cfgCurrencyCode"
                    type="text"
                    className="form-control"
                    placeholder="DZD"
                    value={settings.currency_code}
                    onChange={e => handleChange('currency_code', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="cfgFreeShip">Free Delivery Threshold *</label>
                  <input
                    id="cfgFreeShip"
                    type="number"
                    className="form-control"
                    placeholder="8000"
                    value={settings.free_shipping_threshold}
                    onChange={e => handleChange('free_shipping_threshold', Number(e.target.value))}
                    required
                  />
                  <small style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>
                    Orders above this amount unlock free delivery
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cfgShipFee">Standard Delivery Fee *</label>
                  <input
                    id="cfgShipFee"
                    type="number"
                    className="form-control"
                    placeholder="600"
                    value={settings.standard_shipping_fee}
                    onChange={e => handleChange('standard_shipping_fee', Number(e.target.value))}
                    required
                  />
                  <small style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>
                    Standard nationwide shipping fee
                  </small>
                </div>
              </div>
            </div>

            {/* Brand & Studio Details */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-rose-dark)' }}>
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="card-title">Brand Identity & Studio</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Store title, tagline, and contact info</p>
                  </div>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="storeName">Store Name *</label>
                  <input
                    id="storeName"
                    type="text"
                    className="form-control"
                    value={settings.store_name}
                    onChange={e => handleChange('store_name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="storeEmail">Store Support Email *</label>
                  <input
                    id="storeEmail"
                    type="email"
                    className="form-control"
                    value={settings.email}
                    onChange={e => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="storeTagline">Brand Tagline</label>
                <input
                  id="storeTagline"
                  type="text"
                  className="form-control"
                  value={settings.tagline}
                  onChange={e => handleChange('tagline', e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="storeHours">Studio Working Hours</label>
                  <input
                    id="storeHours"
                    type="text"
                    className="form-control"
                    placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
                    value={settings.working_hours}
                    onChange={e => handleChange('working_hours', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="storeOffer">Welcome Discount Code</label>
                  <input
                    id="storeOffer"
                    type="text"
                    className="form-control"
                    placeholder="FLEURIA10"
                    value={settings.welcome_offer_code}
                    onChange={e => handleChange('welcome_offer_code', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Summary Card & Save */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '5rem' }}>
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>
                Store Preview
              </h3>

              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Store Name</div>
                <div style={{ fontWeight: 700, color: 'var(--color-forest)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {settings.store_name}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Active Currency</div>
                <div style={{ fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                  Sample: {formatCurrency(4800, settings.currency)}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Shipping Rules</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-forest)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                  Free shipping over <strong>{formatCurrency(settings.free_shipping_threshold, settings.currency)}</strong>. Otherwise <strong>{formatCurrency(settings.standard_shipping_fee, settings.currency)}</strong>.
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>WhatsApp Contact</div>
                <div style={{ fontSize: '0.85rem', color: '#25D366', fontWeight: 600 }}>
                  {settings.whatsapp_display} ({settings.whatsapp_number})
                </div>
              </div>

              <div style={{
                padding: '0.85rem',
                backgroundColor: 'var(--color-forest-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--color-forest)',
                marginBottom: '1.25rem',
                lineHeight: 1.4
              }}>
                <Info size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} />
                When you click save, these values persist in the server database and the public website will immediately load and display them.
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
                disabled={saving}
              >
                <Save size={16} />
                <span>{saving ? 'Saving Settings...' : 'Save & Publish Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @media (max-width: 900px) {
          form > div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
