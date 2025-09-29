import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [projectForm, setProjectForm] = useState({
    nom: "",
    budget: "",
    date_fin_prevue: "",
    description: "",
    departements: [],
    statut: "En cours",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/admin-data`);
      // setDepartments(mockDepartments);
      setProjects(res.data.data.projects);
      console.log("departement ", res.data.departements);
      setDepartments(res.data.data.departements);
    } catch {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

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
      !projectForm.date_fin_prevue ||
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

      const res = await axios.post(
        "http://127.0.0.1:8000/api/newprojects",
        newProject
      );
      if (res.data.success) {
        setProjects([...projects, newProject]);
        setShowProjectModal(false);
        setProjectForm({
          nom: "",
          budget: "",
          date_fin_prevue: "",
          description: "",
          departements: [],
          statut: "En cours",
        });
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
          console.log("erreur projet ", error.response.data.errors);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur ", error);
      }
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/deleted/${projectId}`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setProjects(projects.filter((p) => p.id !== projectId));
      }
    } catch (error) {
      if (error.response) {
        const serverErrorMessage = error.response.data.message;

        if (
          error.response.status === 422 ||
          error.response.status === 403 ||
          error.response.status === 401 ||
          error.response.status === 400
        ) {
          toast.info(serverErrorMessage);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur ", error);
        console.log("erreur", error);
      }
    }
  };

  const getProgressPercentage = () => {
    return 5;
  };

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

      {/* Statistiques des projets */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">
            Total Projets
          </h3>
          <p className="text-3xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">En cours</h3>
          <p className="text-3xl font-bold text-blue-400">
            {projects.filter((p) => p.statut === "En cours").length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">Terminés</h3>
          <p className="text-3xl font-bold text-green-400">
            {projects.filter((p) => p.statut === "Terminé").length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">
            Budget Total
          </h3>
          <p className="text-2xl font-bold text-purple-400">
            {projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}{" "}
            FCFA
          </p>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {project.nom}
                </h3>
                <p className="text-white/70 mb-3">{project.description}</p>

                {/* Barre de progression */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-white/60 mb-1">
                    <span>Progression</span>
                    <span>{getProgressPercentage(project)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(project)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-sm text-white/60 space-y-1">
                  <div>Budget: {project.budget.toLocaleString()} FCFA</div>
                  <div>
                    Échéance:{" "}
                    {new Date(project.date_fin_prevue).toLocaleDateString()}
                  </div>
                  <div>Départements: {project.departements.join(", ")}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {project.statut}
                </span>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Supprimer le projet"
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
            </div>
          </div>
        ))}
      </div>

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
              <p>Data de fin prévue</p>
              <input
                type="date"
                value={projectForm.date_fin_prevue}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    date_fin_prevue: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Sélection des départements */}
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

export default ProjectManagement;
