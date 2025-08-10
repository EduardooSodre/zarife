'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Users, 
  Settings,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Produtos",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Categorias",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    name: "Pedidos",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 font-inter">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 h-full">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <Link href="/admin" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-gray-900" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Zarife</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Store className="mr-2 h-4 w-4" />
            Ver Loja
          </Link>
        </div>
      </div>
    </div>
  );
}
