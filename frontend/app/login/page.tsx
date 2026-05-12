'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-emit-border rounded-md shadow-xl overflow-hidden"
      >
        <div className="bg-emit-blue p-10 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-md flex items-center justify-center mx-auto mb-6 border border-white/20">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-3xl font-poppins font-bold tracking-tight">G-SALLES</h1>
          <p className="text-white/60 text-sm mt-2">Gestion Intégrée EMIT</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm font-medium">
              {error}
            </div>
          )}

          <Input 
            label="Adresse Email"
            type="email"
            placeholder="votre.nom@emit.mg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Input 
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-emit-text/60">
              <input type="checkbox" className="rounded border-emit-border text-emit-blue focus:ring-emit-blue" />
              Se souvenir de moi
            </label>
            <a href="#" className="text-emit-blue font-semibold hover:underline">Mot de passe oublié ?</a>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              icon={LogIn}
              className="w-full"
            >
              Se connecter
            </Button>
          </div>

          <div className="text-center pt-6 border-t border-emit-border">
            <p className="text-sm text-emit-text/60">
              Pas encore de compte ? 
              <Link href="/register" className="text-emit-blue font-bold ml-1 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
