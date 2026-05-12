'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-container">
      <div className="blur-bg"></div>
      
      <main className="hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="badge glass">
            <Sparkles size={16} className="text-primary" />
            <span>Nouveau : Version 2.0 disponible</span>
          </div>
          
          <h1 className="hero-title">
            Simplifiez la gestion de <br />
            <span className="text-gradient">votre Planning EMIT</span>
          </h1>
          
          <p className="hero-description">
            Une plateforme moderne, rapide et intuitive pour gérer les cours, 
            les réservations de salles et les notifications en temps réel.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="btn-orange lg">
              Commencer maintenant <ArrowRight size={20} />
            </Link>
            <Link href="/about" className="btn-glass lg">
              En savoir plus
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hero-visual glass"
        >
          {/* Un placeholder visuel pour l'interface */}
          <div className="visual-header">
            <div className="dots"><span></span><span></span><span></span></div>
          </div>
          <div className="visual-body">
            <div className="skeleton-line long"></div>
            <div className="skeleton-grid">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          </div>
        </motion.div>
      </main>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
          position: relative;
        }

        .blur-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          filter: blur(80px);
          top: 10%;
          right: 5%;
        }

        .hero {
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
          z-index: 10;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 2rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: var(--emit-orange);
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.04em;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 500px;
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
        }

        .btn-primary.lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }

        .btn-glass {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 1rem 2rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 600;
          transition: var(--transition);
        }

        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .hero-visual {
          height: 500px;
          border-radius: 24px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }

        .visual-header {
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1rem;
        }

        .dots {
          display: flex;
          gap: 0.5rem;
        }

        .dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
        }

        .skeleton-line {
          height: 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
        }

        .skeleton-line.long { width: 70%; }

        .skeleton-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          height: 100%;
        }

        .skeleton-card {
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px solid var(--glass-border);
        }

        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; text-align: center; }
          .hero-content { display: flex; flex-direction: column; align-items: center; }
          .hero-title { font-size: 3rem; }
          .hero-visual { display: none; }
        }
      `}</style>
    </div>
  );
}
