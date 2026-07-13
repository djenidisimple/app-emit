'use client';

import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import useAuthStore from '@/store/authStore';

type Tab = 'profile' | 'notifications' | 'password';

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-fg-default bg-surface outline-none focus:border-accent transition-colors duration-150';
const labelCls = 'text-xs font-semibold text-fg-muted uppercase tracking-wide';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'password', label: 'Mot de passe', icon: Lock },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setForm({ prenom: user.prenom || '', nom: user.nom || '', email: user.email || '' });
      }, 0);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erreur lors de la sauvegarde.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (passwordForm.new !== passwordForm.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordForm.new.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setSaved(true);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setSaved(false), 3000);
  };

  const toggles = [
    { label: 'Notifications par email', desc: 'Recevoir un email pour les échanges de créneaux', enabled: true },
    { label: 'Rappels de séances', desc: 'Notification 24h avant chaque séance', enabled: true },
    { label: 'Nouveaux examens', desc: 'Être notifié des nouveaux examens publiés', enabled: false },
    { label: 'Demandes d\'échange', desc: 'Notification pour chaque demande reçue', enabled: true },
  ];

  const initialToggles = toggles.map((t) => t.enabled);
  const [notifSettings, setNotifSettings] = useState(initialToggles);

  return (
    <ProtectedLayout pageTitle="Paramètres">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors duration-150 ${
                  activeTab === tab.key
                    ? 'bg-accent text-white'
                    : 'text-fg-muted hover:bg-bg-muted hover:text-fg-default'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 px-4 py-3 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-sm font-medium text-[#ef4444] flex items-center gap-2 rounded-lg">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {saved && (
            <div className="mb-4 px-4 py-3 bg-[rgba(16,185,129,0.1)] border border-[#10b981] text-sm font-medium text-[#10b981] flex items-center gap-2 rounded-lg">
              <CheckCircle size={15} /> Modifications enregistrées.
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-base font-bold text-fg-default mb-1">Informations personnelles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Prénom</label>
                  <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Nom</label>
                  <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Rôle</label>
                <input type="text" value={user?.role || ''} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>
              <div className="pt-2">
                <button type="submit" className="bg-accent text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <Save size={15} /> Enregistrer
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-base font-bold text-fg-default mb-1">Préférences de notification</h2>
              {toggles.map((t, i) => (
                <label key={t.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-bg-muted transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings[i]}
                    onChange={() => {
                      const next = [...notifSettings];
                      next[i] = !next[i];
                      setNotifSettings(next);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-border accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-fg-default">{t.label}</p>
                    <p className="text-xs text-fg-muted">{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-base font-bold text-fg-default mb-1">Changer le mot de passe</h2>
              {(['current', 'new', 'confirm'] as const).map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className={labelCls}>
                    {field === 'current' ? 'Mot de passe actuel' : field === 'new' ? 'Nouveau mot de passe' : 'Confirmer le mot de passe'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm[field]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                      className={inputCls}
                      minLength={6}
                    />
                    {field !== 'current' && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg-muted">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button type="submit" className="bg-accent text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <Lock size={15} /> Mettre à jour
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
