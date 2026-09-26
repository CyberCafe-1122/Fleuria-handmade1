import React, { useState, useEffect } from 'react';
import {
  Star,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Search,
  X
} from 'lucide-react';
import api from '../utils/api.js';
import { formatDate } from '../utils/formatters.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending'
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    avatar_text: '',
    is_verified: 1,
    is_approved: 1,
    display_order: 0
  });
  const [saving, setSaving] = useState(false);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      setReviews(res.reviews || []);
    } catch (err) {
      showToast(err.message || 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id) => {
    try {
      const res = await api.patch(`/admin/reviews/${id}/approve`);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: res.is_approved } : r));
      showToast(`Review ${res.is_approved ? 'published to website' : 'hidden from website'} ✨`);
    } catch (err) {
      showToast(err.message || 'Failed to toggle review', 'error');
    }
  };

  const openAddModal = () => {
    setEditingReview(null);
    setFormData({
      customer_name: '',
      rating: 5,
      review_text: '',
      avatar_text: '',
      is_verified: 1,
      is_approved: 1,
      display_order: reviews.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (rev) => {
    setEditingReview(rev);
    setFormData({
      customer_name: rev.customer_name,
      rating: rev.rating,
      review_text: rev.review_text,
      avatar_text: rev.avatar_text || '',
      is_verified: rev.is_verified ? 1 : 0,
      is_approved: rev.is_approved ? 1 : 0,
      display_order: rev.display_order || 0
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.review_text) {
      alert('Customer name and review text are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingReview) {
        await api.put(`/admin/reviews/${editingReview.id}`, formData);
        showToast('Review updated successfully! 🌸');
      } else {
        await api.post('/admin/reviews', formData);
        showToast('New review added! 🌸');
      }
      setModalOpen(false);
      fetchReviews();
    } catch (err) {
      showToast(err.message || 'Failed to save review', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/reviews/${deleteTarget.id}`);
      showToast('Review deleted.');
      setDeleteTarget(null);
      fetchReviews();
    } catch (err) {
      showToast(err.message || 'Failed to delete review', 'error');
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'approved' && r.is_approved === 1) ||
      (statusFilter === 'pending' && r.is_approved === 0);

    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      r.customer_name.toLowerCase().includes(q) ||
      r.review_text.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Reviews & Customer Testimonials</h2>
          <p className="page-subtitle">
            Curate verified customer experiences displayed in the "Words of Love" storefront section.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search reviews by customer name or feedback words..."
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

          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Reviews ({reviews.length})</option>
              <option value="approved">Approved & Visible Only</option>
              <option value="pending">Pending / Hidden Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {loading ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Loading reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>No reviews found</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Add a review to display customer praise on the homepage.
            </div>
          </div>
        ) : (
          filteredReviews.map(rev => (
            <div
              key={rev.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: rev.is_approved ? '4px solid var(--color-forest)' : '4px solid var(--color-text-light)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-rose-light)',
                      color: 'var(--color-rose-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}>
                      {rev.avatar_text || rev.customer_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.925rem' }}>
                        {rev.customer_name}
                      </div>
                      {rev.is_verified ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle size={10} /> Verified Buyer
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                          Customer Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div style={{ color: '#E5A93C', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(Math.max(0, 5 - rev.rating))}
                  </div>
                </div>

                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                  marginBottom: '1rem'
                }}>
                  "{rev.review_text}"
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={rev.is_approved === 1}
                      onChange={() => handleToggleApprove(rev.id)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: rev.is_approved ? 'var(--color-forest)' : 'var(--color-text-light)' }}>
                    {rev.is_approved ? 'Visible on Store' : 'Hidden'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn-icon" onClick={() => openEditModal(rev)} title="Edit review">
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon" onClick={() => setDeleteTarget(rev)} title="Delete review">
                    <Trash2 size={16} color="var(--color-danger)" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Review Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingReview ? 'Edit Customer Review' : 'Add New Customer Review'}
              </h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="revName">Customer Name *</label>
                    <input
                      id="revName"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sophia Chen"
                      value={formData.customer_name}
                      onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="revRating">Rating (1 to 5 Stars)</label>
                    <select
                      id="revRating"
                      className="form-control"
                      value={formData.rating}
                      onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    >
                      <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                      <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                      <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                      <option value={2}>★★☆☆☆ (2 Stars - Below Average)</option>
                      <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="revText">Review Text / Testimonial *</label>
                  <textarea
                    id="revText"
                    rows={4}
                    className="form-control"
                    placeholder="Enter what the customer loved about their handcrafted bouquet or candle..."
                    value={formData.review_text}
                    onChange={e => setFormData({ ...formData, review_text: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="revAvatar">Avatar Initials (Optional)</label>
                    <input
                      id="revAvatar"
                      type="text"
                      maxLength={3}
                      className="form-control"
                      placeholder="e.g. SC"
                      value={formData.avatar_text}
                      onChange={e => setFormData({ ...formData, avatar_text: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="revOrder">Display Priority Order</label>
                    <input
                      id="revOrder"
                      type="number"
                      className="form-control"
                      value={formData.display_order}
                      onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-cream)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                        Verified WhatsApp Buyer
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Displays green verified badge next to customer's name
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_verified === 1}
                        onChange={e => setFormData({ ...formData, is_verified: e.target.checked ? 1 : 0 })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                        Approve Review for Website
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Only approved reviews appear on public Fleuria storefront
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_approved === 1}
                        onChange={e => setFormData({ ...formData, is_approved: e.target.checked ? 1 : 0 })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingReview ? 'Update Review' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Review"
        message={`Are you sure you want to delete the review by "${deleteTarget?.customer_name}"?`}
        confirmText="Yes, Delete Review"
        danger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
