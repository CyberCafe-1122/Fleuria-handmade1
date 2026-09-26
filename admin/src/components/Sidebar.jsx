import React from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Sparkles,
  Star,
  FileText,
  Sliders,
  UserCheck,
  LogOut,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({
  currentRoute,
  onNavigate,
  isOpen,
  onClose,
  stats
}) {
  const { admin, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: stats?.summary?.totalProducts },
    { id: 'categories', label: 'Categories', icon: Tags },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: stats?.summary?.pendingOrders > 0 ? stats.summary.pendingOrders : null,
      badgeColor: 'var(--color-warning)'
    },
    {
      id: 'custom-orders',
      label: 'Custom Orders',
      icon: Sparkles,
      badge: stats?.summary?.pendingCustomOrders > 0 ? stats.summary.pendingCustomOrders : null,
      badgeColor: 'var(--color-rose)'
    },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'content', label: 'Website Content', icon: FileText },
    { id: 'settings', label: 'Store Settings', icon: Sliders },
    { id: 'profile', label: 'Admin Profile', icon: UserCheck }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(22, 39, 32, 0.5)',
            zIndex: 998
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--color-forest)',
          color: '#FAF7F2',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          position: isOpen ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          transform: isOpen ? 'translateX(0)' : undefined,
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              🌸
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: 1.1
              }}>
                Fleuria
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--color-rose)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Admin Studio
              </div>
            </div>
          </div>

          {isOpen && (
            <button
              onClick={onClose}
              style={{ color: '#FFFFFF', padding: '0.25rem', display: 'flex' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '0 0.75rem 0.5rem',
            letterSpacing: '0.08em'
          }}>
            Store Management
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--color-rose)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(250, 247, 242, 0.8)',
                  marginBottom: '0.25rem',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={18} style={{ opacity: isActive ? 1 : 0.85 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: item.badgeColor || 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick link to client storefront */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <a
              href="http://localhost:5000/client/"
              target="_blank"
              rel="noreferrer"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                color: 'var(--color-gold-light)',
                backgroundColor: 'rgba(197, 160, 89, 0.15)',
                border: '1px solid rgba(197, 160, 89, 0.25)'
              }}
            >
              <ExternalLink size={16} />
              <span>Live Website Preview</span>
            </a>
          </div>
        </nav>

        {/* User profile & logout */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-forest-dark)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-rose)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.8rem',
              flexShrink: 0
            }}>
              {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.email}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF8A80'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
