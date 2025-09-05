import { Router } from 'express';
import { Order } from '../models/Order';
import { MenuItem } from '../models/MenuItem';

const router = Router();

router.post('/admin/jobs/run-cancellations', async (_req, res) => {
  const now = new Date();
  const expired = await Order.find({ status: 'pending', expires_at: { $lte: now } });
  let cancelled = 0;
  for (const order of expired) {
    for (const it of order.items) {
      await MenuItem.updateOne({ _id: it.menu_item_id }, { $inc: { stock_count: it.quantity }, $set: { updated_at: new Date() } });
    }
    order.status = 'cancelled';
    order.updated_at = new Date();
    await order.save();
    cancelled += 1;
  }
  return res.json({ data: { cancelled } });
});

export default router;


