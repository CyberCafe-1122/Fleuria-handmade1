import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  MessageCircle,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  Palette,
  X,
  FileText
} from 'lucide-react';
import api from '../utils/api.js';
import { formatDate } from '../utils/formatters.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const CUSTOM_STATUSES = [
  'New',
  'Contacted',
  'Quotation Sent',
  'Confirmed',
  'In Production',
  'Completed',
  'Cancelled'
];

export default function CustomOrdersPage({ onStatsChange }) {
  const { showToast } = useToast();
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Detail Modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/custom-orders');
      setCustomOrders(res.customOrders || []);
    } catch (err) {
      showToast(err.message || 'Failed to load custom orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/custom-orders/${id}/status`, { status: newStatus });
      setCustomOrders(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedReq?.id === id) {
        setSelectedReq(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Custom order status updated to "${newStatus}"! ✨`);
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedReq) return;
    try {
      await api.put(`/admin/custom-orders/${selectedReq.id}`, {
        ...selectedReq,
        admin_notes: adminNotes
      });
      setCustomOrders(prev => prev.map(c => c.id === selectedReq.id ? { ...c, admin_notes: adminNotes } : c));
      setSelectedReq(prev => ({ ...prev, admin_notes: adminNotes }));
      showToast('Admin notes saved! 🌸');
    } catch (err) {
      showToast(err.message || 'Failed to save notes', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/custom-orders/${deleteTarget.id}`);
      showToast('Custom order brief deleted.');
      setDeleteTarget(null);
      if (selectedReq?.id === deleteTarget.id) setSelectedReq(null);
      fetchCustomOrders();
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to delete custom order', 'error');
    }
  };

  const generateWhatsAppUrl = (req) => {
    const cleanPhone = (req.customer_phone || '').replace(/[^\d]/g, '');
    const msg = encodeURIComponent(
      `Hello ${req.customer_name}! 🌸 Thank you for your custom commission request with Fleuria Handmade for "${req.project_type}". We would love to discuss color palettes, floral species, and send you artisan samples!`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const filteredOrders = customOrders.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      c.customer_name.toLowerCase().includes(q) ||
      c.customer_phone.toLowerCase().includes(q) ||
      c.project_type.toLowerCase().includes(q) ||
      (c.palette && c.palette.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Custom Commissions & Bespoke Orders</h2>
          <p className="page-subtitle">
            Manage custom pipe cleaner bouquets, wedding favors, and artisan gift box briefs.
          </p>
        </div>
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
              placeholder="Search custom requests by customer, palette, or project type..."
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
              <option value="all">All Request Statuses ({customOrders.length})</option>
              {CUSTOM_STATUSES.map(st => (
                <option key={st} value={st}>
                  {st} ({customOrders.filter(c => c.status === st).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Orders Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Project Type</th>
                <th>Color Palette</th>
                <th>Needed By</th>
                <th>Approx Budget</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    Loading custom orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎀</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>No custom requests found</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Commission requests submitted from the public website bespoke form will appear here.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                        {req.customer_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {req.customer_phone}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-rose-dark)', fontSize: '0.85rem' }}>
                        {req.project_type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {req.palette || 'Artisan Discretion'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: req.required_date ? 'var(--color-forest)' : 'var(--color-text-light)' }}>
                        {req.required_date || 'Flexible'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.85rem' }}>
                        {req.budget || 'Open'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={req.status}
                        onChange={e => handleStatusChange(req.id, e.target.value)}
                        className={`badge badge-${req.status}`}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        {CUSTOM_STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        {formatDate(req.created_at)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {/* WhatsApp direct chat link */}
                        <a
                          href={generateWhatsAppUrl(req)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon"
                          style={{ color: '#25D366' }}
                          title="Contact Customer on WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>

                        {/* View Details */}
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setSelectedReq(req);
                            setAdminNotes(req.admin_notes || '');
                          }}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Delete */}
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteTarget(req)}
                          title="Delete Request"
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

      {/* Details & Admin Notes Modal */}
      {selectedReq && (
        <div className="modal-backdrop" onClick={() => setSelectedReq(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  Bespoke Commission Brief — {selectedReq.customer_name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Submitted on {formatDate(selectedReq.created_at)}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setSelectedReq(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Overview grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Project Type</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                    {selectedReq.project_type}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>WhatsApp Contact</div>
                  <div>
                    <a
                      href={generateWhatsAppUrl(selectedReq)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#25D366', fontWeight: 600, textDecoration: 'underline', fontSize: '0.95rem' }}
                    >
                      {selectedReq.customer_phone} ↗
                    </a>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Color Palette / Theme</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                    {selectedReq.palette || 'Not specified'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Approximate Budget</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                    {selectedReq.budget || 'Flexible'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Needed By Date</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                    {selectedReq.required_date || 'No deadline'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Current Status</div>
                  <select
                    value={selectedReq.status}
                    onChange={e => handleStatusChange(selectedReq.id, e.target.value)}
                    className={`badge badge-${selectedReq.status}`}
                    style={{ marginTop: '0.25rem', cursor: 'pointer', outline: 'none' }}
                  >
                    {CUSTOM_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--color-forest)', marginBottom: '0.4rem' }}>
                  Customer Design Description
                </h4>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--color-text-main)'
                }}>
                  {selectedReq.description}
                </div>
              </div>

              {/* Studio Admin Notes */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--color-forest)', marginBottom: '0.4rem' }}>
                  Studio Internal Notes (Quotes sent, photos approved, etc.)
                </h4>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Record WhatsApp conversation notes, deposit details, or flower color agreements..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.5rem' }}
                  onClick={handleSaveNotes}
                >
                  Save Internal Notes
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <a
                href={generateWhatsAppUrl(selectedReq)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={16} /> Contact Customer on WhatsApp
              </a>

              <button type="button" className="btn btn-secondary" onClick={() => setSelectedReq(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Custom Request"
        message={`Are you sure you want to delete custom request from "${deleteTarget?.customer_name}"?`}
        confirmText="Yes, Delete Request"
        danger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
