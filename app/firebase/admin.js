import { auth } from './config';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './config';

// Liste des emails administrateurs
const ADMIN_EMAILS = ['ytlandouze@gmail.com'];

// Fonction pour vérifier si un utilisateur est administrateur
export const isAdmin = async (user) => {
  try {
    if (!user) {
      console.log('Aucun utilisateur connecté');
      return false;
    }

    console.log('Vérification du statut admin pour l\'utilisateur:', user.uid);
    console.log('Email de l\'utilisateur:', user.email);
    
    const userDocRef = doc(db, 'users', user.uid);
    console.log('Référence au document utilisateur:', userDocRef.path);
    
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('Document utilisateur non trouvé pour l\'ID:', user.uid);
      return false;
    }

    const userData = userDoc.data();
    console.log('Données utilisateur complètes:', userData);
    
    if (!userData.role) {
      console.log('Le champ role n\'existe pas dans le document utilisateur');
      return false;
    }
    
    const isAdminUser = userData.role === 'admin';
    console.log('Vérification du rôle:', {
      role: userData.role,
      isAdmin: isAdminUser
    });
    
    return isAdminUser;
  } catch (error) {
    console.error('Erreur détaillée lors de la vérification du statut admin:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
};

// Fonction pour obtenir le rôle de l'utilisateur
export const getUserRole = (user) => {
  if (!user) return 'visitor';
  return isAdmin(user) ? 'admin' : 'user';
}; 