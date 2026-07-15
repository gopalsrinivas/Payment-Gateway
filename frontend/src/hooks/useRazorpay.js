"use client";

import { useCallback, useState } from "react";

const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise;

const loadCheckoutScript = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay Checkout is available only in the browser"));
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${checkoutScriptUrl}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay Checkout")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = checkoutScriptUrl;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Unable to load Razorpay Checkout"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
};

export const useRazorpay = () => {
  const [loadingScript, setLoadingScript] = useState(false);

  const openCheckout = useCallback(async (options) => {
    setLoadingScript(true);
    try {
      await loadCheckoutScript();
      const checkout = new window.Razorpay(options);
      if (options.onPaymentFailed) checkout.on("payment.failed", options.onPaymentFailed);
      checkout.open();
      return checkout;
    } finally {
      setLoadingScript(false);
    }
  }, []);

  return { loadingScript, openCheckout };
};

export { checkoutScriptUrl, loadCheckoutScript };
