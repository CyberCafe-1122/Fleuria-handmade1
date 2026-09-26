import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react';
import api from '../utils/api.js';
import { getImageUrl } from '../utils/imageUrl.js';

const PRESET_GALLERY = [
  { label: 'Pastel Tulips Bouquet', url: '/assets/images/pipe-cleaner-tulips.jpg' },
  { label: 'Sun-Kissed Sunflower', url: '/assets/images/pipe-cleaner-sunflower.jpg' },
  { label: 'Botanical Soy Candle', url: '/assets/images/botanical-candle.jpg' },
  { label: 'Eternal Roses Cloche', url: '/assets/images/preserved-roses.jpg' },
  { label: 'Forget-Me-Not Necklace', url: '/assets/images/resin-necklace.jpg' },
  { label: 'Floral Wax Sachets', url: '/assets/images/botanical-sachet.jpg' },
  { label: 'Grand Gift Hamper', url: '/assets/images/gift-hamper.jpg' },
  { label: 'Studio Hero Banner', url: '/assets/images/hero-banner.jpg' },
  { label: 'Artisan Maker Portrait', url: '/assets/images/artisan-maker.jpg' }
];

export default function ImageUploader({
  value,
  onChange,
  label = 'Product Image',
  hint = 'Upload from computer, select from preset gallery, or enter an image URL.'
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url' | 'gallery'
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.upload('/admin/upload', formData);
      if (res.url) {
        onChange(res.url);
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ fontSize: '0.75rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <X size={12} /> Remove Image
          </button>
        )}
      </div>

      {value && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem',
          backgroundColor: 'var(--color-cream)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.75rem'
        }}>
          <img
            src={getImageUrl(value)}
            alt="Preview"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)'
            }}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-forest)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              Selected Image
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {value}
            </div>
          </div>
          <span className="badge badge-in_stock" style={{ fontSize: '0.7rem' }}>
            <Check size={12} /> Active
          </span>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '0.75rem'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderBottom: activeTab === 'upload' ? '2px solid var(--color-forest)' : '2px solid transparent',
            color: activeTab === 'upload' ? 'var(--color-forest)' : 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <UploadCloud size={14} /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderBottom: activeTab === 'gallery' ? '2px solid var(--color-forest)' : '2px solid transparent',
            color: activeTab === 'gallery' ? 'var(--color-forest)' : 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <ImageIcon size={14} /> Studio Gallery
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderBottom: activeTab === 'url' ? '2px solid var(--color-forest)' : '2px solid transparent',
            color: activeTab === 'url' ? 'var(--color-forest)' : 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <LinkIcon size={14} /> Image URL
        </button>
      </div>

      {activeTab === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            style={{ display: 'none' }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-white)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-rose)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={24} className="animate-spin" color="var(--color-rose)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Uploading image to storage...</span>
              </div>
            ) : (
              <div>
                <UploadCloud size={32} color="var(--color-rose)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                  Click to browse or drop an image here
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                  PNG, JPG, WebP up to 10MB
                </div>
              </div>
            )}
          </div>
          {uploadError && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              {uploadError}
            </div>
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '0.65rem',
          maxHeight: '190px',
          overflowY: 'auto',
          padding: '0.25rem'
        }}>
          {PRESET_GALLERY.map(item => (
            <div
              key={item.url}
              onClick={() => onChange(item.url)}
              style={{
                border: value === item.url ? '2px solid var(--color-rose)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: 'var(--color-white)',
                position: 'relative'
              }}
            >
              <img
                src={getImageUrl(item.url)}
                alt={item.label}
                style={{ width: '100%', height: '70px', objectFit: 'cover' }}
              />
              <div style={{
                fontSize: '0.7rem',
                padding: '0.25rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'var(--color-forest)'
              }}>
                {item.label}
              </div>
              {value === item.url && (
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  background: 'var(--color-rose)',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Check size={10} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'url' && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="url"
            className="form-control"
            placeholder="https://... or assets/images/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyUrl())}
          />
          <button type="button" className="btn btn-secondary" onClick={handleApplyUrl}>
            Apply
          </button>
        </div>
      )}

      {hint && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.4rem' }}>
          {hint}
        </div>
      )}
    </div>
  );
}
