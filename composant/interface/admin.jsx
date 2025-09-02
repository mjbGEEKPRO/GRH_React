import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { authUtils } from "../../utils/redirectionForm";
import axios from "axios";
import { generateSecurePassword } from "../../utils/generepass";
import { envoyerEmailIdentifiants } from "../../mail/approuverUser";
import { getGreeting } from "../../utils/greeting";
import Permissions from "./permission";

function Admin() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // États pour les modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [professionalData, setProfessionalData] = useState({
    emailPro: "",
    motDePassePro: "",
    departement: "",
  });

  // États pour les formulaires
  const [projectForm, setProjectForm] = useState({
    nom: "",
    budget: "",
    dateFinPrevue: "",
    description: "",
    departements: [],
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
    createTeams: false,
  });

  const [teamForm, setTeamForm] = useState({
    projectId: "",
    teams: {},
  });

  // Données simulées
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
          loadData();
        }
      } catch (error) {
        console.error("Erreur vérification auth:", error);
        window.location.href = "/connexion";
      }
    };

    initializeData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulation des données - remplacer par vos appels API réels
      const mockUsers = [
        {
          id: 1,
          nom: "Dupont",
          prenom: "Jean",
          email: "jean@gmail.com",
          telephone: "678901234",
          poste: "Développeur",
          departement: "Informatique",
          statut: false,
        },
        {
          id: 2,
          nom: "Martin",
          prenom: "Marie",
          email: "marie@gmail.com",
          telephone: "687654321",
          poste: "Comptable",
          departement: "Comptabilité",
          statut: true,
        },
      ];

      const mockDepartments = [
        { id: 1, nom: "Informatique" },
        { id: 2, nom: "Comptabilité" },
        { id: 3, nom: "Ressources humaines" },
        { id: 4, nom: "Administration" },
      ];

      const mockProjects = [
        {
          id: 1,
          nom: "Site Web",
          budget: 2500000,
          dateFinPrevue: "2025-06-30",
          description: "Développement site",
          departements: ["Informatique"],
          statut: "En cours",
        },
      ];

      const mockTasks = [
        {
          id: 1,
          titre: "Design UI",
          description: "Créer les maquettes",
          projetId: 1,
          assigneAUserId: 1,
          assigneANom: "Jean Dupont",
          dateEcheance: "2025-03-15",
          priorite: "Haute",
          statut: "A faire",
        },
      ];

      setUsers(mockUsers);
      setDepartments(mockDepartments);
      setProjects(mockProjects);
      setTasks(mockTasks);
    } catch (error) {
      console.error("Erreur chargement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      authUtils.logout();
    }
  };

  const navigationItems = [
    { id: "users", label: "Utilisateurs", icon: "👥" },
    { id: "projects", label: "Projets", icon: "📁" },
    { id: "tasks", label: "Tâches", icon: "✅" },
    { id: "permissions", label: "Permissions", icon: "🔐" },
    { id: "reports", label: "Rapports", icon: "📊" },
  ];

  // Fonctions pour la gestion des projets
  const handleDepartmentChange = (departmentName, checked) => {
    if (departmentName === "all") {
      if (checked) {
        setProjectForm({
          ...projectForm,
          departements: departments.map((d) => d.nom),
        });
      } else {
        setProjectForm({ ...projectForm, departements: [] });
      }
    } else {
      const newDepartements = checked
        ? [...projectForm.departements, departmentName]
        : projectForm.departements.filter((d) => d !== departmentName);

      setProjectForm({ ...projectForm, departements: newDepartements });
    }
  };

  const createProject = async () => {
    if (
      !projectForm.nom ||
      !projectForm.budget ||
      !projectForm.dateFinPrevue ||
      projectForm.departements.length === 0
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
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
        departements: [],
        statut: "En cours",
      });
      toast.success("Projet créé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la création du projet");
    }
  };

  const createTask = async () => {
    if (!taskForm.titre || !taskForm.assigneAUserId || !taskForm.dateEcheance) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
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

      // Si création d'équipes et projet sélectionné
      if (taskForm.createTeams && taskForm.projetId) {
        const project = projects.find(
          (p) => p.id === parseInt(taskForm.projetId)
        );
        if (project) {
          setTeamForm({
            projectId: taskForm.projetId,
            teams: project.departements.reduce(
              (acc, dept) => ({ ...acc, [dept]: "" }),
              {}
            ),
          });
          setShowTeamModal(true);
        }
      }

      setShowTaskModal(false);
      setTaskForm({
        titre: "",
        description: "",
        projetId: "",
        assigneAUserId: "",
        dateEcheance: "",
        priorite: "Normale",
        statut: "A faire",
        createTeams: false,
      });

      toast.success("Tâche assignée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la création de la tâche");
    }
  };

  const createTeams = async () => {
    try {
      const projectTeams = Object.entries(teamForm.teams)
        .filter(([dept, teamName]) => teamName.trim())
        .map(([dept, teamName]) => ({
          id: teams.length + Math.random(),
          nom: teamName.trim(),
          departement: dept,
          projetId: teamForm.projectId,
        }));

      setTeams([...teams, ...projectTeams]);
      setShowTeamModal(false);

      if (
        window.confirm(
          "Équipes créées avec succès ! Voulez-vous affecter des utilisateurs aux équipes ?"
        )
      ) {
        setActiveSection("permissions");
      }

      toast.success("Équipes créées avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la création des équipes");
    }
  };

  // Fonction pour approuver un utilisateur
  const approuver = async () => {
    if (
      !selectedUser ||
      !professionalData.emailPro ||
      !professionalData.motDePassePro
    ) {
      toast.error("Données manquantes pour l'approbation");
      return;
    }

    try {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, statut: true } : u
        )
      );

      // 2. Envoi à Laravel avec les nouvelles données
      console.log("📤 Envoi approbation à Laravel...");
      const res = await axios.put(
        `http://127.0.0.1:8000/api/approuver/${selectedUser.id}`,
        {
          statut: true,
          email_pro: professionalData.emailPro,
          password: professionalData.motDePassePro,
          departement: professionalData.departement,
        }
      );

      if (res.data.success) {
        // 3. Mise à jour du JSON server
        const useForJson = res.data.user;
        console.log("📤 Mise à jour JSON server...", useForJson);
        await axios.put(`http://localhost:5000/users/${selectedUser.id}`, {
          useForJson,
        });

        // 4. Envoi de l'email avec les identifiants
        await envoyerEmailIdentifiants(
          selectedUser,
          professionalData.emailPro,
          professionalData.motDePassePro
        );

        toast.success(
          `✅ ${selectedUser.prenom} ${selectedUser.nom} approuvé avec succès !`
        );

        // 5. Fermer le modal et recharger
        setShowApprovalModal(false);
        await charger();
      } else {
        console.log("Erreur venu serveur ", res.data.message);
      }
    } catch {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const rejeter = async (userId) => {
    const utilisateur = users.find((u) => u.id === userId);

    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir rejeter la demande de ${utilisateur?.prenom} ${utilisateur?.nom} ?`
      )
    ) {
      return;
    }

    try {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, statut: false } : u))
      );
      toast.success("Demande rejetée");
    } catch (error) {
      toast.error("Erreur lors du rejet");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestion des Utilisateurs
              </h1>
              <p className="text-white/70">
                Gérez les demandes d'inscription et attribuez les accès
                professionnels
              </p>
            </div>

            {/* Statistiques */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <h3 className="text-white/70 text-sm font-medium mb-2">
                  Total utilisateurs
                </h3>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <h3 className="text-white/70 text-sm font-medium mb-2">
                  Approuvés
                </h3>
                <p className="text-3xl font-bold text-green-400">
                  {users.filter((u) => u.statut).length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <h3 className="text-white/70 text-sm font-medium mb-2">
                  En attente
                </h3>
                <p className="text-3xl font-bold text-orange-400">
                  {users.filter((u) => !u.statut).length}
                </p>
              </div>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Poste
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Département
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((personne) => (
                      <tr
                        key={personne.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {personne.prenom?.charAt(0)}
                                {personne.nom?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {personne.prenom} {personne.nom}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-white/80 text-sm">
                            <div>{personne.email}</div>
                            <div>{personne.telephone}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white/80 text-sm">
                            {personne.poste}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white/80 text-sm">
                            {personne.departement}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              personne.statut
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            }`}
                          >
                            {personne.statut ? "Approuvé" : "En attente"}
                          </span>
                        </td>
                        <td className="py-4 px-6 space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(personne);
                              setProfessionalData({
                                emailPro: "",
                                motDePassePro: generateSecurePassword(),
                                departement: personne.departement,
                              });
                              setShowApprovalModal(true);
                            }}
                            disabled={personne.statut}
                            className={`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg transition-all ${
                              personne.statut
                                ? "text-gray-500 bg-gray-500/10 cursor-not-allowed"
                                : "text-white bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {personne.statut ? "Déjà approuvé" : "Approuver"}
                          </button>
                          <button
                            onClick={() => rejeter(personne.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all"
                          >
                            Rejeter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "projects":
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Gestion des Projets
                </h1>
                <p className="text-white/70">
                  Créez et gérez les projets de l'entreprise
                </p>
              </div>
              <button
                onClick={() => setShowProjectModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                + Nouveau Projet
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {project.nom}
                      </h3>
                      <p className="text-white/70 mb-2">
                        {project.description}
                      </p>
                      <div className="text-sm text-white/60">
                        <div>
                          Budget: {project.budget.toLocaleString()} FCFA
                        </div>
                        <div>
                          Échéance:{" "}
                          {new Date(project.dateFinPrevue).toLocaleDateString()}
                        </div>
                        <div>
                          Départements: {project.departements.join(", ")}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {project.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "tasks":
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Gestion des Tâches
                </h1>
                <p className="text-white/70">
                  Assignez des tâches aux utilisateurs
                </p>
              </div>
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-700 hover:to-teal-700 transition-all"
              >
                + Nouvelle Tâche
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {task.titre}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            task.priorite === "Haute"
                              ? "text-red-400"
                              : task.priorite === "Normale"
                              ? "text-blue-400"
                              : "text-green-400"
                          }`}
                        >
                          {task.priorite}
                        </span>
                      </div>
                      <p className="text-white/70 mb-3">{task.description}</p>
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
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                        task.statut === "Terminé"
                          ? "text-green-400 bg-green-500/20 border-green-500/30"
                          : task.statut === "En cours"
                          ? "text-blue-400 bg-blue-500/20 border-blue-500/30"
                          : "text-orange-400 bg-orange-500/20 border-orange-500/30"
                      }`}
                    >
                      {task.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "permissions":
        return <Permissions />;
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
            </div>
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

      {/* Modals */}

      {/* Modal d'approbation */}
      {showApprovalModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Approbation de {selectedUser.prenom} {selectedUser.nom}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  value={professionalData.emailPro}
                  onChange={(e) =>
                    setProfessionalData({
                      ...professionalData,
                      emailPro: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="nom.departement@entreprise.com"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Mot de passe temporaire
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={professionalData.motDePassePro}
                    onChange={(e) =>
                      setProfessionalData({
                        ...professionalData,
                        motDePassePro: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setProfessionalData({
                        ...professionalData,
                        motDePassePro: generateSecurePassword(),
                      })
                    }
                    className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={approuver}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de projet */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                placeholder="Budget (FCFA)"
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

              {/* Sélection des départements avec checkboxes */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  Départements concernés
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-white/5 rounded-xl p-3 border border-white/10">
                  {/* Checkbox "Tout sélectionner" */}
                  <label className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        projectForm.departements.length === departments.length
                      }
                      onChange={(e) =>
                        handleDepartmentChange("all", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                    />
                    <span className="text-white font-medium">
                      Tous les départements
                    </span>
                  </label>
                  <hr className="border-white/10 my-2" />
                  {/* Checkboxes individuels */}
                  {departments.map((dept) => (
                    <label
                      key={dept.id}
                      className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={projectForm.departements.includes(dept.nom)}
                        onChange={(e) =>
                          handleDepartmentChange(dept.nom, e.target.checked)
                        }
                        className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                      />
                      <span className="text-white/80">{dept.nom}</span>
                    </label>
                  ))}
                </div>
                <p className="text-white/50 text-xs mt-1">
                  {projectForm.departements.length} département(s)
                  sélectionné(s)
                </p>
              </div>

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
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nom}
                  </option>
                ))}
              </select>

              {/* Option pour créer des équipes si projet sélectionné */}
              {taskForm.projetId && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taskForm.createTeams}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          createTeams: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                    />
                    <span className="text-blue-300 font-medium">
                      Créer des équipes pour ce projet
                    </span>
                  </label>
                  <p className="text-blue-200/70 text-xs mt-2">
                    Après création de la tâche, vous pourrez définir les équipes
                    par département
                  </p>
                </div>
              )}

              <select
                value={taskForm.assigneAUserId}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, assigneAUserId: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Assigner à un utilisateur</option>
                {users.map((u) => (
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
                Créer la tâche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'équipes */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-6">
              Créer les équipes du projet
            </h3>

            <div className="space-y-4">
              {Object.keys(teamForm.teams).map((dept) => (
                <div key={dept}>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Équipe {dept}
                  </label>
                  <input
                    type="text"
                    placeholder={`Nom de l'équipe ${dept}`}
                    value={teamForm.teams[dept]}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        teams: { ...teamForm.teams, [dept]: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-6">
              <p className="text-yellow-300 text-sm">
                Après création des équipes, vous pourrez affecter des
                utilisateurs via la section Permissions.
              </p>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowTeamModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Ignorer
              </button>
              <button
                onClick={createTeams}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                Créer les équipes
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

export default Admin;
