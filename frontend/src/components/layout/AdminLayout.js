"use client";

import RoleGuard from "../auth/RoleGuard";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { ROLES } from "../../utils/constants";

const AdminLayout = ({ children }) => (
  <RoleGuard role={ROLES.ADMIN}>
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">
          <AdminHeader />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  </RoleGuard>
);

export default AdminLayout;
