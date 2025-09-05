"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react"

export default function Cart() {
  const { state, updateItemQuantity, removeItemFromCart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const handleQuantityChange = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromCart(menuItemId)
    } else {
      updateItemQuantity(menuItemId, newQuantity)
    }
  }

  const handlePlaceOrder = async () => {
    if (state.items.length === 0) return

    setIsPlacingOrder(true)

    try {
      const { api } = await import("@/lib/api")
      let orderId: string | undefined
      if ((state as any).orderId) {
        orderId = (state as any).orderId as string
      } else {
        const orderPayload = {
          items: state.items.map((item) => ({
            itemId: item.menuItemId,
            quantity: item.quantity,
          })),
        }
        const order = await api.placeOrder(orderPayload)
        orderId = (order?.id || order?.data?.id || order?.orderId || order) as string
      }

      toast({
        title: "Order placed successfully!",
        description: "Redirecting to order status page...",
      })

      clearCart()
      router.push(`/orders/${orderId}`)
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Failed to place order",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add some delicious items to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </div>
          <Badge variant="secondary">{state.totalItems} items</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {state.items.map((item) => (
          <div key={item.menuItemId} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 bg-transparent"
                  onClick={() => handleQuantityChange(item.menuItemId, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 bg-transparent"
                  onClick={() => handleQuantityChange(item.menuItemId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => removeItemFromCart(item.menuItemId)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{state.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>₹{state.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handlePlaceOrder} disabled={isPlacingOrder || state.items.length === 0} className="w-full">
          {isPlacingOrder ? (
            <span className="truncate">Placing Order...</span>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Place Order (₹{state.totalPrice.toFixed(2)})</span>
            </>
          )}
        </Button>

        <Button variant="outline" onClick={clearCart} className="w-full bg-transparent" disabled={isPlacingOrder}>
          <span className="truncate">Clear Cart</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
