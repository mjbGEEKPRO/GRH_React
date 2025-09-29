import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { authUtils } from "../../../utils/redirectionForm";
import { getGreeting } from "../../../utils/greeting";
import Permissions from "../permission";
import ConnectionHistory from "./connexionHistorique";
import ProjectManagement from "./projectModal";
import TaskManagement from "./taskModal";
import UserManagement from "./userModal";
import Settings from "../setting";
function Admin() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("users");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const isAuthenticated = await authUtils.verifyAndRedirect();
        if (isAuthenticated) {
          const userData = authUtils.getUserData();
          if (userData?.departement !== "Administration") {
            toast.error("Accès non autorisé");
            window.location.href = "/connexion";
            return;
          }
          setUser(userData);
        }
      } catch (error) {
        console.error("Erreur vérification auth:", error);
        window.location.href = "/connexion";
      }
    };

    initializeData();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      authUtils.logout();
    }
  };

  const navigationItems = [
    { id: "users", label: "Utilisateurs", icon: "👥" },
    { id: "projects", label: "Projets", icon: "📁" },
    { id: "tasks", label: "Tâches", icon: "✅" },
    { id: "permissions", label: "Permissions", icon: "🔐" },
    { id: "connexion", label: "connexion", icon: "🕒" },
    { id: "reports", label: "Rapports", icon: "📊" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return (
          <UserManagement
            onNavigateToPermissions={() => setActiveSection("permissions")}
          />
        );
      case "projects":
        return <ProjectManagement />;
      case "tasks":
        return (
          <TaskManagement
            onNavigateToPermissions={() => setActiveSection("permissions")}
          />
        );
      case "permissions":
        return <Permissions />;
      case "connexion":
        return <ConnectionHistory />;
      case "reports":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Section Rapports
            </h2>
            <p className="text-white/70">
              Les rapports et statistiques seront bientôt disponibles.
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Section en construction
            </h2>
            <p className="text-white/70">
              Cette fonctionnalité sera bientôt disponible.
            </p>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/5 backdrop-blur-lg border-r border-white/10">
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-lg">
                {user.prenom?.charAt(0)}
                {user.nom?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-white font-semibold">
                {user.prenom} {user.nom}
              </h2>
              <p className="text-white/60 text-sm">Administrateur</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {getGreeting()}, {user.prenom}
              </h1>
              <p className="text-white/60 text-sm">
                Administration -{" "}
                {
                  navigationItems.find((item) => item.id === activeSection)
                    ?.label
                }
              </p>
            </div>
            {/* Bouton Paramètres */}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 py-2 px-4 rounded-2xl text-white hover:bg-white/20 transition-all duration-300"
              title="Paramètres"
            >
              <svg
                className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/10 backdrop-blur-sm border border-white/20 py-2 px-4 rounded-2xl text-white hover:bg-white/20 transition-all duration-300"
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
      {/* Composant Paramètres */}
      {showSettings && (
        <Settings user={user} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default Admin;
