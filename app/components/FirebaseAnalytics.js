'use client';

import { useEffect } from 'react';
import { analytics } from '../firebase/config';

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Vous pouvez ajouter ici des événements de tracking personnalisés
    if (analytics) {
      console.log('Firebase Analytics initialisé');
    }
  }, []);

  return null;
} 