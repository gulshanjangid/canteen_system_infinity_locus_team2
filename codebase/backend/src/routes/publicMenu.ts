import { Router } from 'express';
import { MenuItem } from '../models/MenuItem';

const router = Router();

router.get('/menu', async (_req, res) => {
  const items = await MenuItem.find({ is_deleted: false, is_available: true }).sort({ created_at: -1 }).lean();
  const data = items.map(i => ({
    id: i._id,
    name: i.name,
    description: i.description,
    price_rupees: (i.price_paise / 100),
    stock_count: i.stock_count,
    image_url: i.image_url,
  }));
  return res.json({ data });
});

export default router;


