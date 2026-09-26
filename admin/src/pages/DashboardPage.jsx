import React from 'react';
import {
  Package,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export default function DashboardPage({ stats, onNavigate }) {
  const summary = stats?.summary || {
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomOrders: 0,
    pendingCustomOrders: 0
  };

  const recentOrders = stats?.recentOrders || [];
  const recentCustomOrders = stats?.recentCustomOrders || [];
  const categoryStats = stats?.categoryStats || [];
  const statusStats = stats?.statusStats || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle floral watermark in background */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          fontSize: '9rem',
          opacity: 0.12,
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          🌸
        </div>

        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '0.65rem'
          }}>
            <Sparkles size={12} color="var(--color-gold)" /> Fleuria Artisan Studio
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>
            Handmade Operations Overview
          </h2>
          <p style={{ color: 'rgba(250, 247, 242, 0.85)', fontSize: '0.925rem', maxWidth: '580px' }}>
            Manage handcrafted bouquets, botanical candles, and direct WhatsApp customer orders in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => onNavigate('products')}
            className="btn btn-rose"
          >
            <Plus size={16} /> Add Product
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }}
          >
            View Orders ({summary.totalOrders})
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Total Products */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('products')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Products</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-cream-dark)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-forest)', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-forest)' }}>
            {summary.totalProducts}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{summary.activeProducts} Active</span>
            <span>•</span>
            <span style={{ color: summary.outOfStockProducts > 0 ? 'var(--color-danger)' : 'var(--color-text-light)' }}>
              {summary.outOfStockProducts} Out of stock
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('orders')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Orders</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-cream-dark)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-forest)', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-forest)' }}>
            {summary.totalOrders}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: summary.pendingOrders > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)', fontWeight: 600 }}>
              {summary.pendingOrders} Pending
            </span>
            <span>•</span>
            <span style={{ color: 'var(--color-success)' }}>{summary.completedOrders} Delivered</span>
          </div>
        </div>

        {/* Custom Orders / Bespoke */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('custom-orders')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Custom Requests</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-rose-light)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-rose-dark)', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-forest)' }}>
            {summary.totalCustomOrders}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
            <span style={{ color: summary.pendingCustomOrders > 0 ? 'var(--color-rose-dark)' : 'var(--color-text-muted)', fontWeight: 600 }}>
              {summary.pendingCustomOrders} In progress / awaiting quotation
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Confirmed Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-gold)', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-forest)' }}>
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.35rem' }}>
            Excluding cancelled orders
          </div>
        </div>
      </div>

      {/* Visual Charts & Category Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Products by Category Bar */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Products by Category</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Catalog distribution across craft collections</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('categories')}>
              Manage Categories
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryStats.map(cat => {
              const maxCount = Math.max(...categoryStats.map(c => c.product_count), 1);
              const pct = Math.round((cat.product_count / maxCount) * 100);

              return (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{cat.product_count} items</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--color-cream-dark)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: 'var(--color-forest)',
                      borderRadius: 'var(--radius-pill)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Order Status Flow</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Active customer pipelines</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>
              All Orders
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {statusStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-light)' }}>
                No orders placed yet.
              </div>
            ) : (
              statusStats.map(st => (
                <div
                  key={st.status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--color-cream)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <span className={`badge badge-${st.status}`}>{st.status}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{st.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Recent Custom Commissions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Store Orders</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>WhatsApp checkout submissions</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              style={{ fontSize: '0.85rem', color: 'var(--color-rose-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
              No recent orders found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  style={{
                    padding: '0.85rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-white)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                        {order.order_number}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                        {order.customer_name}
                      </span>
                    </div>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                    {order.items?.map(i => `${i.quantity}× ${i.title}`).join(', ')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-text-light)' }}>{formatDate(order.created_at)}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-forest)', fontSize: '0.9rem' }}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Custom Requests */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Custom Commissions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bespoke wedding & floral briefs</p>
            </div>
            <button
              onClick={() => onNavigate('custom-orders')}
              style={{ fontSize: '0.85rem', color: 'var(--color-rose-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentCustomOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
              No custom commission requests yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentCustomOrders.map(req => (
                <div
                  key={req.id}
                  style={{
                    padding: '0.85rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-white)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.9rem' }}>
                        {req.customer_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-rose-dark)', fontWeight: 600 }}>
                        {req.project_type}
                      </div>
                    </div>
                    <span className={`badge badge-${req.status}`}>{req.status}</span>
                  </div>

                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    margin: '0.4rem 0',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {req.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    <span>Budget: <strong style={{ color: 'var(--color-forest)' }}>{req.budget || 'Flexible'}</strong></span>
                    <span>{formatDate(req.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1.5fr 1fr"],
          div[style*="grid-template-columns: 1.2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
