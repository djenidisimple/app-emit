'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Eye, EyeOff, UserPlus, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuthStore from '@/store/authStore';

const inputCls = 'border-neutral-200';
const labelCls = 'text-[#555A6E] text-xs font-semibold';

export default function InscriptionAdminPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', motDePasse: '' });
  const [confirmMdp, setConfirmMdp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.motDePasse !== confirmMdp) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      const ok = await register({ ...form, role: 'Admin' });
      if (ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        const authError = useAuthStore.getState().error;
        setError(authError || "Erreur lors de l'inscription.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4">
        <div className="w-full max-w-[420px] text-center">
          <div className="bg-white border border-neutral-200 rounded-[12px] p-8">
            <div className="w-14 h-14 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-[#10b981]" />
            </div>
            <h2 className="text-lg font-bold text-[#111827] mb-1">Compte admin créé !</h2>
            <p className="text-sm text-[#8A8FA3] mb-2">Vous allez être redirigé vers le tableau de bord.</p>
            <div className="w-8 h-8 border-[3px] border-neutral-200 border-t-[#5A55F2] rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4 py-10">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-[34px] h-[34px] rounded-[10px] bg-[#5A55F2] relative shrink-0">
            <div className="absolute inset-[9px] bg-white rounded-[4px] opacity-90" />
          </div>
          <span className="font-bold text-xl text-[#111827]">App-EMIT.</span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-[12px] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-[8px] bg-[#5A55F2]/10 flex items-center justify-center">
              <UserPlus size={18} className="text-[#5A55F2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">Inscription Admin</h1>
              <p className="text-xs text-[#8A8FA3]">Créez le compte administrateur de la plateforme</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-[8px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] text-[#ef4444] text-sm font-medium flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Nom *</label>
                <Input type="text" value={form.nom} onChange={(e) => update('nom', e.target.value)} placeholder="Rakoto" required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Prénom *</label>
                <Input type="text" value={form.prenom} onChange={(e) => update('prenom', e.target.value)} placeholder="Jean" required className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Email *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FA3] pointer-events-none" />
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="admin@emit.mg" required className={`pl-9 ${inputCls}`} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Rôle</label>
              <div className="relative">
                <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FA3] pointer-events-none z-10" />
                <input type="text" value="Administrateur" disabled
                  className="h-10 pl-9 pr-3 rounded-lg border border-neutral-200 bg-[#F7F7FA] text-sm text-[#555A6E] w-full cursor-not-allowed" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Mot de passe *</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={form.motDePasse} onChange={(e) => update('motDePasse', e.target.value)} placeholder="Min. 8 caractères" required minLength={8} className={`pr-10 ${inputCls}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8FA3] hover:text-[#555A6E]">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Confirmer le mot de passe *</label>
              <Input type={showPassword ? 'text' : 'password'} value={confirmMdp} onChange={(e) => setConfirmMdp(e.target.value)} placeholder="Retaper le mot de passe" required minLength={8} className={inputCls} />
            </div>

            <Button type="submit" disabled={loading} loading={loading} size="lg" className="mt-1">
              <UserPlus size={16} /> {loading ? 'Création...' : 'Créer le compte admin'}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-neutral-200 text-center">
            <p className="text-[#8A8FA3] text-sm">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-[#5A55F2] font-semibold hover:text-[#4A45E0] transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
