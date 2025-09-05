import type { Order } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getAllOrders(): Promise<Order[]> {
  try {
    const { api } = await import("@/lib/api")
    const res = await api.getHistory()
    const items = Array.isArray(res?.items) ? res.items : res
    return items.map((o: any) => ({
      id: o.id ?? o._id,
      status: (o.status || 'pending').toUpperCase(),
      totalPrice: (o.total_price_paise ?? o.totalPrice ?? 0) / 100,
      createdAt: o.created_at ?? o.createdAt ?? new Date().toISOString(),
      expiresAt: o.expires_at ?? o.expiresAt ?? new Date().toISOString(),
      items: (o.items || []).map((it: any) => ({
        quantity: it.quantity,
        menuItem: {
          id: it.menu_item_id ?? it.menuItem?.id,
          name: it.name ?? it.menuItem?.name,
          description: it.menuItem?.description ?? '',
          price: (it.price_paise ?? (it.menuItem?.price ? it.menuItem.price * 100 : 0)) / 100,
          stockCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })),
    })) as Order[]
  } catch (error) {
    console.error("Error fetching order history:", error)
    return []
  }
}

export default async function OrderHistoryPage() {
  const orders = await getAllOrders()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Menu
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order History</h1>
              <p className="text-muted-foreground mt-2">All orders placed in the system</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No orders found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === "PENDING" ? "secondary" : order.status === "FAILED" ? "destructive" : "default"}>{order.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span>₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="max-w-32 bg-transparent">
                        <span className="truncate">View Details</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
