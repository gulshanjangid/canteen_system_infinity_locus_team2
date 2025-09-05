import { Router } from 'express';
import path from 'path';
import { createMulter } from '../startup/uploads';

const router = Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const upload = createMulter(uploadsDir);

router.post('/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded' } });
  const url = `/uploads/${req.file.filename}`;
  return res.json({ data: { url } });
});

export default router;


