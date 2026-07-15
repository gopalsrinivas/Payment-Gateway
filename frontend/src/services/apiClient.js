"use client";

import axios from "axios";
import { appConfig } from "../config/env";
import { clearToken, getToken } from "../utils/storage";

const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      window.dispatchEvent(new Event("auth:expired"));
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export const unwrap = async (request) => {
  const response = await request;
  return response.data;
};

export default apiClient;
