"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { MenuItem } from "@/types"

interface MenuItemFormProps {
  item?: MenuItem
  children: React.ReactNode
}

export default function MenuItemForm({ item, children }: MenuItemFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    stockCount: item?.stockCount?.toString() || "",
  })

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { api } = await import("@/lib/api")
      const payload = {
        name: formData.name,
        description: formData.description,
        price_rupees: Number.parseFloat(formData.price),
        stock_count: Number.parseInt(formData.stockCount),
      }

      if (item) await api.updateMenuItem(item.id, payload)
      else await api.createMenuItem(payload)

      toast({
        title: "Success",
        description: `Menu item ${item ? "updated" : "created"} successfully`,
      })

      setOpen(false)
      setFormData({ name: "", description: "", price: "", stockCount: "" })
      router.refresh()
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast({
        title: "Error",
        description: `Failed to ${item ? "update" : "create"} menu item`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && !loading) {
      // Reset form when closing
      setFormData({
        name: item?.name || "",
        description: item?.description || "",
        price: item?.price?.toString() || "",
        stockCount: item?.stockCount?.toString() || "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{item ? "Edit Menu Item" : "Create New Menu Item"}</DialogTitle>
            <DialogDescription>
              {item ? "Update the details of this menu item." : "Add a new item to your canteen menu."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stockCount">Stock Count</Label>
                <Input
                  id="stockCount"
                  type="number"
                  min="0"
                  value={formData.stockCount}
                  onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : item ? "Update Item" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
