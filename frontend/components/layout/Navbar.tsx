'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, MapPin, Bell, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Planning', path: '/planning', icon: Calendar },
    { name: 'Salles', path: '/salles', icon: MapPin },
  ];

  return (
    <nav className="navbar-container glass">
      <div className="nav-logo">
        <span className="text-gradient font-bold text-xl">AppEmit</span>
      </div>

      <div className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.path} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{item.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeNav" 
                  className="active-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="nav-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        
        <div className="user-profile glass">
          <User size={18} />
          <span className="user-name">{user?.nom || 'Utilisateur'}</span>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar-container {
          position: fixed;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 1200px;
          height: 4.5rem;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: var(--radius-full);
          z-index: 1000;
        }

        .nav-logo {
          font-size: 1.5rem;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          height: 100%;
          align-items: center;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition);
          border-radius: var(--radius-full);
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          color: white;
        }

        .active-indicator {
          position: absolute;
          inset: 0;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-full);
          z-index: -1;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          position: relative;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .icon-btn:hover {
          color: white;
        }

        .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem 0.5rem 0.4rem 1rem;
          border-radius: var(--radius-full);
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: #ef4444;
          padding: 0.4rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .logout-btn:hover {
          background: #ef4444;
          color: white;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
