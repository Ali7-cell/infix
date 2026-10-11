'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, staffUsers, currentUser } = usePOS();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (res.success) {
        router.push('/pos');
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
        setLoading(false);
      }
    }, 400);
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="flex-1 h-screen flex items-center justify-center bg-gradient-to-br from-[#1E0C05] via-[#2F150A] to-[#140702] p-4 relative overflow-hidden select-none">
      {/* Decorative Gold & Wood Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D6A447]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B572F]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#D9C4A5] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#241108] via-[#3B1F12] to-[#200E06] p-6 text-center border-b border-[#4E2B19] relative">
          {/* Logo with gold bevel ring */}
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-[#D6A447] shadow-[0_4px_16px_rgba(214,164,71,0.4)] bg-[#FAF5EC] mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/zaad-logo.jpg"
              alt="Zaad Restaurant Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="font-brand font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#F1D18A] to-[#D6A447] tracking-wider">
            ZAAD RESTAURANT
          </h1>
          <p className="text-xs text-[#D6A447] font-semibold mt-1 uppercase tracking-widest">
            Staff & Receptionist Portal
          </p>
        </div>

        {/* Form Container */}
        <div className="p-7 space-y-5 bg-[#FAF5EC]/30">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Username Input */}
            <div>
              <label className="font-bold text-[#3B1F12] block mb-1.5 uppercase tracking-wider text-[11px]">
                Username / یوزر نیم
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B572F]" />
                <input
                  type="text"
                  required
                  placeholder="Enter staff username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#D9C4A5] rounded-xl text-[#2B180F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D6A447]/30 focus:border-[#D6A447] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="font-bold text-[#3B1F12] block mb-1.5 uppercase tracking-wider text-[11px]">
                Password / پاس ورڈ
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B572F]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter secret password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#D9C4A5] rounded-xl text-[#2B180F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D6A447]/30 focus:border-[#D6A447] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B572F] hover:text-[#3B1F12]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Wooden Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-wood btn-wood-primary w-full py-3.5 text-sm font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Verifying...' : 'Sign In to Zaad POS'}</span>
              <ArrowRight className="w-4 h-4 text-[#F1D18A]" />
            </button>
          </form>

          {/* Quick Demo Credentials Presets */}
          <div className="pt-3 border-t border-[#D9C4A5] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#725B49] block text-center">
              Quick One-Click Logins for Testing
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="p-2.5 rounded-xl border border-[#D9C4A5] bg-white hover:border-[#8B572F] hover:bg-[#FAF5EC] text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-brand font-bold text-[#3B1F12] text-xs">Admin Login</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D6A447]" />
                </div>
                <p className="text-[10px] text-[#725B49] mt-0.5 font-mono">admin / admin123</p>
                <span className="text-[9px] text-[#8B572F] font-bold block mt-1">Full System Access</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('receptionist', 'zaad123')}
                className="p-2.5 rounded-xl border border-[#D9C4A5] bg-white hover:border-[#8B572F] hover:bg-[#FAF5EC] text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-brand font-bold text-[#3B1F12] text-xs">Receptionist</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B572F]" />
                </div>
                <p className="text-[10px] text-[#725B49] mt-0.5 font-mono">receptionist / zaad123</p>
                <span className="text-[9px] text-[#8B572F] font-bold block mt-1">Front Desk Limited</span>
              </button>
            </div>
          </div>

          {currentUser && (
            <div className="text-center pt-1">
              <span className="text-[11px] text-[#725B49]">
                Currently logged in as: <strong className="text-[#3B1F12]">{currentUser.fullName} ({currentUser.role})</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
