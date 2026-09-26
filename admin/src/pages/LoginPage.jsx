import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('Iness@Fleuria.com');
    setPassword('iness2131');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FAF7F2 0%, #F3ECE2 50%, #FAF7F2 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative floral background accents */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201, 125, 120, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(32, 58, 47, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-rose-light)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 14px rgba(201, 125, 120, 0.2)'
          }}>
            🌸
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-forest)', marginBottom: '0.25rem' }}>
            Fleuria Handmade
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Studio Management & Artisan Dashboard
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(211, 47, 47, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="adminEmail">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="adminEmail"
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Iness@Fleuria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail
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
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="adminPassword">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)',
                  padding: '0.25rem'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Panel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials quick button */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-rose-dark)',
              backgroundColor: 'var(--color-rose-light)',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(201, 125, 120, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={14} />
            <span>Click to fill default credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
