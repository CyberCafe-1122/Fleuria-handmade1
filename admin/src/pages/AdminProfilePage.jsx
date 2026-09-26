import React, { useState } from 'react';
import { UserCheck, Lock, Mail, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../utils/api.js';

export default function AdminProfilePage() {
  const { admin, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, email });
      updateProfile(res.admin);
      showToast('Admin profile updated successfully! 🌸');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      showToast('Password changed successfully! Keep it safe. 🔒');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Admin Account & Security</h2>
          <p className="page-subtitle">
            Manage your credentials, studio administrator profile, and login passwords.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="card-title">Profile Information</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Display name & notification email</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="profName">Admin Name *</label>
              <input
                id="profName"
                type="text"
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profEmail">Login & Recovery Email *</label>
              <input
                id="profEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">System Role</label>
              <input
                type="text"
                className="form-control"
                value={admin?.role || 'superadmin'}
                disabled
                style={{ backgroundColor: 'var(--color-cream)', cursor: 'not-allowed' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
              style={{ marginTop: '0.5rem' }}
            >
              <Save size={16} />
              <span>{savingProfile ? 'Saving...' : 'Update Profile'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-rose-dark)' }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 className="card-title">Change Password</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Secure bcrypt encrypted credentials</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="curPass">Current Password *</label>
              <input
                id="curPass"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPass">New Password *</label>
              <input
                id="newPass"
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confPass">Confirm New Password *</label>
              <input
                id="confPass"
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-rose"
              disabled={savingPassword}
              style={{ marginTop: '0.5rem' }}
            >
              <Lock size={16} />
              <span>{savingPassword ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
