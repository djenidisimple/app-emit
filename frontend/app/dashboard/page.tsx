'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, Calendar as CalendarIcon, Settings, LogOut, Search } from 'lucide-react';
import CalendarWeek from '@/components/CalendarWeek';
import ExceptionModal from '@/components/ExceptionModal';
import NotificationBell from '@/components/NotificationBell';
import { SeancePlanningDto, Notification, Salle, PlanningHebdoResponse } from '@/types';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';

export default function DashboardPage() {
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeance, setSelectedSeance] = useState<SeancePlanningDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, logout } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const sallesRes = await api.get<Salle[]>('/Salles');
        setSalles(sallesRes.data);

        const today = new Date().toISOString().split('T')[0];
        let url = `/Planning/hebdo?startDate=${today}`;

        if (user) {
          const role = user.roles?.[0];
          if (role === 'Etudiant' && user.niveauId) {
            url += `&niveauId=${user.niveauId}`;
          } else if (role === 'Professeur' && user.id) {
            url += `&professeurId=${user.id}`;
          }
        }

        const planningRes = await api.get<PlanningHebdoResponse>(url);
        if (planningRes.data && planningRes.data.seances) {
          setSeances(planningRes.data.seances);
        }

      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleSeanceClick = (seance: SeancePlanningDto) => {
    setSelectedSeance(seance);
    setIsModalOpen(true);
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, estLu: true } : n));
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-emit-border hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-poppins font-bold tracking-tight text-emit-blue">G-SALLES</h1>
          <p className="text-[10px] text-emit-text/40 uppercase tracking-widest mt-1">EMIT Fianarantsoa</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={LayoutGrid} label="Dashboard" active />
          <NavItem icon={CalendarIcon} label="Plannings" />
          <NavItem icon={Settings} label="Administration" />
        </nav>

        <div className="p-4 border-t border-emit-border">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-50 transition-colors text-sm font-poppins text-emit-text/70"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-emit-border flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emit-text/40" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un cours, un prof..." 
                className="w-full pl-10 pr-4 py-2 bg-emit-bg border border-emit-border rounded-lg outline-none focus:ring-2 focus:ring-emit-orange/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell notifications={notifications} onMarkAsRead={markAsRead} />
            <div className="flex items-center gap-3 border-l pl-6 border-emit-border">
              <div className="text-right">
                <p className="text-sm font-bold text-emit-blue">{user?.nom} {user?.prenom}</p>
                <p className="text-[10px] text-emit-text/50 uppercase font-semibold">{user?.roles?.[0] || 'Utilisateur'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emit-orange text-white flex items-center justify-center font-bold font-poppins">
                {user?.nom?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex justify-between items-end">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-poppins font-bold text-emit-blue">Tableau de bord</h2>
              <p className="text-emit-text/60 mt-1">Gestion du planning hebdomadaire</p>
            </motion.div>

            <div className="flex gap-3">
              <Button variant="glass" icon={Plus}>Importer CSV</Button>
              <Button variant="orange" icon={Plus}>Nouvelle Séance</Button>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="fade-in-up relative min-h-[400px]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div>
              </div>
            ) : (
              <CalendarWeek seances={seances} onSeanceClick={handleSeanceClick} />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ExceptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        seance={selectedSeance}
        salles={salles}
      />
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: any) {
  return (
    <button className={`flex items-center gap-3 w-full p-2.5 rounded-md transition-all font-poppins text-sm ${active ? 'bg-emit-blue text-white shadow-sm' : 'text-emit-text/70 hover:bg-gray-50 hover:text-emit-blue'}`}>
      <Icon size={19} />
      {label}
    </button>
  );
}
