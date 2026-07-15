export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Payment Gateway",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
};

export const validatePublicEnv = () => {
  const missing = [];
  if (!appConfig.apiBaseUrl) missing.push("NEXT_PUBLIC_API_BASE_URL");
  if (process.env.NODE_ENV === "development" && missing.length) {
    throw new Error(`Missing public frontend environment variables: ${missing.join(", ")}`);
  }
};
