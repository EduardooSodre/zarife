import type { Metadata } from "next";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata: Metadata = {
  title: "Zarife Admin - Painel Administrativo",
  description: "Painel administrativo da Zarife para gerenciamento de produtos, categorias e pedidos.",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-inter">
      <AdminAuthGuard>
        <div className="h-screen flex bg-gray-50 overflow-hidden">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 md:ml-64">
            {/* Header */}
            <AdminHeader />
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminAuthGuard>
    </div>
  );
}
