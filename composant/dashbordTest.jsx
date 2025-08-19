import React, { useState, useEffect } from 'react';

// Simulation de vos authUtils basés sur votre code
const authUtils = {
  getUserData: () => {
    // Simulation basée sur la structure de votre réponse Laravel
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : {
      // Données de test basées sur votre structure
      id: 1,
      nom: "Dupont",
      prenom: "Jean", 
      email: "jean@gmail.com",
      telephone: "0123456789",
      poste: "Développeur",
      poste_id: 2,
      departement: "Informatique" // Basé sur votre logique de redirection
    };
  },
  
  logout: () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    window.location.href = '/connexion';
  }
};

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur comme dans votre code
    const userData = authUtils.getUserData();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    authUtils.logout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Bonsoir';
    if (hour < 12) greeting = 'Bonjour';
    else if (hour < 18) greeting = 'Bon après-midi';
    return greeting;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header similaire à votre design */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">
                  {user.prenom.charAt(0)}{user.nom.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {getGreeting()}, {user.prenom} {user.nom}
                </h1>
                <p className="text-white/80 text-sm">
                  {user.poste} • {user.departement}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-white/10 backdrop-blur-sm border border-white/20 py-2 px-4 rounded-2xl text-white hover:bg-white/20 transition-all duration-300"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal avec le même style que vos formulaires */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          
          {/* Section principale */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Espace {user.departement}
            </h2>
            <p className="text-white/80">
              Bienvenue dans votre espace personnel
            </p>
          </div>

          {/* Cartes d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Carte Informations personnelles */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mes informations
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Nom complet :</span>
                  <span className="text-white font-medium">{user.prenom} {user.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Email :</span>
                  <span className="text-white font-medium text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Téléphone :</span>
                  <span className="text-white font-medium">{user.telephone}</span>
                </div>
              </div>
            </div>

            {/* Carte Département */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Mon département
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Département :</span>
                  <span className="text-white font-medium">{user.departement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Poste :</span>
                  <span className="text-white font-medium">{user.poste}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Statut :</span>
                  <span className="text-green-400 font-medium flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Actif
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section basée sur le type d'utilisateur */}
          <div className="mt-8">
            {user.poste === 'Manager' || user.poste === 'Chef de département' ? (
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Espace Manager - {user.departement}
                </h3>
                <p className="text-white/80 mb-4">
                  En tant que manager, vous avez accès à la gestion de votre département.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-white/70 text-sm">Employés</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">5</div>
                    <div className="text-white/70 text-sm">Projets</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">3</div>
                    <div className="text-white/70 text-sm">En attente</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mon espace personnel
                </h3>
                <p className="text-white/80 mb-4">
                  Bienvenue dans votre espace de travail du département {user.departement}.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">8</div>
                    <div className="text-white/70 text-sm">Tâches</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">2</div>
                    <div className="text-white/70 text-sm">En cours</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">15</div>
                    <div className="text-white/70 text-sm">Jours congés</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message basé sur le département */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Vous êtes connecté au département <span className="text-white font-medium">{user.departement}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;