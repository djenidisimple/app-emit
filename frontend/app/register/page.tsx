'use client';

import React, { useState } from 'react';
import { css, cx } from 'styled-system/css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', role: 'Etudiant', motDePasse: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const update = (field: keyof typeof formData, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      motDePasse: formData.motDePasse,
      role: formData.role,
    });
    if (success) router.push('/dashboard');
  };

  const inputCls = css({ bg: 'bg.surface', borderColor: 'border.default', color: 'fg.default', _placeholder: { color: 'fg.subtle' }, _focus: { borderColor: 'accent.default' } });

  return (
    <div className={css({ minH: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bg: 'bg.canvas', px: '4' })}>
      <div className={css({ w: 'full', maxWidth: '440px' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '8', justifyContent: 'center' })}>
          <div className={css({ w: '10', h: '10', bg: 'accent.default', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' })}>
            <span className={css({ color: 'white', fontSize: 'xs', fontWeight: 'bold' })}>GS</span>
          </div>
          <span className={css({ color: 'fg.default', fontWeight: 'semibold', fontSize: 'lg' })}>G-Salles</span>
        </div>

        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'xl', p: '8', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' })}>
          <div className={css({ mb: '6' })}>
            <h1 className={css({ color: 'fg.default', fontSize: '2xl', fontWeight: 'bold', mb: '1' })}>Créer un compte</h1>
            <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>Rejoignez la plateforme G-Salles</p>
          </div>

          {error && (
            <div className={css({ mb: '4', px: '4', py: '2.5', rounded: 'lg', bg: 'rgba(239,68,68,0.08)', border: '1px solid', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 'sm', fontWeight: 'medium' })}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
            <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3' })}>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
                <label className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium' })}>Nom</label>
                <Input type="text" value={formData.nom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('nom', e.target.value)} placeholder="Rakoto" required className={inputCls} />
              </div>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
                <label className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium' })}>Prénom</label>
                <Input type="text" value={formData.prenom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('prenom', e.target.value)} placeholder="Jean" required className={inputCls} />
              </div>
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
              <label className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium' })}>Email</label>
              <div className={css({ position: 'relative' })}>
                <Mail size={15} className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', pointerEvents: 'none' })} />
                <Input type="email" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('email', e.target.value)} placeholder="jean.rakoto@emit.mg" required className={cx(css({ pl: '9' }), inputCls)} />
              </div>
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
              <label className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium' })}>Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => update('role', e.target.value)}
                className={css({ px: '3', py: '2.5', bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', fontSize: 'sm', color: 'fg.default', cursor: 'pointer', _focus: { borderColor: 'accent.default' } })}
              >
                <option value="Etudiant">Étudiant</option>
                <option value="Professeur">Professeur</option>
              </select>
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
              <label className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium' })}>Mot de passe</label>
              <div className={css({ position: 'relative' })}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.motDePasse}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('motDePasse', e.target.value)}
                  placeholder="Min. 8 caractères"
                  required
                  minLength={8}
                  className={cx(css({ pr: '10' }), inputCls)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={css({ position: 'absolute', right: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', _hover: { color: 'fg.muted' }, transition: 'colors 0.15s' })}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
            >
              <span className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                {isLoading ? 'Inscription...' : "S'inscrire"}
              </span>
            </Button>
          </form>

          <div className={css({ mt: '6', pt: '5', borderTop: '1px solid', borderColor: 'border.default', textAlign: 'center' })}>
            <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>
              Déjà un compte ?{' '}
              <Link href="/login" className={css({ color: 'accent.default', fontWeight: 'medium', _hover: { color: 'accent.emphasized' }, transition: 'colors 0.15s' })}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
