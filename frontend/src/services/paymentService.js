import apiClient, { unwrap } from "./apiClient";

export const listPayments = (params = {}) => unwrap(apiClient.get("/payments", { params }));
export const listPaymentHistory = (params = {}) => unwrap(apiClient.get("/payments/history", { params }));
export const getPayment = (id) => unwrap(apiClient.get(`/payments/${id}`));
export const listOrderPayments = (orderId, params = {}) => unwrap(apiClient.get(`/orders/${orderId}/payments`, { params }));
export const initializePayment = (payload) => unwrap(apiClient.post("/payments/initialize", payload));
export const createRazorpayOrder = initializePayment;
export const verifyPayment = (payload) => unwrap(apiClient.post("/payments/verify", payload));
export const recordPaymentFailure = (payload) => unwrap(apiClient.post("/payments/failure", payload));
