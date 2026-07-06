'use client';

import React, { useState } from 'react';
import { css } from 'styled-system/css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) router.push('/dashboard');
  };

  return (
    <div className={css({ minH: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bg: 'bg.canvas', px: '4' })}>
      <div className={css({ w: 'full', maxWidth: '420px' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '8', justifyContent: 'center' })}>
          <div className={css({ w: '10', h: '10', bg: 'accent.default', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' })}>
            <span className={css({ color: 'white', fontSize: 'xs', fontWeight: 'bold' })}>GS</span>
          </div>
          <span className={css({ color: 'fg.default', fontWeight: 'semibold', fontSize: 'lg' })}>G-Salles</span>
        </div>

        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'xl', p: '8', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' })}>
          <div className={css({ mb: '6' })}>
            <h1 className={css({ color: 'fg.default', fontSize: '2xl', fontWeight: 'bold', mb: '1' })}>Connexion</h1>
            <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>Accédez à votre espace G-Salles</p>
          </div>

          {error && (
            <div className={css({ mb: '4', px: '4', py: '2.5', rounded: 'lg', bg: 'rgba(239,68,68,0.08)', border: '1px solid', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 'sm', fontWeight: 'medium' })}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
              <label className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium' })}>Email</label>
              <div className={css({ position: 'relative' })}>
                <Mail size={15} className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', pointerEvents: 'none' })} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="votre.nom@emit.mg"
                  required
                  autoFocus
                  className={css({ pl: '9', bg: 'bg.surface', borderColor: 'border.default', color: 'fg.default', _placeholder: { color: 'fg.subtle' }, _focus: { borderColor: 'accent.default' } })}
                />
              </div>
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
              <label className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium' })}>Mot de passe</label>
              <div className={css({ position: 'relative' })}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={css({ pr: '10', bg: 'bg.surface', borderColor: 'border.default', color: 'fg.default', _placeholder: { color: 'fg.subtle' }, _focus: { borderColor: 'accent.default' } })}
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
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </span>
            </Button>
          </form>

          <div className={css({ mt: '6', pt: '5', borderTop: '1px solid', borderColor: 'border.default', textAlign: 'center' })}>
            <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>
              Pas encore de compte ?{' '}
              <Link href="/register" className={css({ color: 'accent.default', fontWeight: 'medium', _hover: { color: 'accent.emphasized' }, transition: 'colors 0.15s' })}>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
