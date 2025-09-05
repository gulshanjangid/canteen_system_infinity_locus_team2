import type { MenuItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MenuItemForm from "@/components/admin/MenuItemForm"
import DeleteItemButton from "@/components/admin/DeleteItemButton"
import { Plus } from "lucide-react"

async function getAdminMenuItems(): Promise<MenuItem[]> {
  try {
    const { api } = await import("@/lib/api")
    const res = await api.getAdminMenu()
    const items = Array.isArray(res?.items) ? res.items : res
    return items.map((i: any) => ({
      id: i.id ?? i._id,
      name: i.name,
      description: i.description,
      price: typeof i.price_rupees === "number" ? i.price_rupees : (i.price_paise ? i.price_paise / 100 : 0),
      stockCount: i.stock_count ?? i.stockCount ?? 0,
      createdAt: i.created_at ?? i.createdAt ?? new Date().toISOString(),
      updatedAt: i.updated_at ?? i.updatedAt ?? new Date().toISOString(),
    })) as MenuItem[]
  } catch (error) {
    console.error("Error fetching admin menu items:", error)
    return []
  }
}

export default async function AdminPage() {
  const menuItems = await getAdminMenuItems()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your canteen menu items</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menu Items</CardTitle>
                <MenuItemForm>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </MenuItemForm>
              </CardHeader>
              <CardContent>
                {menuItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No menu items found. Create your first item!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.stockCount > 10
                                  ? "bg-green-100 text-green-800"
                                  : item.stockCount > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.stockCount} left
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <MenuItemForm item={item}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </MenuItemForm>
                              <DeleteItemButton itemId={item.id} itemName={item.name} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-medium">{menuItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Stock</span>
                    <span className="font-medium">{menuItems.filter((item) => item.stockCount > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Out of Stock</span>
                    <span className="font-medium">{menuItems.filter((item) => item.stockCount === 0).length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
