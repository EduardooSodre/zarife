'use client'

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, Bell } from "lucide-react";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";

export function AdminHeader() {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 font-inter relative z-30">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <span className="sr-only">Abrir menu</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Espaçamento */}
          <div className="flex-1"></div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="sr-only">Ver notificações</span>
              <Bell className="h-5 w-5" />
            </button>

            {/* User info and menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      <AdminMobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
