import React from "react";
import { authUtils } from "../../utils/redirectionForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { getGreeting } from "../../utils/greeting";
import axios from "axios";
function Comptabilite() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [myTasks, setMyTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const isAuthenticated = await authUtils.verifyAndRedirect();

        if (isAuthenticated) {
          const userData = authUtils.getUserData();
          setUser(userData);
          loadEmployeeData(userData);
          authUtils.scheduleAutoLogout();
        }
      } catch {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, []);

  const loadEmployeeData = async () => {
    try {
      const response = await axios.get("http://localhost/api/employee-data");
      setMyTasks(response.data.data.tasks);
      setMyProjects(response.data.data.projects);
      setStats(response.data.data.stats);
      console.log("tache ", myTasks);
    } catch {
      toast.error("Erreur lors du chargement des données");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      console.log("connexion...");
      const res = await axios.patch(
        `http://127.0.0.1:8000/api/tasks/${taskId}/status`,
        {
          statut: newStatus,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setMyTasks(
          myTasks.map((task) =>
            task.id === taskId ? { ...task, statut: newStatus } : task
          )
        );
        // Recalculer les stats
        const updatedTasks = myTasks.map((task) =>
          task.id === taskId ? { ...task, statut: res.data.newstat } : task
        );

        const newStats = {
          ...stats,
          completedTasks: updatedTasks.filter((t) => t.statut === "Terminé")
            .length,
          inProgressTasks: updatedTasks.filter((t) => t.statut === "En cours")
            .length,
          pendingTasks: updatedTasks.filter((t) => t.statut === "A faire")
            .length,
        };
        setStats(newStats);
      }
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      authUtils.logout();
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "Terminé":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "En cours":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "En attente":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "A faire":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getPriorityColor = (priorite) => {
    switch (priorite) {
      case "Haute":
        return "text-red-400 bg-red-500/20";
      case "Normale":
        return "text-blue-400 bg-blue-500/20";
      case "Basse":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
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

  const isTaskOverdue = (dateEcheance, statut) => {
    return new Date(dateEcheance) < new Date() && statut !== "Terminé";
  };

  const renderDashboard = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
        <p className="text-white/70">Vue d'ensemble de vos tâches et projets</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-1">
                Tâches totales
              </h3>
              <p className="text-2xl font-bold text-white">
                {stats.totalTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-blue-400 text-xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-1">
                Terminées
              </h3>
              <p className="text-2xl font-bold text-green-400">
                {stats.completedTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-1">
                En cours
              </h3>
              <p className="text-2xl font-bold text-blue-400">
                {stats.inProgressTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-blue-400 text-xl">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-1">
                En retard
              </h3>
              <p className="text-2xl font-bold text-red-400">
                {stats.overdueTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tâches urgentes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Tâches prioritaires
        </h2>
        <div className="space-y-3">
          {myTasks
            .filter(
              (task) => task.priorite === "Haute" && task.statut !== "Terminé"
            )
            .slice(0, 3)
            .map((task) => (
              <div
                key={task.id}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">{task.titre}</h3>
                    <p className="text-white/60 text-sm">
                      Échéance:{" "}
                      {new Date(task.date_echeance).toLocaleDateString()}
                      {isTaskOverdue(task.date_echeance, task.statut) && (
                        <span className="text-red-400 ml-2 font-medium">
                          ⚠️ En retard
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {task.statut !== "En cours" && (
                      <button
                        onClick={() => updateTaskStatus(task.id, "En cours")}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Commencer
                      </button>
                    )}
                    {task.statut !== "Terminé" && (
                      <button
                        onClick={() => updateTaskStatus(task.id, "Terminé")}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Terminer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Projets actifs */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Mes projets actifs
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myProjects
            .filter((p) => p.statut === "En cours")
            .map((project) => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {project.nom}
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    {project.description}
                  </p>

                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-white/60 mb-1">
                      <span>Progression</span>
                      <span>{project.progression}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progression}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-white/60">
                    <div>Budget: {project.budget.toLocaleString()} FCFA</div>
                    <div>
                      Échéance:{" "}
                      {new Date(project.date_fin_prevue).toLocaleDateString()}
                    </div>
                    <div>Mes tâches: {project.myTasks}</div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("tasks")}
                  className="w-full bg-white/10 hover:bg-white/15 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Voir mes tâches du projet
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mes Tâches</h1>
        <p className="text-white/70">
          Gérez et suivez l'avancement de vos tâches
        </p>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {myTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white/10 backdrop-blur-lg border rounded-2xl p-6 ${
              isTaskOverdue(task.date_echeance, task.statut)
                ? "border-red-500/50"
                : "border-white/20"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {task.titre}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(
                      task.priorite
                    )}`}
                  >
                    {task.priorite}
                  </span>
                  {isTaskOverdue(task.date_echeance, task.statut) && (
                    <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      En retard
                    </span>
                  )}
                </div>
                <p className="text-white/70 mb-3">{task.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                  <div>
                    <span className="font-medium">Échéance:</span>{" "}
                    {new Date(task.date_echeance).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Créée le:</span>{" "}
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                  {task.projetNom && (
                    <div>
                      <span className="font-medium">Projet:</span>{" "}
                      {task.projetNom}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-6 flex flex-col items-end gap-3">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                    task.statut
                  )}`}
                >
                  {task.statut}
                </span>

                <div className="flex flex-col gap-1">
                  {task.statut === "A faire" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, "En cours")}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Commencer
                    </button>
                  )}
                  {task.statut === "En cours" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, "Terminé")}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Terminer
                    </button>
                  )}
                  {task.statut === "Terminé" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, "En cours")}
                      className="text-xs px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Rouvrir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mes Projets</h1>
        <p className="text-white/70">
          Suivez l'avancement de vos projets en cours
        </p>
      </div>

      <div className="space-y-6">
        {myProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {project.nom}
                </h3>
                <p className="text-white/70 mb-3">{project.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                  <div>Budget: {project.budget.toLocaleString()} FCFA</div>
                  <div>
                    Échéance:{" "}
                    {new Date(project.dateFinPrevue).toLocaleDateString()}
                  </div>
                  <div>Départements: {project.departements.join(", ")}</div>
                </div>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                  project.statut
                )}`}
              >
                {project.statut}
              </span>
            </div>

            {/* Barre de progression */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Progression globale</span>
                <span>{project.progression}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${project.progression}%` }}
                ></div>
              </div>
            </div>

            {/* Mes tâches dans ce projet */}
            <div>
              <h4 className="text-white font-medium mb-3">
                Mes tâches dans ce projet ({project.myTasks})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/5"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-white font-medium text-sm">
                        {task.titre}
                      </h5>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          task.statut
                        )}`}
                      >
                        {task.statut}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mb-2">
                      Échéance:{" "}
                      {new Date(task.dateEcheance).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1">
                      {task.statut === "A faire" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "En cours")}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Commencer
                        </button>
                      )}
                      {task.statut === "En cours" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "Terminé")}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Terminer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Erreur</h2>
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
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-white font-bold text-xl">
                  {user.prenom.charAt(0)}
                  {user.nom.charAt(0)}
                </span>
              </div>
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

      {/* Navigation Tabs */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "text-white border-blue-400"
                  : "text-white/70 border-transparent hover:text-white"
              }`}
            >
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "tasks"
                  ? "text-white border-blue-400"
                  : "text-white/70 border-transparent hover:text-white"
              }`}
            >
              Mes tâches ({myTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "projects"
                  ? "text-white border-blue-400"
                  : "text-white/70 border-transparent hover:text-white"
              }`}
            >
              Mes projets ({myProjects.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "tasks" && renderTasks()}
        {activeTab === "projects" && renderProjects()}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="backdrop-blur-lg"
      />
    </div>
  );
}
export default Comptabilite;
