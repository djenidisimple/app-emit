'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/planning');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-[#1B3A6B] flex-col items-center justify-center relative p-12">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-6">
            <span className="text-[#1B3A6B] text-[28px] font-bold">GS</span>
          </div>
          <h1 className="text-white text-[28px] font-bold">G-Salles EMIT</h1>
          <p className="text-white/70 text-sm mt-2">Système de gestion du planning</p>
        </div>
        <svg className="absolute bottom-20 opacity-20" width="200" height="200" viewBox="0 0 200 200" fill="none">
          <rect x="20" y="30" width="160" height="140" rx="8" stroke="white" strokeWidth="2" />
          <line x1="20" y1="60" x2="180" y2="60" stroke="white" strokeWidth="2" />
          <line x1="60" y1="60" x2="60" y2="170" stroke="white" strokeWidth="1" />
          <line x1="100" y1="60" x2="100" y2="170" stroke="white" strokeWidth="1" />
          <line x1="140" y1="60" x2="140" y2="170" stroke="white" strokeWidth="1" />
          <rect x="25" y="70" width="30" height="25" rx="3" fill="white" fillOpacity="0.1" />
          <rect x="65" y="70" width="30" height="25" rx="3" fill="white" fillOpacity="0.1" />
          <rect x="105" y="110" width="30" height="25" rx="3" fill="white" fillOpacity="0.1" />
          <rect x="145" y="110" width="30" height="25" rx="3" fill="white" fillOpacity="0.1" />
        </svg>
        <p className="absolute bottom-6 text-white/40 text-[11px]">© 2025 EMIT — Université de Fianarantsoa</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-[24px] font-bold text-[#1B3A6B] mb-1">Connexion</h2>
          <p className="text-[#6C757D] text-sm mb-8">Accédez à votre espace G-Salles</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.nom@emit.mg"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-9 pl-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#6C757D] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
