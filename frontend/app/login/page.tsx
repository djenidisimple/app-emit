'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) router.push('/planning');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#0052FF] flex-col justify-between p-12">
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">GS</span>
          </div>
          <span className="text-white font-semibold text-base">
            G-Salles EMIT
          </span>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <div className="bg-white/20 inline-block px-3 py-1 mb-6 rounded-lg">
            <span className="text-white text-xs font-semibold uppercase tracking-widest">
              Connexion
            </span>
          </div>
          <h1 className="text-7xl font-bold text-white leading-none">
            Accédez
            <br />
            à votre
            <br />
            <span className="text-white/70">espace</span>
          </h1>
          <p className="text-white/60 text-sm mt-6 leading-relaxed max-w-xs">
            Gérez le planning, les salles et les réservations depuis votre espace personnel.
          </p>
        </div>

        <p className="relative z-10 text-white/30 text-xs font-medium">
          © 2025 EMIT — Université de Fianarantsoa
        </p>
      </div>

      {/* ── Right panel: form ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-blue-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#0052FF] rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">GS</span>
            </div>
            <span className="text-xl font-bold text-blue-900">G-Salles EMIT</span>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-blue-900 leading-none">
              Connexion
            </h2>
            <p className="text-blue-500 text-sm mt-2">
              Accédez à votre espace G-Salles
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-blue-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.nom@emit.mg"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-3 bg-white border border-blue-200 rounded-xl text-sm text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-blue-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-3 pr-10 py-3 bg-white border border-blue-200 rounded-xl text-sm text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#0052FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-8 pt-6 border-t border-blue-100 text-center">
            <p className="text-sm text-blue-500">
              Pas encore de compte ?{' '}
              <Link
                href="/register"
                className="text-blue-900 font-semibold hover:text-[#0052FF] transition-colors underline underline-offset-2"
              >
                Créer un compte →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
