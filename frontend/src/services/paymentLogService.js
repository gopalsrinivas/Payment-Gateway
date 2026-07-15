import apiClient, { unwrap } from "./apiClient";

export const listPaymentLogs = (params = {}) => unwrap(apiClient.get("/payment-logs", { params }));
export const getPaymentLog = (id) => unwrap(apiClient.get(`/payment-logs/${id}`));
export const listLogsForPayment = (paymentId, params = {}) => unwrap(apiClient.get(`/payments/${paymentId}/logs`, { params }));
