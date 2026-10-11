'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  UtensilsCrossed,
  Grid2X2,
  Users,
  Package,
  Receipt,
  Settings,
  Flame,
  Wifi,
  WifiOff,
  ShieldCheck,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { AppModule } from '@/types/pos';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isOnline, offlineOrdersCount, syncOfflineData, currentUser, logout, hasPermission } = usePOS();

  const navItems: { label: string; href: string; icon: React.ElementType; module: AppModule }[] = [
    { label: 'POS Terminal', href: '/pos', icon: ShoppingCart, module: 'pos' },
    { label: 'Orders', href: '/orders', icon: ClipboardList, module: 'orders' },
    { label: 'Tables', href: '/tables', icon: Grid2X2, module: 'tables' },
    { label: 'Kitchen KDS', href: '/kitchen', icon: Flame, module: 'kitchen' },
    { label: 'Menu & Items', href: '/menu', icon: UtensilsCrossed, module: 'menu' },
    { label: 'Customers', href: '/customers', icon: Users, module: 'customers' },
    { label: 'Inventory', href: '/inventory', icon: Package, module: 'inventory' },
    { label: 'Expenses', href: '/expenses', icon: Receipt, module: 'expenses' },
    { label: 'Reports', href: '/reports', icon: LayoutDashboard, module: 'reports' },
    { label: 'Staff & Access', href: '/staff', icon: ShieldCheck, module: 'staff' },
    { label: 'Settings', href: '/settings', icon: Settings, module: 'settings' },
  ];

  // Only display modules where user has View access
  const visibleNavItems = navItems.filter((item) => hasPermission(item.module, 'canView'));

  return (
    <aside className="w-64 bg-gradient-to-b from-[#241108] via-[#32170B] to-[#200E06] text-[#EFE3D0] flex flex-col h-screen shrink-0 border-r border-[#4E2B19]/70 select-none shadow-2xl relative z-20">
      {/* Brand Header with 3D Zaad Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-[#4E2B19]/80 bg-[#1D0C05]/60 backdrop-blur-sm">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-[#D6A447] shadow-[0_2px_8px_rgba(214,164,71,0.35)] shrink-0 bg-[#FAF5EC]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/zaad-logo.jpg"
            alt="Zaad Restaurant Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-brand font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#F1D18A] to-[#D6A447] tracking-wider leading-none">
            ZAAD
          </h1>
          <p className="text-[11px] text-[#D6A447] font-semibold tracking-wide mt-1 uppercase">
            Restaurant System
          </p>
        </div>
      </div>

      {/* Network & Offline Status Banner */}
      <div className="px-4 py-2 bg-[#2D1409]/60 border-b border-[#4E2B19]/60">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium text-[11px]">System Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-300 font-medium text-[11px]">Offline Cache</span>
              </>
            )}
          </div>
          {offlineOrdersCount > 0 && (
            <button
              onClick={syncOfflineData}
              className="btn-wood text-[10px] px-2 py-0.5 rounded-md"
            >
              Sync ({offlineOrdersCount})
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links Filtered by Permissions */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {visibleNavItems.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#D9C4A5]/60 italic">
            No page access granted. Contact Administrator.
          </div>
        ) : (
          visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/pos' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'btn-wood text-white shadow-lg shadow-[#1D0C05]/60 !border-[#D6A447]'
                    : 'text-[#D9C4A5] hover:text-white hover:bg-[#4E2B19]/40 hover:border hover:border-[#6B3C23]/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#F1D18A] scale-110' : 'text-[#B8793F]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })
        )}
      </nav>

      {/* Active User Profile with Role & Quick Logout */}
      <div className="p-3.5 border-t border-[#4E2B19]/80 bg-[#1A0B05]/80 space-y-2">
        <div className="flex items-center gap-2.5 bg-[#2D1409]/70 p-2 rounded-xl border border-[#4E2B19]/70">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B572F] to-[#3B1F12] border border-[#D6A447] flex items-center justify-center text-[#F1D18A] font-bold text-xs shadow-inner shrink-0">
            {currentUser?.fullName.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#FAF5EC] truncate">
              {currentUser?.fullName || 'Logged Out'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider bg-[#3B1F12] text-[#F1D18A] border border-[#D6A447]/40 uppercase">
                {currentUser?.role || 'GUEST'}
              </span>
              <span className="text-[10px] text-[#A27756] truncate">@{currentUser?.username}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-[#D9C4A5] hover:text-rose-400 hover:bg-[#4E2B19] transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Login / Switch link */}
        <div className="flex items-center justify-between text-[11px] px-1 text-[#A27756]">
          <Link
            href="/login"
            className="hover:text-[#F1D18A] flex items-center gap-1 transition-colors"
          >
            <UserCheck className="w-3 h-3 text-[#D6A447]" />
            <span>Switch Staff Login</span>
          </Link>
          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/staff"
              className="text-[#D6A447] hover:underline font-bold"
            >
              Matrix
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};
