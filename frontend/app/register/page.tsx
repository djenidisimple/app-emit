'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Hash, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    matricule: '',
    role: 'Etudiant',
    niveauId: ''
  });
  
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      matricule: formData.role === 'Etudiant' ? (formData.matricule || null) : null,
      niveauId: formData.role === 'Etudiant' ? (parseInt(formData.niveauId) || null) : null
    };
    console.log('Tentative d\'inscription avec:', dataToSend);
    const success = await register(dataToSend as any);
    if (success) {
      router.push('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white border border-emit-border rounded-md shadow-xl overflow-hidden"
      >
        <div className="bg-emit-blue p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-md flex items-center justify-center mx-auto mb-4 border border-white/20">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-poppins font-bold">Créer un compte</h1>
          <p className="text-white/60 text-sm mt-1">Rejoignez la plateforme de gestion G-SALLES</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nom" 
              name="nom"
              placeholder="Ex: Rakoto"
              value={formData.nom}
              onChange={handleChange}
              required
            />
            <Input 
              label="Prénom" 
              name="prenom"
              placeholder="Ex: Jean"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>

          <Input 
            label="Adresse Email" 
            name="email"
            type="email"
            placeholder="jean.rakoto@emit.mg"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-emit-blue ml-1">Rôle</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-white border border-emit-border rounded-md outline-none focus:ring-1 focus:ring-emit-blue text-sm"
              >
                <option value="Etudiant">Étudiant</option>
                <option value="Professeur">Professeur</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>
          </div>

          {formData.role === 'Etudiant' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
              <Input 
                label="Matricule" 
                name="matricule"
                placeholder="Ex: 2541"
                value={formData.matricule}
                onChange={handleChange}
                required
              />
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-emit-blue ml-1">Niveau d'étude</label>
                <select 
                  name="niveauId" 
                  value={formData.niveauId} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white border border-emit-border rounded-md outline-none focus:ring-1 focus:ring-emit-blue text-sm"
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="1">Licence 1 (L1)</option>
                  <option value="2">Licence 2 (L2)</option>
                  <option value="3">Licence 3 (L3)</option>
                  <option value="4">Master 1 (M1)</option>
                  <option value="5">Master 2 (M2)</option>
                </select>
              </div>
            </div>
          )}

          <Input 
            label="Mot de passe" 
            name="motDePasse"
            type="password"
            placeholder="Min. 6 caractères"
            value={formData.motDePasse}
            onChange={handleChange}
            required
            minLength={6}
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="w-full"
            >
              S'inscrire sur G-SALLES
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-emit-border">
            <p className="text-sm text-emit-text/60">
              Déjà un compte ? 
              <Link href="/login" className="text-emit-blue font-bold ml-1 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
