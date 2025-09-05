"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import type { MenuItem } from "@/types"
import { ShoppingCart, AlertCircle, Plus, Minus } from "lucide-react"
import { useState } from "react"

interface MenuItemCardProps {
  item: MenuItem
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItemToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    if (item.stockCount === 0) return

    for (let i = 0; i < quantity; i++) {
      addItemToCart({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
      })
    }

    toast({
      title: "Added to cart",
      description: `${quantity} × ${item.name} added to your cart`,
    })

    // Reset quantity after adding to cart
    setQuantity(1)
  }

  const isOutOfStock = item.stockCount === 0
  const isLowStock = item.stockCount > 0 && item.stockCount <= 5

  const increaseQuantity = () => {
    if (quantity < item.stockCount) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <span className="text-lg font-bold text-primary">₹{item.price.toFixed(2)}</span>
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            ) : isLowStock ? (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                Low Stock
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                In Stock
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

        <div className="mt-3 flex items-center gap-2 text-sm">
          {isOutOfStock ? (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Currently unavailable</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>{item.stockCount} available</span>
            </div>
          )}
        </div>

        {!isOutOfStock && (
          <div className="mt-4">
            <label className="text-sm font-medium text-muted-foreground">Quantity</label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={increaseQuantity}
                disabled={quantity >= item.stockCount}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total: ₹{(item.price * quantity).toFixed(2)}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="w-full"
          variant={isOutOfStock ? "secondary" : "default"}
        >
          {isOutOfStock ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Out of Stock</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Add {quantity > 1 ? `${quantity} ` : ""}to Cart</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
