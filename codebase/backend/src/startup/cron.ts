import cron from 'node-cron';
import { Order } from '../models/Order';
import { MenuItem } from '../models/MenuItem';

export function startCron() {
  // every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const expired = await Order.find({ status: 'pending', expires_at: { $lte: now } });
    for (const order of expired) {
      for (const it of order.items) {
        await MenuItem.updateOne({ _id: it.menu_item_id }, { $inc: { stock_count: it.quantity }, $set: { updated_at: new Date() } });
      }
      order.status = 'failed';
      order.updated_at = new Date();
      await order.save();
    }
  });
}


