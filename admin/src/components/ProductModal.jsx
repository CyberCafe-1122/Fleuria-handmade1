import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import ImageUploader from './ImageUploader.jsx';
import { getImageUrl } from '../utils/imageUrl.js';

export default function ProductModal({
  isOpen,
  product,
  categories = [],
  onClose,
  onSave,
  saving = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    price: '',
    original_price: '',
    stock_quantity: 10,
    stock_status: 'in_stock',
    badge: '',
    badge_type: 'artisan',
    image: '',
    images: [],
    short_description: '',
    description: '',
    features: [''],
    care: '',
    is_featured: 0,
    is_new: 0,
    is_bestseller: 0,
    is_sale: 0,
    is_active: 1,
    display_order: 0
  });

  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'media' | 'details' | 'badges'

  useEffect(() => {
    const defaultCatId = categories && categories.length > 0 ? categories[0].id : 'pipe-cleaner';
    if (product) {
      setFormData({
        title: product.title || '',
        category_id: product.category_id || defaultCatId,
        price: product.price ?? '',
        original_price: product.original_price ?? '',
        stock_quantity: product.stock_quantity ?? 10,
        stock_status: product.stock_status || 'in_stock',
        badge: product.badge || '',
        badge_type: product.badge_type || 'artisan',
        image: product.image || 'assets/images/pipe-cleaner-tulips.jpg',
        images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || 'assets/images/pipe-cleaner-tulips.jpg'],
        short_description: product.short_description || '',
        description: product.description || '',
        features: Array.isArray(product.features) && product.features.length > 0 ? product.features : [''],
        care: product.care || '',
        is_featured: product.is_featured ? 1 : 0,
        is_new: product.is_new ? 1 : 0,
        is_bestseller: product.is_bestseller ? 1 : 0,
        is_sale: product.is_sale ? 1 : 0,
        is_active: product.is_active !== 0 ? 1 : 0,
        display_order: product.display_order ?? 0
      });
    } else {
      setFormData({
        title: '',
        category_id: defaultCatId,
        price: '',
        original_price: '',
        stock_quantity: 10,
        stock_status: 'in_stock',
        badge: '',
        badge_type: 'artisan',
        image: 'assets/images/pipe-cleaner-tulips.jpg',
        images: ['assets/images/pipe-cleaner-tulips.jpg'],
        short_description: '',
        description: '',
        features: ['100% Handcrafted with love in small studio batches'],
        care: 'Keep in a dry indoor spot away from direct water.',
        is_featured: 0,
        is_new: 1,
        is_bestseller: 0,
        is_sale: 0,
        is_active: 1,
        display_order: 0
      });
    }
    setActiveTab('basic');
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Feature bullet points
  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const handleAddFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const effectiveCategory = formData.category_id || (categories && categories.length > 0 ? categories[0].id : 'pipe-cleaner');
    if (!formData.title || !effectiveCategory || formData.price === '' || formData.price === undefined || formData.price === null) {
      alert('Please fill in Title, Category, and Price.');
      return;
    }

    const payload = {
      ...formData,
      category_id: effectiveCategory,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      stock_quantity: Number(formData.stock_quantity) || 0,
      features: (formData.features || []).filter(f => f && f.trim().length > 0)
    };

    onSave(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🌸</span>
            <h3 className="modal-title">
              {product ? 'Edit Product' : 'Add New Handcrafted Product'}
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-cream)',
          padding: '0 1.75rem'
        }}>
          {[
            { id: 'basic', label: 'Basic Info & Pricing' },
            { id: 'media', label: 'Images & Photos' },
            { id: 'details', label: 'Descriptions & Care' },
            { id: 'badges', label: 'Badges & Status' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--color-forest)' : 'var(--color-text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-forest)' : '2px solid transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ flex: 1 }}>
            {/* Tab 1: Basic Info & Pricing */}
            {activeTab === 'basic' && (
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prodTitle">Product Name / Title *</label>
                  <input
                    id="prodTitle"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pastel Bloom Pipe Cleaner Tulip Bouquet"
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prodCategory">Category *</label>
                    <select
                      id="prodCategory"
                      className="form-control"
                      value={formData.category_id}
                      onChange={e => handleChange('category_id', e.target.value)}
                      required
                    >
                      {categories && categories.length > 0 ? (
                        categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="pipe-cleaner">Pipe Cleaner Flowers</option>
                          <option value="candles">Botanical Soy Candles</option>
                          <option value="preserved">Preserved Eternal Roses</option>
                          <option value="jewelry">Pressed Floral Jewelry</option>
                          <option value="hampers">Signature Gift Hampers</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prodDisplayOrder">Display Order (Sort weight)</label>
                    <input
                      id="prodDisplayOrder"
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={formData.display_order}
                      onChange={e => handleChange('display_order', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prodPrice">Price (DA) *</label>
                    <input
                      id="prodPrice"
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder="4800"
                      value={formData.price}
                      onChange={e => handleChange('price', e.target.value)}
                      required
                    />
                    <small style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>Price displayed on website</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prodOrigPrice">Sale / Strikethrough Original Price (Optional)</label>
                    <input
                      id="prodOrigPrice"
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder="5800"
                      value={formData.original_price}
                      onChange={e => handleChange('original_price', e.target.value)}
                    />
                    <small style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>Shows crossed out when discount is active</small>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prodStockQty">Stock Quantity</label>
                    <input
                      id="prodStockQty"
                      type="number"
                      className="form-control"
                      placeholder="10"
                      value={formData.stock_quantity}
                      onChange={e => {
                        const qty = Number(e.target.value);
                        handleChange('stock_quantity', qty);
                        if (qty === 0) handleChange('stock_status', 'out_of_stock');
                        else if (qty <= 5) handleChange('stock_status', 'low_stock');
                        else handleChange('stock_status', 'in_stock');
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prodStockStatus">Stock Status</label>
                    <select
                      id="prodStockStatus"
                      className="form-control"
                      value={formData.stock_status}
                      onChange={e => handleChange('stock_status', e.target.value)}
                    >
                      <option value="in_stock">In Stock (Available)</option>
                      <option value="low_stock">Low Stock (Few remaining)</option>
                      <option value="out_of_stock">Out of Stock (Never wilt, restock soon)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Images & Photos */}
            {activeTab === 'media' && (
              <div>
                <ImageUploader
                  label="Primary Product Image *"
                  value={formData.image}
                  onChange={url => {
                    handleChange('image', url);
                    if (!formData.images.includes(url)) {
                      handleChange('images', [url, ...formData.images]);
                    }
                  }}
                  hint="Main photo displayed on product cards, cart drawer, and WhatsApp previews."
                />

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                  <label className="form-label">Additional Product Image URLs (Gallery)</label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    Add extra angles or close-ups of velvet petals / wax textures.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <img
                          src={getImageUrl(imgUrl)}
                          alt={`Gallery ${idx + 1}`}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={imgUrl}
                          onChange={e => {
                            const updated = [...formData.images];
                            updated[idx] = e.target.value;
                            handleChange('images', updated);
                          }}
                        />
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => {
                            const updated = formData.images.filter((_, i) => i !== idx);
                            handleChange('images', updated);
                          }}
                          title="Remove image"
                        >
                          <Trash2 size={16} color="var(--color-danger)" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                      onClick={() => handleChange('images', [...formData.images, ''])}
                    >
                      <Plus size={14} /> Add Another Image URL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Descriptions & Care */}
            {activeTab === 'details' && (
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prodShortDesc">Short Catchy Description</label>
                  <textarea
                    id="prodShortDesc"
                    rows={2}
                    className="form-control"
                    placeholder="Brief description shown on catalog card (1-2 sentences)..."
                    value={formData.short_description}
                    onChange={e => handleChange('short_description', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prodFullDesc">Full Detailed Description</label>
                  <textarea
                    id="prodFullDesc"
                    rows={4}
                    className="form-control"
                    placeholder="Describe handcrafted materials, bendable stems, natural soy wax, and gift packaging..."
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Key Features & Handcrafted Attributes</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 100% Handcrafted with ultra-soft plush chenille stems"
                          value={feat}
                          onChange={e => handleFeatureChange(idx, e.target.value)}
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleRemoveFeature(idx)}
                          >
                            <Trash2 size={16} color="var(--color-danger)" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                      onClick={handleAddFeature}
                    >
                      <Plus size={14} /> Add Feature Bullet
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prodCareTip">Care Tip</label>
                  <textarea
                    id="prodCareTip"
                    rows={2}
                    className="form-control"
                    placeholder="e.g. Keep in a dry spot. Dust with soft makeup brush. Do not water."
                    value={formData.care}
                    onChange={e => handleChange('care', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Badges & Status */}
            {activeTab === 'badges' && (
              <div>
                <div className="form-row-2" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prodBadge">Badge Text</label>
                    <input
                      id="prodBadge"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bestseller, Hand-Poured, Staff Pick"
                      value={formData.badge}
                      onChange={e => handleChange('badge', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prodBadgeType">Badge Style</label>
                    <select
                      id="prodBadgeType"
                      className="form-control"
                      value={formData.badge_type}
                      onChange={e => handleChange('badge_type', e.target.value)}
                    >
                      <option value="artisan">Artisan / Handcrafted</option>
                      <option value="bestseller">Bestseller (Gold)</option>
                      <option value="new">New Arrival (Rose)</option>
                      <option value="limited">Limited Edition (Dark Forest)</option>
                      <option value="featured">Featured Pick</option>
                    </select>
                  </div>
                </div>

                {/* Section Toggles */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-cream)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-forest)', margin: 0 }}>
                    Homepage Sections & Highlights
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                        Mark as Featured Product
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Highlights this creation on the curated storefront
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_featured === 1}
                        onChange={e => handleChange('is_featured', e.target.checked ? 1 : 0)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                        Mark as Best Seller
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Shows customer favorite bestseller indicators
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_bestseller === 1}
                        onChange={e => handleChange('is_bestseller', e.target.checked ? 1 : 0)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                        Mark as New Arrival
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Displays new release banner
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_new === 1}
                        onChange={e => handleChange('is_new', e.target.checked ? 1 : 0)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                        Mark as On Sale
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Highlights discount pricing
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_sale === 1}
                        onChange={e => handleChange('is_sale', e.target.checked ? 1 : 0)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                        Product Visibility (Active on Store)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        When disabled, customers cannot see or order this product
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_active === 1}
                        onChange={e => handleChange('is_active', e.target.checked ? 1 : 0)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Changes...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
