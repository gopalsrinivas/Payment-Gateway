"use client";

import { usePathname } from "next/navigation";
import AdminLayout from "./AdminLayout";
import CustomerLayout from "./CustomerLayout";

const AppShell = ({ children }) => {
  const pathname = usePathname();
  return pathname?.startsWith("/admin") ? <AdminLayout>{children}</AdminLayout> : <CustomerLayout>{children}</CustomerLayout>;
};

export default AppShell;
