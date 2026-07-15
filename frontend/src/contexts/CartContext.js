"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { addCartItem, clearCart as clearCartRequest, getCart, removeCartItem, updateCartItem } from "../services/cartService";
import { getErrorMessage } from "../utils/errors";
import { ROLES } from "../utils/constants";
import { getRoleName } from "../utils/auth";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const emptyCart = { items: [], itemCount: 0, subtotal: "0.00", currency: "INR" };

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [cartLoading, setCartLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const mutationInFlight = useRef(false);

  const shouldLoad = isAuthenticated && getRoleName(user) === ROLES.CUSTOMER;

  const refreshCart = useCallback(async () => {
    if (!shouldLoad) {
      setCart(emptyCart);
      return emptyCart;
    }
    setCartLoading(true);
    try {
      const response = await getCart();
      setCart(response.data);
      return response.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return emptyCart;
    } finally {
      setCartLoading(false);
    }
  }, [shouldLoad]);

  useEffect(() => {
    if (!loading) refreshCart();
  }, [loading, refreshCart]);

  useEffect(() => {
    const clear = () => setCart(emptyCart);
    window.addEventListener("cart:clear", clear);
    return () => window.removeEventListener("cart:clear", clear);
  }, []);

  const runMutation = useCallback(
    async (task, successMessage) => {
      if (mutationInFlight.current) {
        throw new Error("A cart action is already in progress");
      }
      mutationInFlight.current = true;
      setMutating(true);
      try {
        const response = await task();
        if (response?.data?.items) setCart(response.data);
        else await refreshCart();
        if (successMessage) toast.success(successMessage);
        return response?.data;
      } catch (error) {
        toast.error(getErrorMessage(error));
        throw error;
      } finally {
        mutationInFlight.current = false;
        setMutating(false);
      }
    },
    [refreshCart],
  );

  const addItem = useCallback((productId, quantity = 1) => runMutation(() => addCartItem({ productId, quantity }), "Added to cart"), [runMutation]);
  const updateItem = useCallback((itemId, quantity) => runMutation(() => updateCartItem(itemId, quantity), "Cart updated"), [runMutation]);
  const removeItem = useCallback((itemId) => runMutation(() => removeCartItem(itemId), "Item removed"), [runMutation]);
  const clearCart = useCallback(() => runMutation(() => clearCartRequest(), "Cart cleared"), [runMutation]);

  const value = useMemo(
    () => ({
      cart,
      itemCount: cart.itemCount || 0,
      total: cart.subtotal || "0.00",
      currency: cart.currency || "INR",
      cartLoading,
      mutating,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      setCart,
    }),
    [cart, cartLoading, mutating, refreshCart, addItem, updateItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
