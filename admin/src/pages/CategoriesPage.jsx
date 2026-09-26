import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tags, ArrowUpDown, X } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function CategoriesPage({ onStatsChange }) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: 1
  });
  const [saving, setSaving] = useState(false);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      setCategories(res.categories || []);
    } catch (err) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      display_order: categories.length + 1,
      is_active: 1
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      display_order: cat.display_order || 0,
      is_active: cat.is_active !== 0 ? 1 : 0
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await api.patch(`/admin/categories/${id}/toggle`);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: res.is_active } : c));
      showToast(`Category status updated ✨`);
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to update category status', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData);
        showToast(`Category "${formData.name}" updated successfully! 🌸`);
      } else {
        await api.post('/admin/categories', formData);
        showToast(`New category "${formData.name}" added! 🌸`);
      }
      setModalOpen(false);
      fetchCategories();
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      showToast(`Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchCategories();
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Category Management</h2>
          <p className="page-subtitle">
            Organize handcrafted collections and filter tabs on the customer storefront.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Category Name</th>
                <th>Slug (URL Key)</th>
                <th>Description</th>
                <th>Products Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id}>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        backgroundColor: 'var(--color-cream-dark)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>
                        #{cat.display_order}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.925rem' }}>
                        {cat.name}
                      </div>
                    </td>
                    <td>
                      <code style={{
                        backgroundColor: 'var(--color-cream-dark)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: 'var(--color-forest)'
                      }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
                      {cat.description || '—'}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: cat.product_count > 0 ? 'var(--color-forest)' : 'var(--color-text-light)'
                      }}>
                        {cat.product_count} {cat.product_count === 1 ? 'product' : 'products'}
                      </span>
                    </td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={cat.is_active === 1}
                          onChange={() => handleToggleActive(cat.id)}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(cat)}
                          title="Edit category"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteTarget(cat)}
                          title="Delete category"
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="catName">Category Name *</label>
                  <input
                    id="catName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pipe Cleaner Flowers"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="catSlug">Slug (Optional)</label>
                    <input
                      id="catSlug"
                      type="text"
                      className="form-control"
                      placeholder="e.g. pipe-cleaner"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    />
                    <small style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>Auto-generated if left blank</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="catOrder">Display Order</label>
                    <input
                      id="catOrder"
                      type="number"
                      className="form-control"
                      value={formData.display_order}
                      onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="catDesc">Description</label>
                  <textarea
                    id="catDesc"
                    rows={3}
                    className="form-control"
                    placeholder="Brief description of this collection..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--color-cream)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-forest)' }}>Category Enabled</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Visible in navigation and catalog filters</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.is_active === 1}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? If any products belong to this category, deletion will be prevented to avoid orphan products.`}
        confirmText="Yes, Delete Category"
        danger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
