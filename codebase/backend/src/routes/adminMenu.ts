import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { MenuItem } from '../models/MenuItem';

const router = Router();

const upsertSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price_rupees: z.number().nonnegative(),
  stock_count: z.number().int().nonnegative(),
  is_available: z.boolean().optional().default(true),
  image_url: z.string().url().optional(),
});

router.post('/admin/menu', async (req, res) => {
  const parse = upsertSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { name, description, price_rupees, stock_count, is_available, image_url } = parse.data;
  const _id = uuidv4();
  const price_paise = Math.round(price_rupees * 100);
  const now = new Date();
  const doc = new MenuItem({ _id, name, description, price_paise, stock_count, is_available: is_available ?? true, image_url, is_deleted: false, created_at: now, updated_at: now });
  await doc.save();
  return res.json({ data: { id: _id } });
});

router.get('/admin/menu', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
  const [items, total] = await Promise.all([
    MenuItem.find({}).sort({ created_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    MenuItem.countDocuments({}),
  ]);
  const data = items.map(i => ({
    id: i._id,
    name: i.name,
    description: i.description,
    price_rupees: (i.price_paise / 100),
    stock_count: i.stock_count,
    is_available: i.is_available,
    image_url: i.image_url,
    is_deleted: i.is_deleted,
    created_at: i.created_at,
    updated_at: i.updated_at,
    deleted_at: i.deleted_at ?? null,
  }));
  return res.json({ data: { items: data, page, pageSize, total } });
});

router.get('/admin/menu/:itemId', async (req, res) => {
  const item = await MenuItem.findById(req.params.itemId).lean();
  if (!item) return res.status(404).json({ error: { message: 'Not found' } });
  return res.json({ data: {
    id: item._id,
    name: item.name,
    description: item.description,
    price_rupees: (item.price_paise / 100),
    stock_count: item.stock_count,
    is_available: item.is_available,
    image_url: item.image_url,
    is_deleted: item.is_deleted,
    created_at: item.created_at,
    updated_at: item.updated_at,
    deleted_at: item.deleted_at ?? null,
  }});
});

router.put('/admin/menu/:itemId', async (req, res) => {
  const parse = upsertSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const payload = parse.data as any;
  if (payload.price_rupees !== undefined) payload.price_paise = Math.round(payload.price_rupees * 100);
  delete payload.price_rupees;
  payload.updated_at = new Date();
  const updated = await MenuItem.findOneAndUpdate({ _id: req.params.itemId }, { $set: payload }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: { message: 'Not found' } });
  return res.json({ data: { id: updated._id } });
});

router.delete('/admin/menu/:itemId', async (req, res) => {
  const now = new Date();
  const updated = await MenuItem.findOneAndUpdate({ _id: req.params.itemId, is_deleted: { $ne: true } }, { $set: { is_deleted: true, deleted_at: now, updated_at: now } }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: { message: 'Not found or already deleted' } });
  return res.json({ data: { id: updated._id, deleted: true } });
});

export default router;


