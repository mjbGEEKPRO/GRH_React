import React, { useState, useEffect } from "react";

import axios from "axios";
import { toast } from "react-toastify";

const ConnectionHistory = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    departement: "",
    per_page: 50,
  });
  const [exporting, setExporting] = useState(false);

  const departements = [
    "Administration",
    "Informatique",
    "Comptabilité",
    "Marketing",
    "Ressources humaines",
  ];

  // Charger les données
  const loadConnectionHistory = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        ...filters,
      };

      // Nettoyer les paramètres vides
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await axios.get(
        "http://localhost:8000/api/admin/connection-history",
        {
          params,
        }
      );

      if (response.data.success) {
        setConnections(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
        console.log("data conection ", response.data.data);
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
        toast.error("Erreur lors du chargement des données");
        console.log("erreur", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Exporter en CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        date_from: filters.date_from,
        date_to: filters.date_to,
        departement: filters.departement,
      };

      // Nettoyer les paramètres vides
      Object.keys(params).forEach((key) => {
        if (params[key] === "") {
          delete params[key];
        }
      });

      const response = await axios.get(
        "http://localhost:8000/api/admin/connection-history/export",
        {
          params,
          responseType: "blob",
        }
      );

      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const filename = `historique_connexions_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export réussi !");
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  // Formater la durée de session
  const formatSessionDuration = (seconds) => {
    if (!seconds) return "En cours";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR");
  };

  // Gérer les changements de filtre
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Appliquer les filtres
  const applyFilters = () => {
    loadConnectionHistory(1);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      date_from: "",
      date_to: "",
      departement: "",
      per_page: 50,
    });
  };

  // Charger les données au montage
  useEffect(() => {
    loadConnectionHistory();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Historique des connexions
          </h2>
          <p className="text-white/70">
            Suivi des connexions et déconnexions des utilisateurs
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || connections.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Export...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exporter CSV
            </>
          )}
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/20 rounded-xl p-4">
          <div className="text-blue-400 text-sm font-medium mb-1">
            Connexions aujourd'hui
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.total_connections_today || 0}
          </div>
        </div>

        <div className="bg-green-500/20 rounded-xl p-4">
          <div className="text-green-400 text-sm font-medium mb-1">
            Utilisateurs uniques
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.unique_users_today || 0}
          </div>
        </div>

        <div className="bg-purple-500/20 rounded-xl p-4">
          <div className="text-purple-400 text-sm font-medium mb-1">
            Durée moy. session
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.avg_session_duration
              ? `${Math.round(stats.avg_session_duration / 60)}min`
              : "0min"}
          </div>
        </div>

        <div className="bg-orange-500/20 rounded-xl p-4">
          <div className="text-orange-400 text-sm font-medium mb-1">
            Cette semaine
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.total_connections_this_week || 0}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Département
            </label>
            <select
              value={filters.departement}
              onChange={(e) =>
                handleFilterChange("departement", e.target.value)
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="">Tous les départements</option>
              {departements.map((dept) => (
                <option key={dept} value={dept} className="bg-gray-800">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Par page
            </label>
            <select
              value={filters.per_page}
              onChange={(e) =>
                handleFilterChange("per_page", parseInt(e.target.value))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="25" className="bg-gray-800">
                25
              </option>
              <option value="50" className="bg-gray-800">
                50
              </option>
              <option value="100" className="bg-gray-800">
                100
              </option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex-1"
            >
              Filtrer
            </button>
            <button
              onClick={() => {
                resetFilters();
                setTimeout(() => loadConnectionHistory(1), 100);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Chargement...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Utilisateur
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Email
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Département
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Poste
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Date connexion
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Heure connexion
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Date déconnexion
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Heure déconnexion
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  Durée session
                </th>
                <th className="text-left text-white/70 font-medium py-3 px-4">
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {connections.map((connection, index) => (
                <tr
                  key={connection.id}
                  className={`border-b border-white/10 hover:bg-white/5 ${
                    index % 2 === 0 ? "bg-white/5" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">
                      {connection.prenom} {connection.nom}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm">
                    {connection.email_pro}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                      {connection.departement}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      {connection.roles}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm">
                    {formatDate(connection.login_at)}
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm">
                    {formatTime(connection.login_at)}
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm">
                    {formatDate(connection.logout_at)}
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm">
                    {formatTime(connection.logout_at)}
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        connection.logout_at
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {formatSessionDuration(connection.session_duration)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/70 text-sm font-mono">
                    {connection.ip_address || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {connections.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-white mb-2">
              Aucune donnée
            </h3>
            <p className="text-white/70">
              Aucun historique de connexion trouvé pour les critères
              sélectionnés.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
          <div className="text-white/70 text-sm">
            Affichage de {pagination.from} à {pagination.to} sur{" "}
            {pagination.total} résultats
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => loadConnectionHistory(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            <span className="px-3 py-1 bg-blue-600 text-white rounded">
              {pagination.current_page} / {pagination.last_page}
            </span>

            <button
              onClick={() => loadConnectionHistory(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionHistory;
