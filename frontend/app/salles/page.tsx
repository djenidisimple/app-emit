'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Users, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import api from '@/services/api';

export default function SallesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [salles, setSalles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSalles();
  }, []);

  const fetchSalles = async () => {
    try {
      const response = await api.get('/Salles');
      setSalles(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des salles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSalles = salles.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="salles-wrapper">
      <Navbar />

      <main className="salles-content">
        <header className="salles-header">
          <div>
            <h1>Gestion des <span className="text-gradient">Salles</span></h1>
            <p className="text-secondary">Consultez la disponibilité et réservez des espaces.</p>
          </div>
          
          <div className="search-bar glass">
            <Search size={20} className="text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher une salle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="loading-state">Chargement des salles...</div>
        ) : (
          <div className="salles-grid">
            {filteredSalles.map((salle) => (
              <motion.div 
                key={salle.id}
                whileHover={{ y: -8 }}
                className="salle-card glass"
              >
                <div className="salle-status">
                  {salle.estDisponible ? (
                    <span className="badge-success"><CheckCircle2 size={14} /> Disponible</span>
                  ) : (
                    <span className="badge-danger"><XCircle size={14} /> Occupée</span>
                  )}
                </div>

                <div className="salle-icon glass">
                  <MapPin size={32} />
                </div>

                <h2 className="salle-name">{salle.nom}</h2>
                
                <div className="salle-details">
                  <div className="detail-item">
                    <Users size={16} />
                    <span>{salle.capacite} places</span>
                  </div>
                  <div className="detail-item">
                    <div className="type-dot"></div>
                    <span>Type: {salle.type}</span>
                  </div>
                </div>

                <div className="salle-actions">
                  <Button 
                    className="w-full" 
                    variant={salle.estDisponible ? 'orange' : 'glass'} 
                    disabled={!salle.estDisponible}
                  >
                    Réserver
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .salles-wrapper {
          padding-top: 8rem;
          padding-bottom: 3rem;
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
        }

        .salles-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .salles-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-full);
          width: 350px;
        }

        .search-bar input {
          background: none;
          border: none;
          color: white;
          width: 100%;
          outline: none;
        }

        .salles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .loading-state {
          text-align: center;
          padding: 4rem;
          font-size: 1.25rem;
          color: var(--text-secondary);
        }

        .salle-card {
          padding: 2rem;
          border-radius: 24px;
          position: relative;
          text-align: center;
        }

        .salle-status {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .badge-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .salle-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          color: var(--emit-orange);
        }

        .salle-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .salle-details {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .type-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-secondary);
          border-radius: 50%;
        }

        .w-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
