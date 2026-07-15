import apiClient, { unwrap } from "./apiClient";

export const listPayments = (params = {}) => unwrap(apiClient.get("/payments", { params }));
export const listPaymentHistory = (params = {}) => unwrap(apiClient.get("/payments/history", { params }));
export const getPayment = (id) => unwrap(apiClient.get(`/payments/${id}`));
export const listOrderPayments = (orderId, params = {}) => unwrap(apiClient.get(`/orders/${orderId}/payments`, { params }));
