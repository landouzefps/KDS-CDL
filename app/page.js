'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { getPlayers, getResults } from './firebase/db';
import { isAdmin } from './firebase/admin';

export default function Home() {
  const [cdlPlayers, setCdlPlayers] = useState([]);
  const [warzonePlayers, setWarzonePlayers] = useState([]);
  const [cdlResults, setCdlResults] = useState([]);
  const [warzoneResults, setWarzoneResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('cdl');
  const [currentWarzonePage, setCurrentWarzonePage] = useState(0);
  const [currentCdlPage, setCurrentCdlPage] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Chargement des données...');
        const [players, results] = await Promise.all([
          getPlayers(),
          getResults()
        ]);
        console.log('Données chargées:', { players, results });
        setCdlPlayers(players.cdl);
        setWarzonePlayers(players.warzone);
        setCdlResults(results.cdl);
        setWarzoneResults(results.warzone);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAdminStatus = () => {
      const user = auth.currentUser;
      setIsUserAdmin(isAdmin(user));
    };

    loadData();
    checkAdminStatus();
  }, []);

  return (
    <main className="min-h-screen bg-secondary text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/kds.png"
            alt="KingDoom Squad Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-secondary/90" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-4"
        >
          <h1 className="text-6xl font-bold mb-6 animate-float">KINGDOOM SQUAD</h1>
          <p className="text-xl mb-8">La nouvelle génération du gaming compétitif</p>
          <a href="#roster" className="btn-primary mb-12">
            Découvrir nos roster
          </a>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-16"
          >
            <h2 className="text-2xl font-semibold text-primary mb-4">Qui sommes-nous</h2>
            <p className="text-lg text-gray-300">
              King Doom Squad est une équipe e-sport passionnée et déterminée, spécialisée dans la compétition sur Call of Duty. Avec un roster CDL structuré et une équipe Warzone affûtée, nous repoussons nos limites à chaque match pour atteindre l'excellence.
            </p>
            <p className="text-lg text-gray-300 mt-4">
              Notre objectif ? Dominer le jeu, faire vibrer notre communauté et imposer notre nom sur la scène e-sport. Que ce soit en stratégie, en précision ou en esprit d'équipe, nous incarnons la rage de vaincre.
            </p>
            <p className="text-lg text-gray-300 mt-4">
              Rejoins-nous et suis notre ascension vers la gloire !
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Roster Section */}
      <section id="roster" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title animate-float">Nos Roster</h2>
          
          {/* Équipe CDL */}
          <div className="mb-24 relative h-[600px]">
            <div className="absolute inset-0">
              <Image
                src="/images/cdl.jpg"
                alt="CDL Background"
                fill
                className="object-cover rounded-2xl opacity-20"
                priority
              />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="flex items-center justify-center mb-12">
                <Image
                  src="/images/cdl-logo.png"
                  alt="CDL Logo"
                  width={150}
                  height={150}
                  className="mr-6"
                />
                <h3 className="text-4xl font-bold text-primary">Équipe CDL</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {loading ? (
                  <div className="col-span-4 text-center">Chargement...</div>
                ) : cdlPlayers.length === 0 ? (
                  <div className="col-span-4 text-center">Aucun joueur CDL trouvé</div>
                ) : (
                  cdlPlayers.map((player) => (
                    <motion.div
                      key={player.id}
                      whileHover={{ scale: 1.05 }}
                      className="card backdrop-blur-sm bg-secondary/80"
                    >
                      <div className="w-40 h-40 bg-primary/20 rounded-full mx-auto mb-4 relative overflow-hidden">
                        {player.image ? (
                          <Image
                            src={player.image}
                            alt={player.name}
                            fill
                            className="object-contain transition-transform duration-200"
                            style={{
                              transform: `scale(${player.imageScale || 1}) translate(${player.imagePosition?.x || 0}px, ${player.imagePosition?.y || 0}px)`
                            }}
                          />
                        ) : player.name.toLowerCase().includes('landouze') ? (
                          <Image
                            src="/images/landouze.png"
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-center">{player.name}</h3>
                      <p className="text-center text-primary mb-2">{player.role}</p>
                      <p className="text-center text-gray-400 text-sm">{player.description}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Équipe Warzone */}
          <div className="relative h-[600px]">
            <div className="absolute inset-0">
              <Image
                src="/images/wz.jpg"
                alt="Warzone Background"
                fill
                className="object-cover rounded-2xl opacity-20"
                priority
              />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="flex items-center justify-center mb-12">
                <Image
                  src="/images/warzone-logo.png"
                  alt="Warzone Logo"
                  width={150}
                  height={150}
                  className="mr-6"
                />
                <h3 className="text-4xl font-bold text-primary">Équipe Warzone</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {loading ? (
                  <div className="col-span-4 text-center">Chargement...</div>
                ) : warzonePlayers.length === 0 ? (
                  <div className="col-span-4 text-center">Aucun joueur Warzone trouvé</div>
                ) : (
                  warzonePlayers.map((player) => (
                    <motion.div
                      key={player.id}
                      whileHover={{ scale: 1.05 }}
                      className="card backdrop-blur-sm bg-secondary/80"
                    >
                      <div className="w-40 h-40 bg-primary/20 rounded-full mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-center">{player.name}</h3>
                      <p className="text-center text-primary mb-2">{player.role}</p>
                      <p className="text-center text-gray-400 text-sm">{player.description}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title animate-float">Nos Résultats</h2>
          
          {/* Onglets */}
          <div className="flex justify-center mb-8 space-x-4">
            <button
              onClick={() => setActiveTab('cdl')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'cdl'
                  ? 'bg-primary text-white'
                  : 'bg-secondary/80 text-gray-300 hover:bg-secondary'
              }`}
            >
              CDL
            </button>
            <button
              onClick={() => setActiveTab('warzone')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'warzone'
                  ? 'bg-primary text-white'
                  : 'bg-secondary/80 text-gray-300 hover:bg-secondary'
              }`}
            >
              Warzone
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="card">
            {activeTab === 'cdl' ? (
              <div className="space-y-8">
                {loading ? (
                  <div className="text-center">Chargement...</div>
                ) : cdlResults.length === 0 ? (
                  <div className="text-center">Aucun résultat CDL trouvé</div>
                ) : (
                  cdlResults.map((match) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-secondary/50 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col items-center">
                          {match.team1Logo && (
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-primary/20 relative">
                              <Image
                                src={match.team1Logo}
                                alt={`Logo ${match.team1}`}
                                fill
                                className={`object-contain p-0 ${match.team1 === 'KDS' ? 'scale-[1.75]' : ''}`}
                              />
                            </div>
                          )}
                          <span className="text-xl font-bold text-center">{match.team1}</span>
                        </div>
                        <span className="text-3xl font-bold text-accent mx-8">{match.score}</span>
                        <div className="flex flex-col items-center">
                          {match.team2Logo && (
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-primary/20 relative">
                              <Image
                                src={match.team2Logo}
                                alt={`Logo ${match.team2}`}
                                fill
                                className={`object-contain p-0 transition-transform duration-200`}
                                style={{
                                  transform: `scale(${match.team2ImageScale || 1}) translate(${match.team2ImagePosition?.x || 0}px, ${match.team2ImagePosition?.y || 0}px)`
                                }}
                              />
                            </div>
                          )}
                          <span className="text-xl font-bold text-center">{match.team2}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-center">{match.date}</p>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-3 text-center">Chargement...</div>
                ) : warzoneResults.length === 0 ? (
                  <div className="col-span-3 text-center">Aucun résultat Warzone trouvé</div>
                ) : (
                  warzoneResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-secondary/50 p-4 rounded-lg"
                    >
                      <h4 className="text-xl font-bold mb-2">{result.tournament}</h4>
                      <p className="text-accent font-bold mb-2">{result.position}</p>
                      <p className="text-gray-400">{result.date}</p>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">Rejoins-nous</h2>
          <div className="card max-w-2xl mx-auto text-center">
            <p className="text-xl mb-8">Rejoins notre communauté Discord pour faire partie de l'aventure KingDoom Squad</p>
            <a 
              href="https://discord.gg/AazMkCPWr4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Rejoindre notre Discord
            </a>
          </div>
        </div>
      </section>
    </main>
  );
} 