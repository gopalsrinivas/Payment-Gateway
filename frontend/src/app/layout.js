import { Toaster } from "react-hot-toast";
import AppShell from "../components/layout/AppShell";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import "../styles/globals.css";

export const metadata = {
  title: "Payment Gateway",
  description: "Frontend for a Razorpay test-mode payment gateway",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
          </CartProvider>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
