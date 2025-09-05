import type { MenuItem, Order } from "@/types"

// Shared in-memory data store
class DataStore {
  private static instance: DataStore
  private menuItems: MenuItem[] = [
    {
      id: "1",
      name: "Chicken Sandwich",
      description: "Grilled chicken breast with lettuce, tomato, and mayo on fresh bread",
      price: 8.99,
      stockCount: 15,
    },
    {
      id: "2",
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with parmesan cheese, croutons, and caesar dressing",
      price: 7.5,
      stockCount: 8,
    },
    {
      id: "3",
      name: "Beef Burger",
      description: "Juicy beef patty with cheese, pickles, onions, and special sauce",
      price: 12.99,
      stockCount: 0,
    },
    {
      id: "4",
      name: "Vegetable Soup",
      description: "Hearty soup with seasonal vegetables and herbs",
      price: 5.99,
      stockCount: 20,
    },
  ]

  private orders: Order[] = []

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore()
    }
    return DataStore.instance
  }

  // Menu Items methods
  getMenuItems(): MenuItem[] {
    return [...this.menuItems]
  }

  getAvailableMenuItems(): MenuItem[] {
    return this.menuItems.filter((item) => item.stockCount > 0)
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems.find((item) => item.id === id)
  }

  addMenuItem(item: Omit<MenuItem, "id">): MenuItem {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
    }
    this.menuItems.push(newItem)
    return newItem
  }

  updateMenuItem(id: string, updates: Partial<Omit<MenuItem, "id">>): MenuItem | null {
    const index = this.menuItems.findIndex((item) => item.id === id)
    if (index === -1) return null

    this.menuItems[index] = { ...this.menuItems[index], ...updates }
    return this.menuItems[index]
  }

  deleteMenuItem(id: string): boolean {
    const index = this.menuItems.findIndex((item) => item.id === id)
    if (index === -1) return false

    this.menuItems.splice(index, 1)
    return true
  }

  updateStock(id: string, quantity: number): boolean {
    const item = this.menuItems.find((item) => item.id === id)
    if (!item || item.stockCount < quantity) return false

    item.stockCount -= quantity
    return true
  }

  // Orders methods
  getOrders(): Order[] {
    return [...this.orders]
  }

  getAllOrders(): Order[] {
    return [...this.orders]
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((order) => order.id === id)
  }

  addOrder(order: Omit<Order, "id">): Order {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
    }
    this.orders.push(newOrder)
    return newOrder
  }
}

export const dataStore = DataStore.getInstance()
