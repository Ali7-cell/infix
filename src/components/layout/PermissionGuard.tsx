'use client';

import React from 'react';
import Link from 'next/link';
import { usePOS } from '@/context/POSContext';
import { AppModule } from '@/types/pos';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface PermissionGuardProps {
  module: AppModule;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ module, children }) => {
  const { hasPermission, currentUser } = usePOS();

  // If user is logged in and has View permission for this module
  if (hasPermission(module, 'canView')) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF5EC] p-8 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-[#FAF5EC] border-2 border-[#D9C4A5] shadow-lg flex items-center justify-center mb-4 text-[#8B572F]">
        <ShieldAlert className="w-8 h-8 text-[#8B572F]" />
      </div>
      <h2 className="font-brand font-black text-2xl text-[#2B180F]">
        Access Restricted / رسائی محدود ہے
      </h2>
      <p className="text-xs text-[#725B49] max-w-md mt-2 leading-relaxed">
        Your current staff account <strong className="text-[#3B1F12]">@{currentUser?.username} ({currentUser?.role})</strong> does not have View permission for the <strong>{module.toUpperCase()}</strong> module.
      </p>
      <p className="text-[11px] text-[#8B572F] mt-1 italic">
        Please contact your System Administrator to update your permission matrix.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/pos"
          className="btn-wood px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
        >
          <Home className="w-4 h-4 text-[#F1D18A]" />
          <span>Return to POS Terminal</span>
        </Link>
        <Link
          href="/login"
          className="btn-wood-secondary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch User Login</span>
        </Link>
      </div>
    </div>
  );
};
