import apiClient from "./apiClient";
import { unwrap } from "./apiClient";

export const registerUser = (payload) => unwrap(apiClient.post("/auth/register", payload));
export const loginUser = (payload) => unwrap(apiClient.post("/auth/login", payload));
export const fetchProfile = () => unwrap(apiClient.get("/auth/profile"));
export const logoutUser = () => unwrap(apiClient.post("/auth/logout"));
