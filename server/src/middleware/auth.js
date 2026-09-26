import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please login.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fleuria_secret_artisan_floral_key_2026_super_secure';

    const decoded = jwt.verify(token, secret);
    const admin = db.prepare('SELECT id, email, name, role FROM admins WHERE id = ?').get(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: 'User no longer exists or session expired.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}
