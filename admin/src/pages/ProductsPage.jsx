import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Check,
  X,
  Sparkles,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api.js';
import { formatCurrency } from '../utils/formatters.js';
import { getImageUrl } from '../utils/imageUrl.js';
import { useToast } from '../context/ToastContext.jsx';
import ProductModal from '../components/ProductModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function ProductsPage({ onStatsChange }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load products & categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories')
      ]);
      setProducts(prodsRes.products || []);
      setCategories(catsRes.categories || []);
    } catch (err) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick toggle inline
  const handleToggle = async (id, field) => {
    try {
      const res = await api.patch(`/admin/products/${id}/toggle`, { field });
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, [field]: res[field] };
        }
        return p;
      }));
      showToast(`Product updated successfully ✨`);
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to update toggle', 'error');
    }
  };

  // Quick stock quantity adjust
  const handleStockDelta = async (id, delta) => {
    try {
      const res = await api.patch(`/admin/products/${id}/stock`, { delta });
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, stock_quantity: res.stock_quantity, stock_status: res.stock_status };
        }
        return p;
      }));
      showToast(`Stock updated to ${res.stock_quantity}`);
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  // Save product (create or update)
  const handleSaveProduct = async (payload) => {
    setSaving(true);
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        showToast(`Product "${payload.title}" updated successfully! 🌸`);
      } else {
        await api.post('/admin/products', payload);
        showToast(`New product "${payload.title}" created successfully! 🌸`);
      }
      setModalOpen(false);
      setEditingProduct(null);
      fetchData();
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`);
      showToast(`Product "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchData();
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Filter products locally for instantaneous response
  const filteredProducts = products.filter(p => {
    const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter;
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.short_description && p.short_description.toLowerCase().includes(search.toLowerCase())) ||
      (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase()));

    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = p.is_active === 1;
    else if (statusFilter === 'inactive') matchStatus = p.is_active === 0;
    else if (statusFilter === 'in_stock') matchStatus = p.stock_status === 'in_stock';
    else if (statusFilter === 'low_stock') matchStatus = p.stock_status === 'low_stock';
    else if (statusFilter === 'out_of_stock') matchStatus = p.stock_status === 'out_of_stock';

    return matchCat && matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Header & Controls */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Handcrafted Products</h2>
          <p className="page-subtitle">
            Manage bouquets, botanical candles, pricing, and live inventory.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search products by title, scent, or flowers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Stock & Visibility</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (≤ 5)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Product Title & Category</th>
                <th>Price</th>
                <th>Stock & Inventory</th>
                <th>Highlights</th>
                <th>Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    Loading product catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌸</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>No products found</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Try adjusting your search query or category filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => (
                  <tr key={prod.id}>
                    {/* Thumbnail */}
                    <td>
                      <img
                        src={getImageUrl(prod.image)}
                        alt={prod.title}
                        style={{
                          width: '52px',
                          height: '52px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-cream)'
                        }}
                        onError={e => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                    </td>

                    {/* Title & Category */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.925rem' }}>
                        {prod.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ color: 'var(--color-rose-dark)', fontWeight: 600 }}>
                          {prod.category_name || prod.category_id}
                        </span>
                        <span>•</span>
                        <span>ID: {prod.id}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                        {formatCurrency(prod.price)}
                      </div>
                      {prod.original_price && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                          {formatCurrency(prod.original_price)}
                        </div>
                      )}
                    </td>

                    {/* Stock & Quantity */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge badge-${prod.stock_status}`}>
                          {prod.stock_status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: '22px', height: '22px', fontSize: '0.9rem', backgroundColor: 'var(--color-cream-dark)' }}
                          onClick={() => handleStockDelta(prod.id, -1)}
                          title="Decrease stock"
                        >
                          −
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                          {prod.stock_quantity}
                        </span>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: '22px', height: '22px', fontSize: '0.9rem', backgroundColor: 'var(--color-cream-dark)' }}
                          onClick={() => handleStockDelta(prod.id, 1)}
                          title="Increase stock"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Badges Highlights */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleToggle(prod.id, 'is_featured')}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-pill)',
                            border: prod.is_featured ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                            backgroundColor: prod.is_featured ? 'var(--color-gold-light)' : 'transparent',
                            color: prod.is_featured ? 'var(--color-gold)' : 'var(--color-text-light)',
                            fontWeight: 600
                          }}
                          title="Toggle Featured"
                        >
                          Featured
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(prod.id, 'is_bestseller')}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-pill)',
                            border: prod.is_bestseller ? '1px solid var(--color-rose)' : '1px solid var(--color-border)',
                            backgroundColor: prod.is_bestseller ? 'var(--color-rose-light)' : 'transparent',
                            color: prod.is_bestseller ? 'var(--color-rose-dark)' : 'var(--color-text-light)',
                            fontWeight: 600
                          }}
                          title="Toggle Bestseller"
                        >
                          Bestseller
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(prod.id, 'is_sale')}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-pill)',
                            border: prod.is_sale ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                            backgroundColor: prod.is_sale ? 'var(--color-danger-bg)' : 'transparent',
                            color: prod.is_sale ? 'var(--color-danger)' : 'var(--color-text-light)',
                            fontWeight: 600
                          }}
                          title="Toggle Sale"
                        >
                          Sale
                        </button>
                      </div>
                    </td>

                    {/* Active Switch */}
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={prod.is_active === 1}
                          onChange={() => handleToggle(prod.id, 'is_active')}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setEditingProduct(prod);
                            setModalOpen(true);
                          }}
                          title="Edit product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteTarget(prod)}
                          title="Delete product"
                        >
                          <Trash2 size={16} color="var(--color-danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={modalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        saving={saving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete Product"
        danger={true}
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1.5fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
