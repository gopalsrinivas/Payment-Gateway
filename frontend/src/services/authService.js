import apiClient from "./apiClient";

export const registerUser = (payload) => apiClient.post("/auth/register", payload);
export const loginUser = (payload) => apiClient.post("/auth/login", payload);
export const fetchProfile = () => apiClient.get("/auth/profile");
export const logoutUser = () => apiClient.post("/auth/logout");

