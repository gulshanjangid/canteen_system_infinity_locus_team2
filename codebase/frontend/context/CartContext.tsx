"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { CartItem } from "@/types"
import { api } from "@/lib/api"

type CartState = {
  items: CartItem[]
  totalPrice: number
  totalItems: number
  orderId: string | null
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { menuItemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_ORDER_ID"; payload: string | null }

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
  orderId: null,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.menuItemId === action.payload.menuItemId)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.menuItemId === action.payload.menuItemId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { ...state, items: newItems, totalPrice, totalItems }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.menuItemId !== action.payload)
      const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { ...state, items: newItems, totalPrice, totalItems }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.menuItemId === action.payload.menuItemId ? { ...item, quantity: action.payload.quantity } : item,
        )
        .filter((item) => item.quantity > 0)

      const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { ...state, items: newItems, totalPrice, totalItems }
    }

    case "CLEAR_CART":
      return { items: [], totalPrice: 0, totalItems: 0, orderId: null }

    case "SET_ORDER_ID":
      return { ...state, orderId: action.payload }

    default:
      return state
  }
}

type CartContextType = {
  state: CartState
  addItemToCart: (item: Omit<CartItem, "quantity">) => Promise<void>
  removeItemFromCart: (menuItemId: string) => void
  updateItemQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItemToCart = async (item: Omit<CartItem, "quantity">) => {
    // Deduct stock immediately by creating or extending a pending order
    if (!state.orderId) {
      const order = await api.placeOrder({ items: [{ itemId: item.menuItemId, quantity: 1 }] })
      const orderId = (order?.id ?? (order as any)?.data?.id) as string
      dispatch({ type: "SET_ORDER_ID", payload: orderId })
      dispatch({ type: "ADD_ITEM", payload: item })
    } else {
      await api.addItemsToOrder(state.orderId, [{ itemId: item.menuItemId, quantity: 1 }])
      dispatch({ type: "ADD_ITEM", payload: item })
    }
  }

  const removeItemFromCart = (menuItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: menuItemId })
  }

  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { menuItemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
