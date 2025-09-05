import fs from 'fs';
import path from 'path';
import multer from 'multer';

export function ensureUploadsDir(root: string): string {
  const dir = path.join(root, 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function createMulter(uploadsDir: string) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname || '') || '.bin';
      cb(null, unique + ext);
    },
  });
  return multer({ storage });
}


