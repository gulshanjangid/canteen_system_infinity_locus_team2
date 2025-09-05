// Type definitions for the Canteen Ordering System
export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  stockCount: number
  createdAt: string // ISO 8601 date string
  updatedAt: string // ISO 8601 date string
}

export type Order = {
  id: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "FAILED"
  totalPrice: number
  createdAt: string // ISO 8601 date string
  expiresAt: string // ISO 8601 date string
  items: Array<{
    quantity: number
    menuItem: Omit<MenuItem, "stockCount"> // Stock count isn't relevant for a placed order
  }>
}

export type CartItem = {
  menuItemId: string
  name: string
  price: number
  quantity: number
}
