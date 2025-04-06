'use client';

import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import LoginModal from './LoginModal';
import { isAdmin } from '../firebase/admin';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <>
      <nav className="fixed w-full bg-secondary/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <a 
            href="#" 
            onClick={scrollToTop}
            className="text-2xl font-bold text-primary hover:text-primary/90 transition-all duration-300 hover:scale-105 transform"
          >
            KINGDOOM SQUAD
          </a>
          <div className="space-x-6">
            {!isAdminPage && (
              <>
                <a href="#roster" className="text-white hover:text-primary transition-colors">Roster</a>
                <a href="#results" className="text-white hover:text-primary transition-colors">Résultats</a>
                <a href="#contact" className="text-white hover:text-primary transition-colors">Rejoins-nous</a>
              </>
            )}
            {user ? (
              <div className="inline-flex items-center space-x-4">
                {isAdmin(user) && (
                  <span className="text-accent text-sm font-medium">Admin</span>
                )}
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-primary transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-white hover:text-primary transition-colors"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </nav>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
} 