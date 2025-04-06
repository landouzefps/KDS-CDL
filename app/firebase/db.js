import { collection, doc, getDocs, updateDoc, setDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { getAuth } from 'firebase/auth';

// Collection des joueurs
const PLAYERS_COLLECTION = 'players';

// Fonction pour récupérer tous les joueurs
export const getPlayers = async () => {
  try {
    console.log('Début de la récupération des joueurs...');
    console.log('État de la base de données:', db);
    
    const playersCollection = collection(db, PLAYERS_COLLECTION);
    console.log('Collection créée:', playersCollection);
    
    const querySnapshot = await getDocs(playersCollection);
    console.log('Requête exécutée, nombre de documents:', querySnapshot.size);
    
    const players = {
      cdl: [],
      warzone: []
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document trouvé:', { id: doc.id, ...data });
      if (data.team === 'cdl') {
        players.cdl.push({ id: doc.id, ...data });
      } else if (data.team === 'warzone') {
        players.warzone.push({ id: doc.id, ...data });
      }
    });
    
    console.log('Joueurs récupérés:', players);
    return players;
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des joueurs:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return { cdl: [], warzone: [] };
  }
};

// Fonction pour mettre à jour un joueur
export const updatePlayer = async (playerId, playerData) => {
  try {
    const playerRef = doc(db, PLAYERS_COLLECTION, playerId);
    await updateDoc(playerRef, playerData);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du joueur:', error);
    return false;
  }
};

// Fonction pour créer un nouveau joueur
export const createPlayer = async (playerData) => {
  try {
    const newPlayerRef = doc(collection(db, PLAYERS_COLLECTION));
    await setDoc(newPlayerRef, playerData);
    return newPlayerRef.id;
  } catch (error) {
    console.error('Erreur lors de la création du joueur:', error);
    return null;
  }
};

// Fonctions pour les résultats
export const getResults = async () => {
  try {
    console.log('Début de la récupération des résultats');
    const resultsRef = collection(db, 'results');
    const querySnapshot = await getDocs(resultsRef);
    
    const results = {
      cdl: [],
      warzone: []
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Résultat trouvé:', { id: doc.id, ...data });
      
      if (data.type === 'cdl') {
        results.cdl.push({ id: doc.id, ...data });
      } else if (data.type === 'warzone') {
        results.warzone.push({ id: doc.id, ...data });
      }
    });

    // Trier les résultats par date
    results.cdl.sort((a, b) => {
      const dateA = a.date ? new Date(a.date.split('/').reverse().join('-')) : new Date(0);
      const dateB = b.date ? new Date(b.date.split('/').reverse().join('-')) : new Date(0);
      return dateB - dateA;
    });

    results.warzone.sort((a, b) => {
      const dateA = a.date ? new Date(a.date.split('/').reverse().join('-')) : new Date(0);
      const dateB = b.date ? new Date(b.date.split('/').reverse().join('-')) : new Date(0);
      return dateB - dateA;
    });

    console.log('Résultats triés:', results);
    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    throw error;
  }
};

// Fonction pour formater la position
const formatPosition = (position) => {
  const num = parseInt(position);
  if (num === 1) return '1er du classement';
  return `${num}ème du classement`;
};

export const addResult = async (result) => {
  try {
    console.log('Début de l\'ajout du résultat:', result);
    
    // Vérifier l'authentification
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }
    console.log('Utilisateur authentifié:', user.uid);

    // Vérifier le type de résultat
    if (!result.type || !['cdl', 'warzone'].includes(result.type)) {
      throw new Error('Type de résultat invalide');
    }

    // Formater la date si elle est fournie
    let formattedDate = '';
    if (result.date) {
      const date = new Date(result.date);
      formattedDate = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Créer l'objet de données selon le type
    let resultData;
    if (result.type === 'cdl') {
      // Validation des champs CDL
      if (!result.team1 || !result.team2 || !result.score) {
        throw new Error('Les champs team1, team2 et score sont requis pour les résultats CDL');
      }
      
      resultData = {
        team1: result.team1,
        score: result.score,
        team2: result.team2,
        date: formattedDate,
        type: 'cdl',
        createdAt: new Date().toISOString(),
        team1Logo: result.team1 === 'KDS' ? '/images/kds.png' : '/images/versus.png',
        team2Logo: result.team2 === 'KDS' ? '/images/kds.png' : (result.team2Logo || '/images/versus.png'),
        team2ImageScale: result.imageScale || 1,
        team2ImagePosition: result.imagePosition || { x: 0, y: 0 },
        createdBy: user.uid,
        updatedAt: serverTimestamp()
      };
    } else {
      // Validation des champs Warzone
      if (!result.tournament || !result.position) {
        throw new Error('Les champs tournament et position sont requis pour les résultats Warzone');
      }
      
      resultData = {
        type: result.type,
        tournament: result.tournament,
        position: formatPosition(result.position),
        date: formattedDate,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
    }

    console.log('Données formatées pour Firebase:', resultData);

    // Ajouter le résultat à Firestore
    const docRef = await addDoc(collection(db, 'results'), resultData);
    console.log('Résultat ajouté avec succès, ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'ajout du résultat:', error);
    throw error;
  }
};

export const updateResult = async (id, result) => {
  try {
    const resultRef = doc(db, 'results', id);
    await updateDoc(resultRef, result);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du résultat:', error);
    throw error;
  }
};

export const deleteResult = async (id) => {
  try {
    const resultRef = doc(db, 'results', id);
    await deleteDoc(resultRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du résultat:', error);
    throw error;
  }
}; 