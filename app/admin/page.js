'use client';

import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getPlayers, updatePlayer, createPlayer, addResult, getResults, deleteResult } from '../firebase/db';
import { isAdmin } from '../firebase/admin';
import Link from 'next/link';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState({ cdl: [], warzone: [] });
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerImage, setPlayerImage] = useState(null);
  const [playerImageFile, setPlayerImageFile] = useState(null);
  const [playerImageScale, setPlayerImageScale] = useState(1);
  const [playerImagePosition, setPlayerImagePosition] = useState({ x: 0, y: 0 });
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  const [cdlResults, setCdlResults] = useState([]);
  const [warzoneResults, setWarzoneResults] = useState([]);
  const [newCdlResult, setNewCdlResult] = useState({
    team1: '',
    score: '',
    team2: '',
    date: '',
    team2Logo: '',
    team2LogoFile: null,
    imageScale: 1,
    imagePosition: { x: 0, y: 0 }
  });
  const [newWarzoneResult, setNewWarzoneResult] = useState({
    tournament: '',
    position: '',
    date: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playersData, resultsData] = await Promise.all([
          getPlayers(),
          getResults()
        ]);
        setPlayers(playersData);
        setCdlResults(resultsData.cdl);
        setWarzoneResults(resultsData.warzone);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const adminStatus = await isAdmin(user);
      setIsUserAdmin(adminStatus);
      if (adminStatus) {
        loadPlayers();
      }
    });

    return () => unsubscribe();
  };

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const players = await getPlayers();
      setPlayers(players);
    } catch (error) {
      setMessage('Erreur lors du chargement des joueurs');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
  };

  const handlePlayerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlayerImageFile(file);
      setPlayerImage(URL.createObjectURL(file));
      setPlayerImageScale(1);
      setPlayerImagePosition({ x: 0, y: 0 });
    }
  };

  const handlePlayerZoomIn = () => {
    setPlayerImageScale(prev => Math.min(prev + 0.1, 2));
  };

  const handlePlayerZoomOut = () => {
    setPlayerImageScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handlePlayerImageDrag = (e) => {
    if (e.type === 'mousedown') {
      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { ...playerImagePosition };

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        setPlayerImagePosition({
          x: startPos.x + deltaX,
          y: startPos.y + deltaY
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleSavePlayer = async (editedPlayer) => {
    try {
      setLoading(true);
      const playerData = {
        name: editedPlayer.name,
        role: editedPlayer.role,
        description: editedPlayer.description,
        team: editedPlayer.team
      };

      // Si une nouvelle image a été uploadée
      if (playerImageFile) {
        // TODO: Upload l'image vers Firebase Storage
        // Pour l'instant, on utilise l'URL temporaire
        playerData.image = playerImage;
        playerData.imageScale = playerImageScale;
        playerData.imagePosition = playerImagePosition;
      }

      const success = await updatePlayer(editedPlayer.id, playerData);

      if (success) {
        setMessage('Joueur mis à jour avec succès');
        loadPlayers();
      } else {
        setMessage('Erreur lors de la mise à jour du joueur');
      }
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du joueur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setEditingPlayer(null);
      setPlayerImage(null);
      setPlayerImageFile(null);
      setPlayerImageScale(1);
      setPlayerImagePosition({ x: 0, y: 0 });
      
      // Réinitialisation de l'input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCdlResult(prev => ({ 
        ...prev, 
        team2LogoFile: file,
        team2Logo: URL.createObjectURL(file),
        imageScale: 1,
        imagePosition: { x: 0, y: 0 }
      }));
    }
  };

  const handleZoomIn = () => {
    setNewCdlResult(prev => ({
      ...prev,
      imageScale: Math.min(prev.imageScale + 0.1, 2)
    }));
  };

  const handleZoomOut = () => {
    setNewCdlResult(prev => ({
      ...prev,
      imageScale: Math.max(prev.imageScale - 0.1, 0.5)
    }));
  };

  const handleImageDrag = (e) => {
    if (e.type === 'mousedown') {
      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { ...newCdlResult.imagePosition };

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        setNewCdlResult(prev => ({
          ...prev,
          imagePosition: {
            x: startPos.x + deltaX,
            y: startPos.y + deltaY
          }
        }));
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleAddCdlResult = async (e) => {
    e.preventDefault();
    try {
      console.log('Début de l\'ajout d\'un résultat CDL:', newCdlResult);
      
      // Vérification des données requises
      if (!newCdlResult.team1 || !newCdlResult.score || !newCdlResult.team2 || !newCdlResult.date) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      const newResult = {
        ...newCdlResult,
        type: 'cdl',
        createdAt: new Date().toISOString()
      };

      // Si une nouvelle image a été uploadée
      if (newCdlResult.team2LogoFile) {
        // TODO: Upload l'image vers Firebase Storage
        // Pour l'instant, on utilise l'URL temporaire
        newResult.team2Logo = newCdlResult.team2Logo;
      }

      console.log('Données préparées pour l\'ajout:', newResult);
      await addResult(newResult);
      
      const results = await getResults();
      console.log('Résultats mis à jour:', results);
      
      setCdlResults(results.cdl);
      
      // Réinitialisation du formulaire
      setNewCdlResult({
        team1: '',
        score: '',
        team2: '',
        date: '',
        team2Logo: '',
        team2LogoFile: null,
        imageScale: 1,
        imagePosition: { x: 0, y: 0 }
      });

      // Réinitialisation de l'input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Erreur détaillée lors de l\'ajout du résultat:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert('Erreur lors de l\'ajout du résultat. Veuillez réessayer.');
    }
  };

  const handleAddWarzoneResult = async (e) => {
    e.preventDefault();
    try {
      // Vérification des données requises
      if (!newWarzoneResult.tournament || !newWarzoneResult.position || !newWarzoneResult.date) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      const newResult = {
        ...newWarzoneResult,
        type: 'warzone',
        createdAt: new Date().toISOString()
      };

      await addResult(newResult);
      const results = await getResults();
      setWarzoneResults(results.warzone);
      setNewWarzoneResult({
        tournament: '',
        position: '',
        date: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du résultat:', error);
      alert('Erreur lors de l\'ajout du résultat. Veuillez réessayer.');
    }
  };

  const handleDeleteResult = async (id) => {
    try {
      await deleteResult(id);
      const results = await getResults();
      setCdlResults(results.cdl);
      setWarzoneResults(results.warzone);
    } catch (error) {
      console.error('Erreur lors de la suppression du résultat:', error);
    }
  };

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-secondary text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8 pt-8">
            <h1 className="text-3xl font-bold">Accès refusé</h1>
            <Link href="/" className="btn-primary">
              Retour au site
            </Link>
          </div>
          <p className="text-gray-400">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 pt-8">
          <h1 className="text-3xl font-bold">Administration</h1>
          <Link href="/" className="btn-primary">
            Retour au site
          </Link>
        </div>
        
        {message && (
          <div className={`p-4 rounded mb-4 ${
            message.includes('succès') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'players' ? 'bg-primary' : 'bg-primary/20'}`}
          >
            Joueurs
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'results' ? 'bg-primary' : 'bg-primary/20'}`}
          >
            Résultats
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'players' ? (
          <>
            {/* Équipe CDL */}
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Équipe CDL</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-2 text-center">Chargement...</div>
                ) : (
                  players.cdl.map((player) => (
                    <div key={player.id} className="bg-secondary/50 p-4 rounded-lg">
                      {editingPlayer?.id === player.id ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleSavePlayer(editingPlayer);
                        }} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Nom</label>
                            <input
                              type="text"
                              value={editingPlayer.name}
                              onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                              className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Rôle</label>
                            <select
                              value={editingPlayer.role}
                              onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                              className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none"
                              required
                            >
                              <option value="SMG">SMG</option>
                              <option value="AR">AR</option>
                              <option value="Flex">Flex</option>
                              <option value="Support">Support</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                              value={editingPlayer.description}
                              onChange={(e) => setEditingPlayer({ ...editingPlayer, description: e.target.value })}
                              className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none h-32"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Photo du joueur</label>
                            <div className="flex gap-4 items-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePlayerImageChange}
                                className="bg-secondary/50 p-2 rounded-lg"
                              />
                              {playerImage && (
                                <div className="relative">
                                  <div 
                                    className="w-32 h-32 rounded-full border-2 border-primary/20 overflow-hidden bg-secondary/50"
                                    onMouseDown={handlePlayerImageDrag}
                                  >
                                    <img 
                                      src={playerImage} 
                                      alt="Photo prévisualisation" 
                                      className="w-full h-full object-contain transition-transform duration-200"
                                      style={{
                                        transform: `scale(${playerImageScale}) translate(${playerImagePosition.x}px, ${playerImagePosition.y}px)`
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={handlePlayerZoomIn}
                                      className="px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handlePlayerZoomOut}
                                      className="px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
                                    >
                                      -
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPlayer(null);
                                setPlayerImage(null);
                                setPlayerImageFile(null);
                              }}
                              className="px-4 py-2 text-white hover:text-primary transition-colors"
                              disabled={loading}
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={loading}
                            >
                              {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold">{player.name}</h3>
                              <p className="text-primary">{player.role}</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingPlayer(player);
                                setPlayerImage(player.image || null);
                              }}
                              className="text-primary hover:text-primary/80"
                            >
                              ✎
                            </button>
                          </div>
                          {player.image && (
                            <div className="w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden bg-secondary/50 mb-4">
                              <img 
                                src={player.image} 
                                alt={player.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <p className="text-gray-400 text-sm">{player.description}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Équipe Warzone */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Équipe Warzone</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-2 text-center">Chargement...</div>
                ) : (
                  players.warzone.map((player) => (
                    <div key={player.id} className="bg-secondary/50 p-4 rounded-lg">
                      {editingPlayer?.id === player.id ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleSavePlayer(editingPlayer);
                        }} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Nom</label>
                            <input
                              type="text"
                              value={editingPlayer.name}
                              onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                              className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Rôle</label>
                            <select
                              value={editingPlayer.role}
                              onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                              className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none"
                              required
                            >
                              <option value="Sniper">Sniper</option>
                              <option value="Assault">Assault</option>
                              <option value="Support">Support</option>
                              <option value="Flex">Flex</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                              value={editingPlayer.description}
                              onChange={(e) => setEditingPlayer({ ...editingPlayer, description: e.target.value })}
                              className="w-full p-2 rounded bg-secondary/50 border border-primary/20 focus:border-primary outline-none h-32"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Photo du joueur</label>
                            <div className="flex gap-4 items-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePlayerImageChange}
                                className="bg-secondary/50 p-2 rounded-lg"
                              />
                              {playerImage && (
                                <div className="relative">
                                  <div 
                                    className="w-32 h-32 rounded-full border-2 border-primary/20 overflow-hidden bg-secondary/50"
                                    onMouseDown={handlePlayerImageDrag}
                                  >
                                    <img 
                                      src={playerImage} 
                                      alt="Photo prévisualisation" 
                                      className="w-full h-full object-contain transition-transform duration-200"
                                      style={{
                                        transform: `scale(${playerImageScale}) translate(${playerImagePosition.x}px, ${playerImagePosition.y}px)`
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={handlePlayerZoomIn}
                                      className="px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handlePlayerZoomOut}
                                      className="px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
                                    >
                                      -
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPlayer(null);
                                setPlayerImage(null);
                                setPlayerImageFile(null);
                              }}
                              className="px-4 py-2 text-white hover:text-primary transition-colors"
                              disabled={loading}
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={loading}
                            >
                              {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold">{player.name}</h3>
                              <p className="text-primary">{player.role}</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingPlayer(player);
                                setPlayerImage(player.image || null);
                              }}
                              className="text-primary hover:text-primary/80"
                            >
                              ✎
                            </button>
                          </div>
                          {player.image && (
                            <div className="w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden bg-secondary/50 mb-4">
                              <img 
                                src={player.image} 
                                alt={player.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <p className="text-gray-400 text-sm">{player.description}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Résultats CDL */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Résultats CDL</h2>
              <form onSubmit={handleAddCdlResult} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Équipe 1"
                    value={newCdlResult.team1}
                    onChange={(e) => setNewCdlResult(prev => ({ ...prev, team1: e.target.value }))}
                    className="bg-secondary/50 p-2 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Score"
                    value={newCdlResult.score}
                    onChange={(e) => setNewCdlResult(prev => ({ ...prev, score: e.target.value }))}
                    className="bg-secondary/50 p-2 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Équipe 2"
                    value={newCdlResult.team2}
                    onChange={(e) => setNewCdlResult(prev => ({ ...prev, team2: e.target.value }))}
                    className="bg-secondary/50 p-2 rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    value={newCdlResult.date}
                    onChange={(e) => setNewCdlResult(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-secondary/50 p-2 rounded-lg"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="bg-secondary/50 p-2 rounded-lg"
                    />
                    {newCdlResult.team2Logo && (
                      <div className="relative">
                        <div 
                          className="w-32 h-32 rounded-full border-2 border-primary/20 overflow-hidden bg-secondary/50"
                          onMouseDown={handleImageDrag}
                        >
                          <img 
                            src={newCdlResult.team2Logo} 
                            alt="Logo prévisualisation" 
                            className="w-full h-full object-contain transition-transform duration-200"
                            style={{
                              transform: `scale(${newCdlResult.imageScale}) translate(${newCdlResult.imagePosition.x}px, ${newCdlResult.imagePosition.y}px)`
                            }}
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleZoomIn}
                            className="px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={handleZoomOut}
                            className="px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn-primary">
                    Ajouter le résultat
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {cdlResults.map((result) => (
                  <div key={result.id} className="bg-secondary/50 p-4 rounded-lg relative">
                    <button
                      onClick={() => handleDeleteResult(result.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">{result.team1}</span>
                      <span className="text-2xl font-bold text-accent mx-4">{result.score}</span>
                      <span className="text-xl font-bold">{result.team2}</span>
                    </div>
                    <p className="text-gray-400 text-center mt-2">{result.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Résultats Warzone */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Résultats Warzone</h2>
              <form onSubmit={handleAddWarzoneResult} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nom du tournoi"
                    value={newWarzoneResult.tournament}
                    onChange={(e) => setNewWarzoneResult(prev => ({ ...prev, tournament: e.target.value }))}
                    className="bg-secondary/50 p-2 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={newWarzoneResult.position}
                    onChange={(e) => setNewWarzoneResult(prev => ({ ...prev, position: e.target.value }))}
                    className="bg-secondary/50 p-2 rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    value={newWarzoneResult.date}
                    onChange={(e) => setNewWarzoneResult(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-secondary/50 p-2 rounded-lg"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Ajouter le résultat
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {warzoneResults.map((result) => (
                  <div key={result.id} className="bg-secondary/50 p-4 rounded-lg relative">
                    <button
                      onClick={() => handleDeleteResult(result.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h4 className="text-xl font-bold mb-2">{result.tournament}</h4>
                    <p className="text-accent font-bold mb-2">{result.position}</p>
                    <p className="text-gray-400">{result.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 