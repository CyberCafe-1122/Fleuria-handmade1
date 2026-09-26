import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MessageCircle,
  Eye,
  Trash2,
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';
import api from '../utils/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { getImageUrl } from '../utils/imageUrl.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const STATUS_LIST = [
  'New',
  'Pending Confirmation',
  'Confirmed',
  'Preparing',
  'Ready to Dispatch',
  'Shipped',
  'Delivered',
  'Cancelled'
];

export default function OrdersPage({ onStatsChange }) {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Order for detail view modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(res.orders || []);
    } catch (err) {
      showToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Order status updated to "${newStatus}"! ✨`);
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/orders/${deleteTarget.id}`);
      showToast(`Order ${deleteTarget.order_number} deleted.`);
      setDeleteTarget(null);
      if (selectedOrder?.id === deleteTarget.id) setSelectedOrder(null);
      fetchOrders();
      if (onStatsChange) onStatsChange();
    } catch (err) {
      showToast(err.message || 'Failed to delete order', 'error');
    }
  };

  const generateWhatsAppChatUrl = (order) => {
    const cleanPhone = (order.customer_phone || '').replace(/[^\d]/g, '');
    const greeting = encodeURIComponent(
      `Hello ${order.customer_name}! 🌸 This is Fleuria Handmade regarding your order (${order.order_number}). We are preparing your handcrafted flowers with love!`
    );
    return `https://wa.me/${cleanPhone}?text=${greeting}`;
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.toLowerCase().includes(q) ||
      o.city_wilaya.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders Management</h2>
          <p className="page-subtitle">
            Track customer orders, delivery details, and WhatsApp communication pipelines.
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
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by Order ID, customer name, phone, or city..."
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

          {/* Status Filter */}
          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Order Statuses ({orders.length})</option>
              {STATUS_LIST.map(st => {
                const count = orders.filter(o => o.status === st).length;
                return (
                  <option key={st} value={st}>
                    {st} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>City / Wilaya</th>
                <th>Products Ordered</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>No orders found</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      No orders match the current search or status filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                        {order.customer_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {order.customer_phone}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-forest)' }}>
                        {order.city_wilaya || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '240px' }}>
                        {order.items?.map((it, idx) => (
                          <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <strong>{it.quantity}×</strong> {it.title}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                        {formatCurrency(order.total)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        {order.shipping_fee === 0 ? 'Free Shipping' : `+${formatCurrency(order.shipping_fee)} ship`}
                      </div>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className={`badge badge-${order.status}`}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        {STATUS_LIST.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {/* WhatsApp direct chat link */}
                        <a
                          href={generateWhatsAppChatUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon"
                          style={{ color: '#25D366' }}
                          title="Chat with customer on WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>

                        {/* View Details */}
                        <button
                          className="btn-icon"
                          onClick={() => setSelectedOrder(order)}
                          title="View order details"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Delete */}
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteTarget(order)}
                          title="Delete order"
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  Order Details — {selectedOrder.order_number}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Placed on {formatDate(selectedOrder.created_at)}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Customer & Delivery Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.25rem',
                marginBottom: '1.5rem',
                padding: '1.25rem',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    Customer Details
                  </h4>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <strong>Name:</strong> {selectedOrder.customer_name}
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <strong>WhatsApp Phone:</strong>{' '}
                    <a
                      href={generateWhatsAppChatUrl(selectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#25D366', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      {selectedOrder.customer_phone} ↗
                    </a>
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>Payment Method:</strong> {selectedOrder.payment_method || 'Cash on Delivery'}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    Delivery Destination
                  </h4>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <strong>Address:</strong> {selectedOrder.delivery_address || '—'}
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <strong>City / Wilaya:</strong> {selectedOrder.city_wilaya || '—'}
                  </div>
                  {selectedOrder.gift_note && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--color-rose-light)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: 'var(--color-forest)'
                    }}>
                      <strong>💌 Gift Card Note:</strong> "{selectedOrder.gift_note}"
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '0.75rem' }}>
                Order Items ({selectedOrder.items?.length || 0})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-white)'
                    }}
                  >
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                      onError={e => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.9rem' }}>
                        {item.title}
                      </div>
                      {item.selected_options && typeof item.selected_options === 'object' && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {Object.entries(item.selected_options).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {item.quantity} × {formatCurrency(item.price)}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>Delivery Fee</span>
                  <span>{selectedOrder.shipping_fee === 0 ? 'FREE' : formatCurrency(selectedOrder.shipping_fee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-forest)', borderTop: '1px solid var(--color-border)', paddingTop: '0.4rem' }}>
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <a
                href={generateWhatsAppChatUrl(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={16} /> Open Customer WhatsApp Chat
              </a>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Order"
        message={`Are you sure you want to delete order "${deleteTarget?.order_number}" (${deleteTarget?.customer_name})?`}
        confirmText="Yes, Delete Order"
        danger={true}
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
