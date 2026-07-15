import apiClient, { unwrap } from "./apiClient";

export const getCart = () => unwrap(apiClient.get("/cart"));
export const addCartItem = (payload) => unwrap(apiClient.post("/cart/items", payload));
export const updateCartItem = (id, quantity) => unwrap(apiClient.patch(`/cart/items/${id}`, { quantity }));
export const removeCartItem = (id) => unwrap(apiClient.delete(`/cart/items/${id}`));
export const clearCart = () => unwrap(apiClient.delete("/cart"));
