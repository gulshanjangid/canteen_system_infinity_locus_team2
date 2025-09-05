import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';

const router = Router();

const placeOrderSchema = z.object({
  client_id: z.string().uuid().optional(),
  items: z.array(z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
});

router.post('/orders', async (req, res) => {
  const parse = placeOrderSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { client_id, items } = parse.data;

  // Load items and ensure availability and stock
  const menuDocs = await MenuItem.find({ _id: { $in: items.map(i => i.itemId) }, is_deleted: false, is_available: true }).lean();
  const idToDoc = new Map(menuDocs.map(m => [m._id, m]));
  for (const it of items) {
    const m = idToDoc.get(it.itemId);
    if (!m) return res.status(404).json({ error: { message: `Item ${it.itemId} not found` } });
    if ((m.stock_count ?? 0) < it.quantity) return res.status(409).json({ error: { message: `Insufficient stock for ${m.name}` } });
  }

  // Simple decrement without Mongo transactions
  for (const it of items) {
    await MenuItem.updateOne({ _id: it.itemId, stock_count: { $gte: it.quantity } }, { $inc: { stock_count: -it.quantity }, $set: { updated_at: new Date() } });
  }

  const orderId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
  const orderItems = items.map(it => {
    const m = idToDoc.get(it.itemId)!;
    return { menu_item_id: m._id, name: m.name, quantity: it.quantity, price_paise: m.price_paise };
  });
  const total = orderItems.reduce((sum, i) => sum + i.price_paise * i.quantity, 0);

  await Order.create({ _id: orderId, client_id, status: 'pending', items: orderItems, total_price_paise: total, created_at: now, expires_at: expiresAt, updated_at: now });

  return res.json({ data: { id: orderId, expires_at: expiresAt.toISOString() } });
});

// Add items to an existing pending order and decrement stock
router.post('/orders/:orderId/add-items', async (req, res) => {
  const schema = z.object({ items: z.array(z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ error: { message: 'Order not found' } });
  if (order.status !== 'pending') return res.status(409).json({ error: { message: 'Only pending orders can be modified' } });

  const { items } = parse.data;
  const menuDocs = await MenuItem.find({ _id: { $in: items.map(i => i.itemId) }, is_deleted: false, is_available: true }).lean();
  const idToDoc = new Map(menuDocs.map(m => [m._id, m]));
  for (const it of items) {
    const m = idToDoc.get(it.itemId);
    if (!m) return res.status(404).json({ error: { message: `Item ${it.itemId} not found` } });
    if ((m.stock_count ?? 0) < it.quantity) return res.status(409).json({ error: { message: `Insufficient stock for ${m.name}` } });
  }
  for (const it of items) {
    await MenuItem.updateOne({ _id: it.itemId, stock_count: { $gte: it.quantity } }, { $inc: { stock_count: -it.quantity }, $set: { updated_at: new Date() } });
    const m = idToDoc.get(it.itemId)!;
    order.items.push({ menu_item_id: m._id, name: m.name, quantity: it.quantity, price_paise: m.price_paise });
    order.total_price_paise += m.price_paise * it.quantity;
  }
  order.updated_at = new Date();
  await order.save();
  return res.json({ data: { id: order._id, total_price_paise: order.total_price_paise } });
});

router.get('/orders/history', async (req, res) => {
  const clientId = typeof req.query.client_id === 'string' ? req.query.client_id : undefined;
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
  const filter: any = clientId ? { client_id: clientId } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ created_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    Order.countDocuments(filter),
  ]);
  return res.json({ data: { items: orders, page, pageSize, total } });
});

router.get('/orders/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId).lean();
  if (!order) return res.status(404).json({ error: { message: 'Not found' } });
  return res.json({ data: order });
});

router.post('/orders/:orderId/cancel', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ error: { message: 'Not found' } });
  if (order.status !== 'pending') return res.status(409).json({ error: { message: 'Only pending orders can be cancelled' } });
  // restore stock
  for (const it of order.items) {
    await MenuItem.updateOne({ _id: it.menu_item_id }, { $inc: { stock_count: it.quantity }, $set: { updated_at: new Date() } });
  }
  order.status = 'failed';
  order.updated_at = new Date();
  await order.save();
  return res.json({ data: { id: order._id, status: order.status } });
});

router.post('/orders/:orderId/confirm', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.orderId, { $set: { status: 'confirmed', updated_at: new Date() } }, { new: true }).lean();
  if (!order) return res.status(404).json({ error: { message: 'Not found' } });
  return res.json({ data: { id: order._id, status: order.status } });
});

router.post('/orders/:orderId/complete', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.orderId, { $set: { status: 'completed', updated_at: new Date() } }, { new: true }).lean();
  if (!order) return res.status(404).json({ error: { message: 'Not found' } });
  return res.json({ data: { id: order._id, status: order.status } });
});

export default router;


