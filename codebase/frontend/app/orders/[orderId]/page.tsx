import type { Order } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import CountdownTimer from "@/components/customer/CountdownTimer"
import { Clock, CheckCircle, XCircle, AlertCircle, Package, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"

interface OrderPageProps {
  params: {
    orderId: string
  }
}

async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const { api } = await import("@/lib/api")
    const raw = await api.getOrder(orderId)
    const o: any = raw?.data ?? raw
    if (!o) return null
    const mapped: Order = {
      id: o.id ?? o._id,
      status: (o.status || 'pending').toUpperCase(),
      totalPrice: (o.total_price_paise ?? 0) / 100,
      createdAt: o.created_at ?? new Date().toISOString(),
      expiresAt: o.expires_at ?? new Date().toISOString(),
      items: (o.items || []).map((it: any) => ({
        quantity: it.quantity,
        menuItem: {
          id: it.menu_item_id ?? 'unknown',
          name: it.name ?? 'Item',
          description: '',
          price: (it.price_paise ?? 0) / 100,
          stockCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })),
    }
    return mapped
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

function getStatusIcon(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return <Clock className="h-5 w-5 text-yellow-600" />
    case "CONFIRMED":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "FAILED":
      return <XCircle className="h-5 w-5 text-red-600" />
    case "COMPLETED":
      return <Package className="h-5 w-5 text-blue-600" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />
  }
}

function getStatusColor(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800"
    case "CONFIRMED":
      return "bg-green-100 text-green-800"
    case "FAILED":
      return "bg-red-100 text-red-800"
    case "COMPLETED":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const order = await getOrder(params.orderId)

  if (!order) {
    notFound()
  }

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
              <h1 className="text-3xl font-bold text-foreground">Order Status</h1>
              <p className="text-muted-foreground mt-2">Track your order progress</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </CardHeader>
          </Card>

          {/* Countdown Timer */}
          {order.status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Confirmation Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Your order will be automatically cancelled if not confirmed within:
                  </p>
                  <CountdownTimer expiresAt={order.expiresAt} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((orderItem, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{orderItem.menuItem.name}</h4>
                    <p className="text-sm text-muted-foreground">{orderItem.menuItem.description}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{orderItem.menuItem.price.toFixed(2)} × {orderItem.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(orderItem.menuItem.price * orderItem.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center font-medium text-lg">
                <span>Total</span>
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              {order.status === "PENDING" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Your order is being reviewed by our kitchen staff</p>
                  <p>• You will receive confirmation once your order is accepted</p>
                  <p>• If not confirmed within 15 minutes, your order will be automatically cancelled</p>
                </div>
              )}
              {order.status === "CONFIRMED" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Your order has been confirmed and is being prepared</p>
                  <p>• Estimated preparation time: 10-15 minutes</p>
                  <p>• You will be notified when your order is ready for pickup</p>
                </div>
              )}
              {order.status === "COMPLETED" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Your order has been completed and is ready for pickup</p>
                  <p>• Please collect your order from the canteen counter</p>
                  <p>• Thank you for your order!</p>
                </div>
              )}
              {order.status === "CANCELLED" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• This order has been cancelled</p>
                  <p>• If you have any questions, please contact our staff</p>
                  <p>• You can place a new order anytime</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
