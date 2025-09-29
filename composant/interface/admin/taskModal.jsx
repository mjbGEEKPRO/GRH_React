import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { assignTask } from "../../../mail/taskAssign";

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [taskForm, setTaskForm] = useState({
    titre: "",
    description: "",
    projet_id: "",
    assigne_a_user_id: "",
    date_echeance: "",
    priorite: "Normale",
    statut: "A faire",
    createTeams: false,
  });

  const [teamForm, setTeamForm] = useState({
    projet_id: "",
    teams: {},
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res3 = await axios.get("http://localhost:8000/api/userTast");
      const res1 = await axios.get("http://localhost:8000/api/admin-data");

      setProjects(res1.data.data.projects);
      setUsers(res3.data.users);
      setTasks(res1.data.data.task);
    } catch (error) {
      if (error.response) {
        const serverErrorMessage = error.response.data.message;
        if (
          error.response.status === 422 ||
          error.response.status === 403 ||
          error.response.status === 401 ||
          error.response.status === 404
        ) {
          toast.info(`❌ ${serverErrorMessage}`);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("Erreur lors du chargement des données");
        console.log("erreur", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (
      !taskForm.titre ||
      !taskForm.assigne_a_user_id ||
      !taskForm.date_echeance
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const assigne_a_user_id = users.find(
        (u) => u.id === parseInt(taskForm.assigne_a_user_id)
      );
      console.log("id projet avent send ", taskForm.projet_id);
      const newTask = {
        id: tasks.length + 1,
        ...taskForm,
        projet_Id: taskForm.projet_id ? parseInt(taskForm.projet_id) : null,
        assigne_a_user_id: parseInt(taskForm.assigne_a_user_id),
        assigneANom: `${assigne_a_user_id?.prenom} ${assigne_a_user_id?.nom}`,
        dateCreation: new Date().toISOString().split("T")[0],
      };
      console.log("id du projet apres  ", newTask.projet_id);
      const res4 = await axios.post(
        "http://127.0.0.1:8000/api/create",
        newTask
      );

      if (res4.data.success) {
        setTasks([res4.data.tasks]);

        // Envoyer l'email de notification
        const emailData = res4.data.email_data;
        if (emailData) {
          const emailSent = await assignTask(
            emailData.assigned_user.email,
            emailData.assigned_user.nom,
            emailData.task,
            emailData.creator,
            emailData.project
          );

          if (emailSent) {
            toast.success("Email de notification de tâche envoyé");
          }
        }

        setShowTaskModal(false);
        setTaskForm({
          titre: "",
          description: "",
          projet_id: "",
          assigne_a_user_id: "",
          date_echeance: "",
          priorite: "Normale",
          statut: "A faire",
          createTeams: false,
        });

        // Si création d'équipes et projet sélectionné
        if (taskForm.createTeams && taskForm.projet_id) {
          const project = projects.find(
            (p) => p.id === parseInt(taskForm.projet_id)
          );

          if (
            project &&
            project.departements &&
            project.departements.length > 0
          ) {
            const teamsObject = project.departements.reduce((acc, dept) => {
              acc[dept] = ""; // Initialiser avec une chaîne vide
              return acc;
            }, {});

            setTeamForm({
              projet_id: taskForm.projet_id,
              teams: teamsObject,
            });

            console.log("TeamForm mis à jour:", {
              projet_id: taskForm.projet_id,
              teams: teamsObject,
            });

            setShowTeamModal(true);
          } else {
            toast.error(
              "Le projet sélectionné n'a pas de départements définis"
            );
            console.error("Projet sans départements:", project);
          }
        }
      }
    } catch (error) {
      if (error.response) {
        const serverErrorMessage = error.response.data.message;
        if (
          error.response.status === 422 ||
          error.response.status === 403 ||
          error.response.status === 401 ||
          error.response.status === 404
        ) {
          toast.info(`❌ ${serverErrorMessage}`);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur lors de la création de la tâchesss");
        console.log("erreur", error);
      }
    }
  };

  const createTeams = async () => {
    try {
      // Vérifier si teamForm.teams existe et n'est pas vide
      if (!teamForm.teams || Object.keys(teamForm.teams).length === 0) {
        toast.error("Aucune équipe définie dans le formulaire");
        return;
      }

      // Créer les équipes à partir du formulaire avec validation plus stricte
      const projectTeams = Object.entries(teamForm.teams)
        .filter(([teamName]) => {
          return (
            teamName &&
            typeof teamName === "string" &&
            teamName.trim().length > 0
          );
        })
        .map(([dept, teamName]) => {
          const team = {
            nom: teamName.trim(),
            departement: dept,
            description: `Équipe ${teamName.trim()} du département ${dept}`,
          };
          console.log("Équipe créée:", team);
          return team;
        });

      if (projectTeams.length === 0) {
        toast.error("Veuillez saisir au moins un nom d'équipe valide");
        return;
      }

      const payload = { teams: projectTeams };

      // Appel à l'API pour créer les équipes
      const response = await axios.post(
        `http://127.0.0.1:8000/api/projects/${teamForm.projet_id}/teams`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Réponse de l'API:", response.data);

      if (response.data.success) {
        // Mettre à jour le state local des équipes
        const newTeams = response.data.data.map((team) => ({
          ...team,
          id: team.id || teams.length + Math.random(),
          projet_id: teamForm.projet_id,
        }));

        setTeams((prevTeams) => [...prevTeams, ...newTeams]);
        setShowTeamModal(false);

        // Réinitialiser le formulaire
        setTeamForm({
          projet_id: "",
          teams: {},
        });

        toast.success(response.data.message);

        if (
          window.confirm(
            `${response.data.message}! Voulez-vous affecter des utilisateurs aux équipes ?`
          )
        ) {
          console.log("Redirection vers la gestion des permissions...");
        }
      }
    } catch (error) {
      if (error.response) {
        const serverErrorMessage = error.response.data.message;
        if (
          error.response.status === 422 ||
          error.response.status === 403 ||
          error.response.status === 401 ||
          error.response.status === 404
        ) {
          toast.info(`❌ ${serverErrorMessage}`);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur ", error);
        console.log("erreur", error);
      }
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Vérification côté client : empêcher la modification d'une tâche terminée
      const currentTask = tasks.find((task) => task.id === taskId);
      if (currentTask && currentTask.statut === "Terminé") {
        toast.warning(
          "❌ Impossible de modifier le statut d'une tâche déjà terminée"
        );
        return;
      }

      const res = await axios.patch(
        `http://127.0.0.1:8000/api/tasks/${taskId}/status`,
        {
          statut: newStatus,
        }
      );
      if (res.data.success) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, statut: newStatus } : task
          )
        );

        toast.success(res.data.message);
      }
    } catch (error) {
      if (error.response) {
        const serverErrorMessage = error.response.data.message;
        if (
          error.response.status === 422 ||
          error.response.status === 403 ||
          error.response.status === 401 ||
          error.response.status === 404
        ) {
          toast.info(`❌ ${serverErrorMessage}`);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur lors de la mise à jour", error);
      }
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return;
    }

    try {
      const res = await axios.delete(`http://localhost/api/delete/${taskId}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error.response) {
        const serverErrorMessage = error.response.data.message;
        if (
          error.response.status === 422 ||
          error.response.status === 403 ||
          error.response.status === 401 ||
          error.response.status === 404
        ) {
          toast.info(`❌ ${serverErrorMessage}`);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur lors de la suppression", error);
      }
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Tâches
          </h1>
          <p className="text-white/70">
            Assignez et suivez les tâches des utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-700 hover:to-teal-700 transition-all"
        >
          + Nouvelle Tâche
        </button>
      </div>

      {/* Statistiques des tâches */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">
            Total Tâches
          </h3>
          <p className="text-3xl font-bold text-white">
            {tasks && tasks.length > 0 ? tasks.length : <p>0</p>}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">A faire</h3>
          {tasks && tasks.length > 0 ? (
            <p className="text-3xl font-bold text-orange-400">
              {tasks.filter((t) => t.statut === "A faire").length}
            </p>
          ) : (
            <p className="text-1xl font-bold text-gray-200">
              Aucune tache pour le moment
            </p>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">En cours</h3>
          {tasks && tasks.length > 0 ? (
            <p className="text-3xl font-bold text-orange-400">
              {tasks.filter((t) => t.statut === "En cours").length}
            </p>
          ) : (
            <p className="text-1xl font-bold text-gray-200">
              Aucune tache pour le moment
            </p>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">Terminées</h3>
          {tasks && tasks.length > 0 ? (
            <p className="text-3xl font-bold text-orange-400">
              {tasks.filter((t) => t.statut === "Terminé").length}
            </p>
          ) : (
            <p className="text-1xl font-bold text-gray-200">
              Aucune tache pour le moment
            </p>
          )}
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
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
                      className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(
                        task.priorite
                      )}`}
                    >
                      {task.priorite}
                    </span>
                  </div>
                  <p className="text-white/70 mb-3">{task.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-white/60">
                    <div>
                      <span className="font-medium">Assigné à:</span>{" "}
                      {task.assignedUser}
                    </div>
                    <div>
                      <span className="font-medium">Échéance:</span>{" "}
                      {new Date(task.date_echeance).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Créée le:</span>{" "}
                      {new Date(task.created_at).toLocaleDateString()}
                    </div>
                    {task.projet_id && (
                      <div>
                        <span className="font-medium">Projet:</span>{" "}
                        {projects.find((p) => p.id === task.projet_id)?.nom ||
                          "N/A"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex items-center space-x-3">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      task.statut
                    )}`}
                  >
                    {task.statut}
                  </span>

                  {/* Actions sur les tâches */}
                  <div className="flex space-x-1">
                    {task.statut === "Terminé" ? (
                      // Tâche terminée - Aucune action possible sur le statut
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                          ✓ Tâche terminée
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          title="Supprimer la tâche"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      // Tâche non terminée - Actions disponibles
                      <>
                        {task.statut !== "En cours" && (
                          <button
                            onClick={() =>
                              updateTaskStatus(task.id, "En cours")
                            }
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Démarrer
                          </button>
                        )}
                        <button
                          onClick={() => updateTaskStatus(task.id, "Terminé")}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Terminer
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          title="Supprimer la tâche"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-2xl font-medium text-gray-500 text-center py-56">
            Aucune tâche pour le moment
          </p>
        )}
      </div>

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
                value={taskForm.projet_id}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, projet_id: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucun projet (tâche indépendante)</option>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                      className="bg-gray-800 text-white"
                    >
                      {project.nom}
                    </option>
                  ))
                ) : (
                  <p>Aucun projet à sélectionner</p>
                )}
              </select>

              {/* Option pour créer des équipes si projet sélectionné */}
              {taskForm.projet_id && (
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
                value={taskForm.assigne_a_user_id}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    assigne_a_user_id: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Assigner à un utilisateur</option>
                {users.map((u) => (
                  <option
                    key={u.id}
                    value={u.id}
                    className="bg-gray-800 text-white"
                  >
                    {u.prenom} {u.nom} - {u.poste}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={taskForm.date_echeance}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, date_echeance: e.target.value })
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
                <option value="Basse" className="bg-gray-800 text-white">
                  Priorité basse
                </option>
                <option value="Normale" className="bg-gray-800 text-white">
                  Priorité normale
                </option>
                <option value="Haute" className="bg-gray-800 text-white">
                  Priorité haute
                </option>
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
              <p className="text-yellow-300 text-sm mb-2">
                Après création des équipes, vous pourrez affecter des
                utilisateurs via la section Permissions.
              </p>
              {/* Debug info */}
              <div className="text-xs text-yellow-200 mt-2">
                <p>Debug - Project ID: {teamForm.projet_id}</p>
                <p>Debug - Teams object: {JSON.stringify(teamForm.teams)}</p>
                <p>Debug - Teams count: {Object.keys(teamForm.teams).length}</p>
              </div>
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
      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </div>
  );
}

export default TaskManagement;
