'use client';

import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Mail, User, Hash, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', motDePasse: '', matricule: '', role: 'Etudiant', niveauId: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = { ...formData, matricule: formData.role === 'Etudiant' ? (formData.matricule || null) : null, niveauId: formData.role === 'Etudiant' ? (parseInt(formData.niveauId) || null) : null };
    const success = await register(dataToSend as Parameters<typeof register>[0]);
    if (success) router.push('/planning');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F9FA]">
      <div className="w-full max-w-xl bg-white rounded-xl border border-[#E9ECEF] shadow-sm overflow-hidden">
        <div className="bg-[#1B3A6B] p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-white/70 text-sm mt-1">Rejoignez la plateforme G-Salles</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} placeholder="Ex: Rakoto" required
                className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} placeholder="Ex: Jean" required
                className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
              <input type="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="jean.rakoto@emit.mg" required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Rôle</label>
            <select name="role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150">
              <option value="Etudiant">Étudiant</option>
              <option value="Professeur">Professeur</option>
              <option value="Admin">Administrateur</option>
            </select>
          </div>

          {formData.role === 'Etudiant' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Matricule</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
                  <input type="text" name="matricule" value={formData.matricule} onChange={e => setFormData({ ...formData, matricule: e.target.value })} placeholder="Ex: 2541" required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Niveau</label>
                <select name="niveauId" value={formData.niveauId} onChange={e => setFormData({ ...formData, niveauId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" required>
                  <option value="">Sélectionner...</option>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{['L1', 'L2', 'L3', 'M1', 'M2'][n - 1]}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Mot de passe</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="motDePasse" value={formData.motDePasse} onChange={e => setFormData({ ...formData, motDePasse: e.target.value })} placeholder="Min. 6 caractères" required minLength={6}
                className="w-full pr-9 pl-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#6C757D] transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {isLoading ? "Inscription..." : "S'inscrire sur G-Salles"}
          </button>

          <div className="text-center pt-4 border-t border-[#E9ECEF]">
            <p className="text-sm text-[#6C757D]">Déjà un compte ? <Link href="/login" className="text-[#1B3A6B] font-bold ml-1 hover:underline">Se connecter</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
