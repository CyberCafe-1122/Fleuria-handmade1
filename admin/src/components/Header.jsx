import React from 'react';
import { Menu, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header({
  pageTitle,
  pageSubtitle,
  onToggleSidebar,
  onRefresh,
  refreshing = false
}) {
  const { admin } = useAuth();

  return (
    <header style={{
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0.85rem 2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-icon"
          style={{ display: 'none' }}
          id="btnMobileToggle"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', margin: 0, lineHeight: 1.2 }}>
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            title="Refresh Data"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span style={{ display: 'inline-block' }}>Sync</span>
          </button>
        )}

        {/* View Public Storefront Link */}
        <a
          href="http://localhost:5000/client/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-rose btn-sm"
          title="Open customer-facing website"
        >
          <ExternalLink size={14} />
          <span>View Public Storefront</span>
        </a>

        {/* Admin Avatar Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.65rem',
          backgroundColor: 'var(--color-cream)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          marginLeft: '0.5rem'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-forest)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            {admin?.name?.substring(0, 1) || 'A'}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-forest)' }}>
            {admin?.name?.split(' ')[0] || 'Admin'}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #btnMobileToggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
