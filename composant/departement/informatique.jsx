import React from "react";
import { authUtils } from "../redirectionForm";
import { useState, useEffect } from "react";

function Informatiques() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérification d'authentification et récupération des données
    const initializeComponent = async () => {
      try {
        console.log("🚀 Initialisation du composant Informatique...");

        //Vérifier l'authentification avec validation du token
        const isAuthenticated = await authUtils.verifyAndRedirect();

        if (isAuthenticated) {
          setUser(authUtils.getUserData());
        }
      } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation:', err);
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    initializeComponent();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      authUtils.logout();
    }
  };

  const getStatusColor = (statut) => {
    return statut ? "text-green-400" : "text-red-400";
  };

  const getStatusText = (statut) => {
    return statut ? "Actif" : "Inactif";
  };

  const getStatusIcon = (statut) => {
    return statut ? "✅" : "❌";
  };

  const getDepartmentIcon = (departement) => {
    switch (departement) {
      case "Informatique":
        return "💻";
      case "Comptabilité":
        return "📊";
      case "Ressources humaines":
        return "👥";
      case "Administration":
        return "🏢";
      default:
        return "📋";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Vérification de votre session...</p>
          <p className="text-sm text-white/70 mt-2">Validation du token en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
          <h2 className="text-white text-2xl font-bold mb-4">❌ Erreur</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-2xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header avec informations principales */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Informations utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Avatar avec initiales */}
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-white font-bold text-xl">
                  {user.prenom.charAt(0)}
                  {user.nom.charAt(0)}
                </span>
              </div>

              {/* Détails utilisateur */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {getGreeting()}, {user.prenom} {user.nom}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-white/80">{user.poste}</p>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <p className="text-white/80 flex items-center">
                    {getDepartmentIcon(user.departement)} {user.departement}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de déconnexion */}
            <button
              onClick={handleLogout}
              className="bg-white/10 backdrop-blur-sm border border-white/20 py-3 px-6 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 group"
            >
              <svg
                className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carte principale avec informations détaillées */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 mb-8">
          {/* En-tête de la carte */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg text-4xl">
              {getDepartmentIcon(user.departement)}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Département {user.departement}
            </h2>
            <p className="text-white/80 text-lg">
              Espace personnel de {user.prenom} {user.nom}
            </p>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Carte Nom complet */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-white/70 text-sm uppercase tracking-wide mb-2">
                Nom complet
              </div>
              <div className="text-white font-bold text-lg">
                {user.prenom} {user.nom}
              </div>
              <div className="text-white/60 text-sm mt-1">{user.poste}</div>
            </div>

            {/* Carte Département */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-white/70 text-sm uppercase tracking-wide mb-2">
                Département
              </div>
              <div className="text-white font-bold text-lg flex items-center justify-center">
                <span className="mr-2 text-2xl">
                  {getDepartmentIcon(user.departement)}
                </span>
                {user.departement}
              </div>
              <div className="text-white/60 text-sm mt-1">Service actuel</div>
            </div>

            {/* Carte Statut */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-white/70 text-sm uppercase tracking-wide mb-2">
                Statut
              </div>
              <div
                className={`font-bold text-lg flex items-center justify-center ${getStatusColor(
                  user.statut
                )}`}
              >
                <span className="mr-2 text-xl">
                  {getStatusIcon(user.statut)}
                </span>
                {getStatusText(user.statut)}
              </div>
              <div className="text-white/60 text-sm mt-1">
                {user.statut ? "Compte activé" : "Compte désactivé"}
              </div>
            </div>

            {/* Carte Contact */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-white/70 text-sm uppercase tracking-wide mb-2">
                Contact
              </div>
              <div className="text-white font-bold text-lg">📧</div>
              <div className="text-white/80 text-sm mt-1 break-all">
                {user.email}
              </div>
              <div className="text-white/60 text-xs mt-1">
                Email professionnel
              </div>
            </div>
          </div>
        </div>

        {/* Message de bienvenue personnalisé */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <p className="text-white text-lg">
              🎉 Bienvenue dans votre espace personnel du département{" "}
              <span className="font-bold">{user.departement}</span> !
            </p>
            <p className="text-white/70 text-sm mt-2">
              Votre compte est{" "}
              <span className={`font-semibold ${getStatusColor(user.statut)}`}>
                {getStatusText(user.statut).toLowerCase()}
              </span>{" "}
              et prêt à l'emploi.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Informatiques;
