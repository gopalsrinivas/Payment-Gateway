import { Toaster } from "react-hot-toast";
import AppShell from "../components/layout/AppShell";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/globals.css";

export const metadata = {
  title: "Payment Gateway Demo",
  description: "Part 1 auth foundation for a Razorpay test-mode demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}

