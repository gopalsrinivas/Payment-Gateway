import apiClient, { unwrap } from "./apiClient";

export const listProducts = (params = {}) => unwrap(apiClient.get("/products", { params }));
export const getProduct = (id) => unwrap(apiClient.get(`/products/${id}`));
export const createProduct = (payload) => unwrap(apiClient.post("/products", payload));
export const updateProduct = (id, payload) => unwrap(apiClient.patch(`/products/${id}`, payload));
export const updateProductStatus = (id, isActive) => unwrap(apiClient.patch(`/products/${id}/status`, { isActive }));
export const deleteProduct = (id) => unwrap(apiClient.delete(`/products/${id}`));
