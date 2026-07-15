import apiClient, { unwrap } from "./apiClient";
import { cleanQueryParams } from "../utils/query";

export const createOrder = (payload = {}) => unwrap(apiClient.post("/orders", payload));
export const listOrders = (params = {}) => unwrap(apiClient.get("/orders", { params: cleanQueryParams(params) }));
export const getOrder = (id) => unwrap(apiClient.get(`/orders/${id}`));
export const getOrderItems = (id) => unwrap(apiClient.get(`/orders/${id}/items`));
export const updateOrderStatus = (id, status) => unwrap(apiClient.patch(`/orders/${id}/status`, { status }));
