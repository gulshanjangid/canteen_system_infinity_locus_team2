import { Schema, model } from 'mongoose';

export interface MenuItemDoc {
  _id: string; // uuid
  name: string;
  description: string;
  price_paise: number; // store in paise for precision
  stock_count: number;
  is_available: boolean;
  image_url?: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

const MenuItemSchema = new Schema<MenuItemDoc>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price_paise: { type: Number, required: true, min: 0 },
  stock_count: { type: Number, required: true, min: 0, default: 0 },
  is_available: { type: Boolean, required: true, default: true },
  image_url: { type: String },
  is_deleted: { type: Boolean, required: true, default: false },
  created_at: { type: Date, required: true, default: () => new Date() },
  updated_at: { type: Date, required: true, default: () => new Date() },
  deleted_at: { type: Date, default: null },
});

MenuItemSchema.index({ is_deleted: 1, is_available: 1 });

MenuItemSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const MenuItem = model<MenuItemDoc>('menu_items', MenuItemSchema);


