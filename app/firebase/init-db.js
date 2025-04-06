import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { app } from './config';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(app);

const initialPlayers = {
  cdl: [
    {
      name: "Joueur 1",
      role: "SMG",
      description: "Spécialiste des combats rapprochés, connu pour son agressivité et sa précision",
      team: "cdl"
    },
    {
      name: "Joueur 2",
      role: "AR",
      description: "Maître du contrôle des zones, expert en stratégie et en positionnement",
      team: "cdl"
    },
    {
      name: "Joueur 3",
      role: "Flex",
      description: "Polyvalent et adaptable, capable de s'adapter à toutes les situations",
      team: "cdl"
    },
    {
      name: "Joueur 4",
      role: "Support",
      description: "Pilier de l'équipe, spécialiste en coordination et en communication",
      team: "cdl"
    }
  ],
  warzone: [
    {
      name: "Joueur 1",
      role: "Sniper",
      description: "Expert en tir longue distance, maître du positionnement stratégique",
      team: "warzone"
    },
    {
      name: "Joueur 2",
      role: "Assault",
      description: "Spécialiste des combats rapprochés, leader naturel de l'équipe",
      team: "warzone"
    },
    {
      name: "Joueur 3",
      role: "Support",
      description: "Coordinateur tactique, expert en gestion des ressources",
      team: "warzone"
    },
    {
      name: "Joueur 4",
      role: "Flex",
      description: "Polyvalent et adaptable, capable de s'adapter à toutes les situations",
      team: "warzone"
    }
  ]
};

export const initializeDatabase = async () => {
  try {
    console.log('Début de l\'initialisation de la base de données...');
    
    // Supprimer tous les joueurs existants
    const playersCollection = collection(db, 'players');
    const existingPlayers = await getDocs(playersCollection);
    
    console.log('Suppression des joueurs existants...');
    for (const doc of existingPlayers.docs) {
      await deleteDoc(doc.ref);
    }
    
    console.log('Création des joueurs CDL...');
    for (const player of initialPlayers.cdl) {
      const docRef = doc(playersCollection);
      await setDoc(docRef, player);
      console.log('Joueur CDL créé:', player.name);
    }
    
    console.log('Création des joueurs Warzone...');
    for (const player of initialPlayers.warzone) {
      const docRef = doc(playersCollection);
      await setDoc(docRef, player);
      console.log('Joueur Warzone créé:', player.name);
    }
    
    // Vérifier que tout a été créé
    const finalCheck = await getDocs(playersCollection);
    console.log('Nombre total de joueurs créés:', finalCheck.size);
    
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur détaillée lors de l\'initialisation:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}; 