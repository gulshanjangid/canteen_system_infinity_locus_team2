import type { MenuItem } from "@/types"
import MenuItemCard from "@/components/customer/MenuItemCard"
import Cart from "@/components/customer/Cart"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import Link from "next/link"
import MenuItemForm from "@/components/admin/MenuItemForm"

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const { api } = await import("@/lib/api")
    const res = await api.getMenu()
    return res.map((i: any) => ({
      id: i.id ?? i._id,
      name: i.name,
      description: i.description,
      price: typeof i.price_rupees === "number" ? i.price_rupees : (i.price_paise ? i.price_paise / 100 : 0),
      stockCount: i.stock_count ?? i.stockCount ?? 0,
      createdAt: i.created_at ?? i.createdAt ?? new Date().toISOString(),
      updatedAt: i.updated_at ?? i.updatedAt ?? new Date().toISOString(),
    })) as MenuItem[]
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return []
  }
}

export default async function HomePage() {
  const menuItems = await getMenuItems()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Canteen Menu</h1>
              <p className="text-muted-foreground mt-2">Fresh food, made to order</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/orders/history">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <History className="h-4 w-4" />
                  Order History
                </Button>
              </Link>
              <MenuItemForm>
                <Button size="sm">Create Item</Button>
              </MenuItemForm>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-3">
            {menuItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No menu items available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-1">
            <Cart />
          </div>
        </div>
      </div>
    </div>
  )
}
