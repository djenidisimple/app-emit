'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, Download, Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import { SeancePlanningDto, PlanningHebdoResponse } from '@/types';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7h to 19h
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPlanning();
  }, [currentDate]);

  const fetchPlanning = async () => {
    setIsLoading(true);
    try {
      // Calculer le début de la semaine (Lundi)
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const response = await api.get<PlanningHebdoResponse>('/Planning/hebdo', { 
        params: { StartDate: startOfWeek.toISOString() } 
      });
      
      setSeances(response.data.seances || []);
    } catch (err) {
      console.error('Erreur lors du chargement du planning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const getPosition = (heureDebut: string, heureFin: string) => {
    const start = parseInt(heureDebut.split(':')[0]) + parseInt(heureDebut.split(':')[1]) / 60;
    const end = parseInt(heureFin.split(':')[0]) + parseInt(heureFin.split(':')[1]) / 60;
    
    const top = ((start - 7) / 13) * 100;
    const height = ((end - start) / 13) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="planning-wrapper">
      <Navbar />

      <main className="planning-content">
        <header className="planning-header">
          <div className="header-left">
            <h1>Planning <span className="text-gradient">Hebdomadaire</span></h1>
            <div className="date-navigation">
              <button onClick={prevWeek} className="nav-btn glass"><ChevronLeft size={20} /></button>
              <span className="current-range">Semaine du {currentDate.toLocaleDateString()}</span>
              <button onClick={nextWeek} className="nav-btn glass"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="header-right">
            <Button variant="glass" icon={Filter}>Filtres</Button>
            <Button variant="glass" icon={Download}>Exporter</Button>
            <Button variant="orange" icon={Plus}>Nouvelle séance</Button>
          </div>
        </header>

        <div className="calendar-container glass">
          <div className="calendar-grid">
            <div className="time-column">
              <div className="time-header"></div>
              {HOURS.map(hour => (
                <div key={hour} className="time-slot">{hour}h:00</div>
              ))}
            </div>

            {DAYS.map((day, index) => (
              <div key={day} className="day-column">
                <div className="day-header">
                  <span className="day-name">{day}</span>
                </div>
                
                <div className="slots-container">
                  {HOURS.map(hour => (
                    <div key={`${day}-${hour}`} className="slot-bg"></div>
                  ))}
                  
                  {seances
                    .filter(s => s.jour === day)
                    .map(seance => {
                      const pos = getPosition(seance.heureDebut, seance.heureFin);
                      return (
                        <motion.div 
                          key={seance.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`seance-item glass ${seance.statut === 'Annule' ? 'seance-red' : 'seance-blue'}`}
                          style={pos}
                        >
                          <div className="seance-content">
                            <p className="seance-time">{seance.heureDebut} - {seance.heureFin}</p>
                            <p className="seance-title">{seance.matiereNom}</p>
                            <p className="seance-info">{seance.professeurNomComplet} • {seance.salleNom}</p>
                          </div>
                        </motion.div>
                      );
                    })
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style jsx>{`
        .planning-wrapper {
          padding-top: 8rem;
          padding-bottom: 3rem;
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
        }

        .planning-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
        }

        .planning-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .date-navigation {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          color: white;
          cursor: pointer;
          transition: var(--transition);
        }

        .nav-btn:hover {
          background: var(--emit-orange);
        }

        .current-range {
          font-weight: 600;
          font-size: 1.125rem;
          min-width: 250px;
          text-align: center;
        }

        .header-right {
          display: flex;
          gap: 1rem;
        }

        .calendar-container {
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: rgba(10, 15, 30, 0.6);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: 80px repeat(6, 1fr);
          min-width: 1000px;
        }

        .time-header {
          height: 80px;
          border-bottom: 1px solid var(--glass-border);
          border-right: 1px solid var(--glass-border);
        }

        .time-slot {
          height: 65px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 10px;
          font-size: 0.75rem;
          color: var(--text-muted);
          border-right: 1px solid var(--glass-border);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .day-header {
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--glass-border);
          border-right: 1px solid var(--glass-border);
        }

        .day-name {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .slots-container {
          position: relative;
          height: calc(65px * 13);
          border-right: 1px solid var(--glass-border);
        }

        .slot-bg {
          height: 65px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .seance-item {
          position: absolute;
          left: 6px;
          right: 6px;
          border-radius: 12px;
          padding: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
          z-index: 10;
        }

        .seance-item:hover {
          transform: scale(1.02);
          z-index: 50;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .seance-blue {
          background: rgba(30, 64, 175, 0.1);
          border-left: 4px solid var(--emit-blue);
        }

        .seance-red {
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
        }

        .seance-time {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--emit-blue);
          margin-bottom: 0.25rem;
        }

        .seance-title {
          font-weight: 700;
          font-size: 0.9375rem;
          margin-bottom: 0.25rem;
          line-height: 1.2;
        }

        .seance-info {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
