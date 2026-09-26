import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

const router = express.Router();

// POST /api/admin/upload (Single image upload)
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    // Relative URL for storage
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to process image upload.' });
  }
});

// POST /api/admin/upload/multiple (Multiple images upload)
router.post('/multiple', requireAuth, upload.array('images', 8), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    const files = req.files.map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      size: f.size
    }));

    res.json({
      message: 'Images uploaded successfully',
      files,
      urls: files.map(f => f.url)
    });
  } catch (err) {
    console.error('Multiple image upload error:', err);
    res.status(500).json({ error: 'Failed to process image uploads.' });
  }
});

// DELETE /api/admin/upload/:filename
router.delete('/:filename', requireAuth, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: 'File deleted successfully' });
    }

    res.status(404).json({ error: 'File not found' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
});

export default router;
