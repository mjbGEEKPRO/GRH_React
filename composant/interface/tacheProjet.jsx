import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { getGreeting } from "../../utils/greeting";
import { authUtils } from "../../utils/redirectionForm";
import axios from "axios";

function ProjectTaskManager() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // États pour les formulaires
  const [projectForm, setProjectForm] = useState({
    nom: "",
    budget: "",
    dateFinPrevue: "",
    description: "",
    departement: "",
    statut: "En cours",
  });

  const [taskForm, setTaskForm] = useState({
    titre: "",
    description: "",
    projetId: "",
    assigneAUserId: "",
    dateEcheance: "",
    priorite: "Normale",
    statut: "A faire",
  });

  const charger = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/data");
      setProjects(res.data.projets);
      setTasks(res.data.task);
      setUsers(res.data.user);
      setDepartements(res.data.departement);
    } catch (error) {
      console.log("erreur serveur", error);
    }
  };
  // Données de simulation
  useEffect(() => {
    // Vérification d'authentification et récupération des données
    const initializeComponent = async () => {
      try {
        console.log("Initialisation tacheprojet...");

        // Vérification optimisée (locale + Laravel si nécessaire)
        const isAuthenticated = await authUtils.verifyAndRedirect();

        if (isAuthenticated) {
          const userData = authUtils.getUserData();

          console.log("Accès autorisé");
          setUser(userData);

          //S'assurer que la déconnexion automatique est programmée
          authUtils.scheduleAutoLogout();
        }
      } catch (err) {
        console.error("Erreur lors de l'initialisation:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
    charger();
  }, []);

  const isAdmin = () => user?.departement === "Administration";
  const isManager = () =>
    user?.poste?.includes("Manager") || user?.poste?.includes("Chef");
  const canManage = () => isAdmin() || isManager();

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      authUtils.logout();
    }
  };

  const createProject = () => {
    if (!projectForm.nom || !projectForm.budget || !projectForm.dateFinPrevue) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const newProject = {
      id: projects.length + 1,
      ...projectForm,
      budget: parseFloat(projectForm.budget),
      dateCreation: new Date().toISOString().split("T")[0],
    };

    setProjects([...projects, newProject]);
    setShowProjectModal(false);
    setProjectForm({
      nom: "",
      budget: "",
      dateFinPrevue: "",
      description: "",
      departement: "",
      statut: "En cours",
    });
    toast.success("Projet créé avec succès !");
  };

  const createTask = () => {
    if (!taskForm.titre || !taskForm.assigneAUserId || !taskForm.dateEcheance) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const assignedUser = users.find(
      (u) => u.id === parseInt(taskForm.assigneAUserId)
    );
    const newTask = {
      id: tasks.length + 1,
      ...taskForm,
      projetId: taskForm.projetId ? parseInt(taskForm.projetId) : null,
      assigneAUserId: parseInt(taskForm.assigneAUserId),
      assigneANom: `${assignedUser?.prenom} ${assignedUser?.nom}`,
      dateCreation: new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, newTask]);
    setShowTaskModal(false);
    setTaskForm({
      titre: "",
      description: "",
      projetId: "",
      assigneAUserId: "",
      dateEcheance: "",
      priorite: "Normale",
      statut: "A faire",
    });
    toast.success("Tâche assignée avec succès !");
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, statut: newStatus } : task
      )
    );
    toast.success("Statut mis à jour !");
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
        return "text-red-400";
      case "Normale":
        return "text-blue-400";
      case "Basse":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredProjects = isAdmin()
    ? projects
    : projects.filter((p) => p.departement === user?.departement);

  const filteredTasks = isAdmin()
    ? tasks
    : isManager()
    ? tasks.filter((t) => {
        const assignedUser = users.find((u) => u.id === t.assigneAUserId);
        return assignedUser?.departement === user?.departement;
      })
    : tasks.filter((t) => t.assigneAUserId === user?.id);

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
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">
                  {user.prenom.charAt(0)}
                  {user.nom.charAt(0)}
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Titre et statistiques */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Projets et Tâches
          </h1>
          <p className="text-white/70">
            {isAdmin()
              ? "Vue administrative complète"
              : isManager()
              ? `Gestion du département ${user.departement}`
              : "Mes tâches et projets"}
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-white/70 text-sm font-medium mb-2">Projets</h3>
            <p className="text-3xl font-bold text-white">
              {filteredProjects.length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-white/70 text-sm font-medium mb-2">
              Tâches totales
            </h3>
            <p className="text-3xl font-bold text-white">
              {filteredTasks.length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-white/70 text-sm font-medium mb-2">En cours</h3>
            <p className="text-3xl font-bold text-blue-400">
              {filteredTasks.filter((t) => t.statut === "En cours").length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-white/70 text-sm font-medium mb-2">
              Terminées
            </h3>
            <p className="text-3xl font-bold text-green-400">
              {filteredTasks.filter((t) => t.statut === "Terminé").length}
            </p>
          </div>
        </div>

        {/* Boutons d'action (Admin/Manager uniquement) */}
        {canManage() && (
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              + Nouveau Projet
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg"
            >
              + Assigner une Tâche
            </button>
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "projects"
                  ? "text-white bg-white/10 border-b-2 border-blue-400"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              Projets ({filteredProjects.length})
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "tasks"
                  ? "text-white bg-white/10 border-b-2 border-blue-400"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              Tâches ({filteredTasks.length})
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === "projects" && (
              <div className="space-y-6">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-white/60 text-lg">
                      Aucun projet trouvé
                    </div>
                  </div>
                ) : (
                  filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {project.nom}
                          </h3>
                          <p className="text-white/70 mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-white/60">
                            <span>Département: {project.departement}</span>
                            <span>
                              Budget: {project.budget.toLocaleString()} €
                            </span>
                            <span>
                              Échéance:{" "}
                              {new Date(
                                project.dateFinPrevue
                              ).toLocaleDateString()}
                            </span>
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

                      {/* Tâches liées au projet */}
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-3">
                          Tâches du projet:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tasks
                            .filter((t) => t.projetId === project.id)
                            .map((task) => (
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
                                  Assigné à: {task.assigneANom}
                                </p>
                                <p
                                  className={`text-xs ${getPriorityColor(
                                    task.priorite
                                  )}`}
                                >
                                  Priorité: {task.priorite}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-white/60 text-lg">
                      Aucune tâche trouvée
                    </div>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
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
                          </div>
                          <p className="text-white/70 mb-3">
                            {task.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                            <div>
                              <span className="font-medium">Assigné à:</span>{" "}
                              {task.assigneANom}
                            </div>
                            <div>
                              <span className="font-medium">Échéance:</span>{" "}
                              {new Date(task.dateEcheance).toLocaleDateString()}
                            </div>
                            {task.projetId && (
                              <div>
                                <span className="font-medium">Projet:</span>{" "}
                                {projects.find((p) => p.id === task.projetId)
                                  ?.nom || "N/A"}
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

                          {/* Boutons de mise à jour du statut pour les tâches assignées à l'utilisateur */}
                          {(task.assigneAUserId === user.id || canManage()) && (
                            <div className="flex flex-col gap-1">
                              {task.statut !== "En cours" && (
                                <button
                                  onClick={() =>
                                    updateTaskStatus(task.id, "En cours")
                                  }
                                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Commencer
                                </button>
                              )}
                              {task.statut !== "Terminé" && (
                                <button
                                  onClick={() =>
                                    updateTaskStatus(task.id, "Terminé")
                                  }
                                  className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Terminer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de création de projet */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-6">
              Créer un nouveau projet
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom du projet"
                value={projectForm.nom}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, nom: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Budget (€)"
                value={projectForm.budget}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, budget: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                value={projectForm.dateFinPrevue}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    dateFinPrevue: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={projectForm.departement}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    departement: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departements.map((item) => {
                  <option key={item.id} value={item.nom}>
                    {item.nom}
                  </option>;
                })}
              </select>

              <textarea
                placeholder="Description du projet"
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
                }
                rows="4"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowProjectModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createProject}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Créer le projet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'assignation de tâche */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-6">
              Assigner une nouvelle tâche
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titre de la tâche"
                value={taskForm.titre}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, titre: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={taskForm.projetId}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, projetId: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucun projet (tâche indépendante)</option>
                {filteredProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nom}
                  </option>
                ))}
              </select>

              <select
                value={taskForm.assigneAUserId}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, assigneAUserId: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Assigner à un utilisateur</option>
                {users
                  .filter(
                    (u) => isAdmin() || u.departement === user.departement
                  )
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom} - {u.poste}
                    </option>
                  ))}
              </select>

              <input
                type="date"
                value={taskForm.dateEcheance}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, dateEcheance: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={taskForm.priorite}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priorite: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Basse">Priorité basse</option>
                <option value="Normale">Priorité normale</option>
                <option value="Haute">Priorité haute</option>
              </select>

              <textarea
                placeholder="Description de la tâche"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createTask}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                Assigner la tâche
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ProjectTaskManager;
