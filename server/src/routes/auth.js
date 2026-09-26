import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const secret = process.env.JWT_SECRET || 'fleuria_secret_artisan_floral_key_2026_super_secure';

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An unexpected server error occurred during login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Check email collision
    const existing = db.prepare('SELECT id FROM admins WHERE LOWER(email) = LOWER(?) AND id != ?').get(email.trim(), req.admin.id);
    if (existing) {
      return res.status(400).json({ error: 'This email is already in use by another admin.' });
    }

    db.prepare('UPDATE admins SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name.trim(), email.toLowerCase().trim(), req.admin.id);

    const updated = db.prepare('SELECT id, email, name, role FROM admins WHERE id = ?').get(req.admin.id);
    res.json({ message: 'Profile updated successfully', admin: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/auth/password
router.put('/password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const admin = db.prepare('SELECT password_hash FROM admins WHERE id = ?').get(req.admin.id);
    if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newHash, req.admin.id);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
