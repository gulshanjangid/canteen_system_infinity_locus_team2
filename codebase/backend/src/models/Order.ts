import { Schema, model } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'failed';

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price_paise: number;
}

export interface OrderDoc {
  _id: string; // uuid
  client_id?: string; // demo identifier
  status: OrderStatus;
  items: OrderItem[];
  total_price_paise: number;
  created_at: Date;
  expires_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  menu_item_id: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price_paise: { type: Number, required: true, min: 0 },
}, { _id: false });

const OrderSchema = new Schema<OrderDoc>({
  _id: { type: String, required: true },
  client_id: { type: String },
  status: { type: String, required: true, enum: ['pending','confirmed','cancelled','completed','failed'], default: 'pending' },
  items: { type: [OrderItemSchema], required: true },
  total_price_paise: { type: Number, required: true, min: 0 },
  created_at: { type: Date, required: true, default: () => new Date() },
  expires_at: { type: Date, required: true },
  updated_at: { type: Date, required: true, default: () => new Date() },
});

OrderSchema.index({ status: 1, expires_at: 1 });
OrderSchema.index({ client_id: 1, created_at: -1 });

OrderSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Order = model<OrderDoc>('orders', OrderSchema);


