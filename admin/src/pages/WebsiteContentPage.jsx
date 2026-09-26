import React, { useState, useEffect } from 'react';
import { Save, Sparkles, FileText, Image as ImageIcon, Heart, ShieldCheck, Globe, Loader2 } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import ImageUploader from '../components/ImageUploader.jsx';

export default function WebsiteContentPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'about' | 'care' | 'footer'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content state
  const [content, setContent] = useState({
    hero: {
      badge: '✦ 100% Handcrafted • Hand-Poured in Small Batches',
      title: 'Everlasting Floral Artistry, Crafted with Love',
      subtitle: 'Discover hand-sculpted pipe cleaner flower bouquets that never wilt, hand-poured botanical soy candles, and bespoke gifts. Connect directly with our artisan team on WhatsApp for custom orders and instant purchasing.',
      buttonPrimaryText: 'Explore Handcrafted Blooms',
      buttonWaText: 'Order via WhatsApp',
      image: 'assets/images/hero-banner.jpg',
      floatingCardTitle: '100% Hand-Sculpted',
      floatingCardSubtitle: 'Velvety petals that never wither'
    },
    about: {
      tag: 'Meet The Maker',
      heading: 'Handcrafted with Intention, Cherished for a Lifetime',
      quote: 'Every stem is sculpted by hand, every petal is shaped with care, and every candle is poured with pure organic botanical oils. We treat each order as an heirloom piece for someone you cherish.',
      p1: 'Fleuria was born out of a deep passion for botanical wonder and the desire to create flowers that outlive fleeting moments. Fresh blooms bring joy for a few days, but our pipe cleaner and preserved florals hold sentimental memories that never fade.',
      p2: 'We pride ourselves on personal customer connections. When you message us on WhatsApp, you\'re talking directly with the maker who crafts your bouquet and hand-pours your candles.',
      image: 'assets/images/artisan-maker.jpg',
      statNumber: '2,400+',
      statLabel: 'Keepsake Blooms Hand-Crafted'
    },
    care_guide: [
      {
        icon: '✨',
        title: 'Pipe Cleaner Flowers Care',
        text: 'Keep in a dry indoor spot away from water. Bend and pose the flexible stems into your favorite arrangement whenever you wish. To remove dust, gently brush with a soft dry makeup brush or blow with cool, low hairdryer air.'
      },
      {
        icon: '🕯️',
        title: 'Botanical Candle Burn Care',
        text: 'Always trim the wooden wick to 1/4 inch before lighting. Allow the top wax layer to completely melt to the edges during the first burn to prevent tunneling and optimize fragrance throw.'
      },
      {
        icon: '🌹',
        title: 'Preserved Roses Cloche Care',
        text: 'Preserved flowers need zero watering! Keep the glass cloche closed in an air-conditioned or ambient room away from harsh direct sunlight to preserve vibrant petal pigmentation for 3+ years.'
      }
    ],
    footer: {
      description: 'Artisan Pipe Cleaner Florals, Botanical Candles & Handcrafted Gifts. Each creation is made slowly and sustainably to bring everlasting botanical wonder to your home.',
      email: 'orders@fleuriahandmade.com',
      phone: '+213 555 81 25 64',
      whatsapp: '213555812564',
      instagram: '@fleuria.handmade',
      copyright: '© 2026 Fleuria Handmade. All rights reserved. Artisan Crafted with Love.'
    }
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/content');
      if (res.content) {
        setContent(prev => ({
          ...prev,
          ...res.content
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleHeroChange = (field, value) => {
    setContent(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const handleAboutChange = (field, value) => {
    setContent(prev => ({ ...prev, about: { ...prev.about, [field]: value } }));
  };

  const handleCareChange = (index, field, value) => {
    setContent(prev => {
      const updated = [...prev.care_guide];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, care_guide: updated };
    });
  };

  const handleFooterChange = (field, value) => {
    setContent(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  };

  const handleSaveSection = async (sectionKey) => {
    setSaving(true);
    try {
      await api.put(`/admin/content/${sectionKey}`, { data: content[sectionKey] });
      showToast(`Website "${sectionKey.replace('_', ' ')}" section updated! Changes will appear on live website. ✨`);
    } catch (err) {
      showToast(err.message || `Failed to update ${sectionKey}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        Loading website CMS content...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Website Content Management (CMS)</h2>
          <p className="page-subtitle">
            Edit text, headings, and images across the public storefront without touching source code.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'hero', label: 'Hero Banner Section', icon: Sparkles },
          { id: 'about', label: 'Meet The Maker / About', icon: Heart },
          { id: 'care', label: 'Floral Care Guide', icon: ShieldCheck },
          { id: 'footer', label: 'Footer & Socials', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive ? 'var(--color-forest)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '3px solid var(--color-forest)' : '3px solid transparent',
                backgroundColor: 'transparent',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Section Tab */}
      {activeTab === 'hero' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Homepage Hero Section</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                First impression when visitors land on Fleuria Handmade
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleSaveSection('hero')}
              disabled={saving}
            >
              <Save size={16} /> Save Hero Section
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Hero Badge Text</label>
            <input
              type="text"
              className="form-control"
              value={content.hero.badge || ''}
              onChange={e => handleHeroChange('badge', e.target.value)}
              placeholder="✦ 100% Handcrafted • Hand-Poured in Small Batches"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Main Heading</label>
            <input
              type="text"
              className="form-control"
              value={content.hero.title || ''}
              onChange={e => handleHeroChange('title', e.target.value)}
              placeholder="Everlasting Floral Artistry, Crafted with Love"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Subtitle / Description</label>
            <textarea
              rows={3}
              className="form-control"
              value={content.hero.subtitle || ''}
              onChange={e => handleHeroChange('subtitle', e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Primary Button Text (Catalog Link)</label>
              <input
                type="text"
                className="form-control"
                value={content.hero.buttonPrimaryText || ''}
                onChange={e => handleHeroChange('buttonPrimaryText', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Button Text</label>
              <input
                type="text"
                className="form-control"
                value={content.hero.buttonWaText || ''}
                onChange={e => handleHeroChange('buttonWaText', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Floating Highlight Card Title</label>
              <input
                type="text"
                className="form-control"
                value={content.hero.floatingCardTitle || ''}
                onChange={e => handleHeroChange('floatingCardTitle', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Floating Highlight Card Subtitle</label>
              <input
                type="text"
                className="form-control"
                value={content.hero.floatingCardSubtitle || ''}
                onChange={e => handleHeroChange('floatingCardSubtitle', e.target.value)}
              />
            </div>
          </div>

          <ImageUploader
            label="Hero Showcase Image"
            value={content.hero.image}
            onChange={url => handleHeroChange('image', url)}
            hint="Displays next to the hero headline on the desktop website."
          />
        </div>
      )}

      {/* About Section Tab */}
      {activeTab === 'about' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Meet the Maker / About the Studio</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Tell the story of how Fleuria flowers and candles are made
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleSaveSection('about')}
              disabled={saving}
            >
              <Save size={16} /> Save About Section
            </button>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Section Tag</label>
              <input
                type="text"
                className="form-control"
                value={content.about.tag || ''}
                onChange={e => handleAboutChange('tag', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Main Heading</label>
              <input
                type="text"
                className="form-control"
                value={content.about.heading || ''}
                onChange={e => handleAboutChange('heading', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Artisan Quote</label>
            <textarea
              rows={2}
              className="form-control"
              value={content.about.quote || ''}
              onChange={e => handleAboutChange('quote', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">First Story Paragraph</label>
            <textarea
              rows={3}
              className="form-control"
              value={content.about.p1 || ''}
              onChange={e => handleAboutChange('p1', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Second Story Paragraph</label>
            <textarea
              rows={3}
              className="form-control"
              value={content.about.p2 || ''}
              onChange={e => handleAboutChange('p2', e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Statistic Number</label>
              <input
                type="text"
                className="form-control"
                value={content.about.statNumber || ''}
                onChange={e => handleAboutChange('statNumber', e.target.value)}
                placeholder="2,400+"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Statistic Description</label>
              <input
                type="text"
                className="form-control"
                value={content.about.statLabel || ''}
                onChange={e => handleAboutChange('statLabel', e.target.value)}
                placeholder="Keepsake Blooms Hand-Crafted"
              />
            </div>
          </div>

          <ImageUploader
            label="Artisan Maker Studio Portrait"
            value={content.about.image}
            onChange={url => handleAboutChange('image', url)}
          />
        </div>
      )}

      {/* Care Guide Tab */}
      {activeTab === 'care' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Botanical Care Guide Instructions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Instructions provided to customers to keep creations lasting for years
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleSaveSection('care_guide')}
              disabled={saving}
            >
              <Save size={16} /> Save Care Guide
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {content.care_guide.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-cream)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="form-row-2" style={{ marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Icon Emoji</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.icon || ''}
                      onChange={e => handleCareChange(idx, 'icon', e.target.value)}
                      style={{ maxWidth: '80px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Card Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.title || ''}
                      onChange={e => handleCareChange(idx, 'title', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Care Instructions Text</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={item.text || ''}
                    onChange={e => handleCareChange(idx, 'text', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer & Socials Tab */}
      {activeTab === 'footer' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Website Footer Information</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Bottom branding, customer care links, and social credentials
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleSaveSection('footer')}
              disabled={saving}
            >
              <Save size={16} /> Save Footer Details
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Footer Brand Story / Description</label>
            <textarea
              rows={3}
              className="form-control"
              value={content.footer.description || ''}
              onChange={e => handleFooterChange('description', e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Studio Email Address</label>
              <input
                type="email"
                className="form-control"
                value={content.footer.email || ''}
                onChange={e => handleFooterChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Display Phone / WhatsApp</label>
              <input
                type="text"
                className="form-control"
                value={content.footer.phone || ''}
                onChange={e => handleFooterChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Instagram Handle / URL</label>
              <input
                type="text"
                className="form-control"
                value={content.footer.instagram || ''}
                onChange={e => handleFooterChange('instagram', e.target.value)}
                placeholder="@fleuria.handmade"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Copyright Notice</label>
              <input
                type="text"
                className="form-control"
                value={content.footer.copyright || ''}
                onChange={e => handleFooterChange('copyright', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
