'use client';

import { useState } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isResetPassword) {
        await sendPasswordResetEmail(auth, email);
        setResetEmailSent(true);
        return;
      }
      
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-secondary p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          {isResetPassword ? 'Réinitialiser le mot de passe' : isSignUp ? 'Créer un compte' : 'Se connecter'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {resetEmailSent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-500/20 text-green-500 p-3 rounded">
              Un email de réinitialisation a été envoyé à votre adresse email.
            </div>
            <button
              onClick={() => {
                setIsResetPassword(false);
                setResetEmailSent(false);
                setEmail('');
                setPassword('');
              }}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none"
                required
              />
            </div>
            
            {!isResetPassword && (
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              {isResetPassword ? 'Envoyer le lien' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center space-y-2">
          {!isResetPassword && (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 transition-colors block w-full"
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          )}
          {!isSignUp && !isResetPassword && (
            <button
              onClick={() => setIsResetPassword(true)}
              className="text-primary hover:text-primary/80 transition-colors block w-full"
            >
              Mot de passe oublié ?
            </button>
          )}
          {isResetPassword && (
            <button
              onClick={() => {
                setIsResetPassword(false);
                setEmail('');
                setPassword('');
              }}
              className="text-primary hover:text-primary/80 transition-colors block w-full"
            >
              Retour à la connexion
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 