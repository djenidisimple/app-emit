'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Hash, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    matricule: '',
    role: 'Etudiant',
    niveauId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const update = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      matricule: formData.role === 'Etudiant' ? formData.matricule || null : null,
      niveauId: formData.role === 'Etudiant' ? parseInt(formData.niveauId) || null : null,
    };
    const success = await register(dataToSend as Parameters<typeof register>[0]);
    if (success) router.push('/planning');
  };

  const inputClass =
    'w-full px-3 py-3 bg-white border border-blue-200 rounded-xl text-sm text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all';
  const labelClass = 'text-xs font-semibold text-blue-700';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left dark panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#0052FF] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">GS</span>
          </div>
          <span className="text-white font-semibold text-base">
            G-Salles EMIT
          </span>
        </div>

        <div>
          <div className="bg-white/20 inline-block px-3 py-1 mb-6 rounded-lg">
            <span className="text-white text-xs font-semibold uppercase tracking-widest">
              Inscription
            </span>
          </div>
          <h1 className="text-7xl font-bold text-white leading-none">
            Rejoignez
            <br />
            la plate-
            <br />
            <span className="text-white/70">forme</span>
          </h1>
          <p className="text-white/60 text-sm mt-6 leading-relaxed max-w-xs">
            Créez votre compte pour accéder au planning et aux salles de l'EMIT.
          </p>
        </div>

        <p className="text-white/30 text-xs font-medium">
          © 2025 EMIT — Université de Fianarantsoa
        </p>
      </div>

      {/* ── Right panel: form ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-blue-50">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#0052FF] rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">GS</span>
            </div>
            <span className="text-xl font-bold text-blue-900">G-Salles EMIT</span>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-blue-900 leading-none">
              Créer un compte
            </h2>
            <p className="text-blue-500 text-sm mt-2">Rejoignez la plateforme G-Salles</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => update('nom', e.target.value)}
                  placeholder="Ex: Rakoto"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => update('prenom', e.target.value)}
                  placeholder="Ex: Jean"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="jean.rakoto@emit.mg"
                  required
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Rôle */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => update('role', e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Etudiant">Étudiant</option>
                <option value="Professeur">Professeur</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>

            {/* Matricule / Niveau (students only) */}
            {formData.role === 'Etudiant' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Matricule</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.matricule}
                      onChange={(e) => update('matricule', e.target.value)}
                      placeholder="Ex: 2541"
                      required
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Niveau</label>
                  <select
                    value={formData.niveauId}
                    onChange={(e) => update('niveauId', e.target.value)}
                    required
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Sélectionner...</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {['L1', 'L2', 'L3', 'M1', 'M2'][n - 1]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.motDePasse}
                  onChange={(e) => update('motDePasse', e.target.value)}
                  placeholder="Min. 6 caractères"
                  required
                  minLength={6}
                  className={`${inputClass} pr-10`}
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
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#0052FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                {isLoading ? "Inscription..." : "S'inscrire sur G-Salles"}
              </span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-6 border-t border-blue-100 text-center">
            <p className="text-sm text-blue-500">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-blue-900 font-semibold hover:text-[#0052FF] transition-colors underline underline-offset-2"
              >
                Se connecter →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
