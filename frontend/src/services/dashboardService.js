import apiClient, { unwrap } from "./apiClient";

export const getCustomerDashboard = () => unwrap(apiClient.get("/dashboard/customer"));
export const getAdminDashboard = () => unwrap(apiClient.get("/dashboard/admin"));
export const getAdminSummary = () => unwrap(apiClient.get("/dashboard/summary"));
export const getRecentPayments = (params = {}) => unwrap(apiClient.get("/dashboard/recent-payments", { params }));
