import axios from "axios";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { authUtils } from "./redirectionForm";

function Admin() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const charger = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/users`);
      const newUsers = response.data;

      setUsers(newUsers);
    } catch (error) {
      console.log("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger(true);
    const interval = setInterval(() => {
      charger(false);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // fonction pour autoriser l'utilisateur qui a été approuver
  const approuver = async (userId) => {
    try {
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, statut: true } : user
        )
      );
      // envoie de l'id de l'utilisateur approuver avec un statut TRUE à la reserve
      console.log("approbation en cours")
      const res = await axios.put(
        `http://127.0.0.1:8000/api/approuver/${userId}`,
        {
          statut: true,
        }
      );
      console.log("message d'approbation", res.data.message)
      console.log("reponse reserve", res.data);
      const userForJson = res.data.user.statut;
      console.log("envoie à json ", userForJson);
      //envoie de la reponse de la table reserve au fichier json
      await axios.put(`http://localhost:5000/users/${userId}`, userForJson);
    } catch (error) {
      console.log("Erreur lors de l'approbation:", error);
    }
  };

  // fonction pour rejetter l'utilisateur
  const rejeter = async (userId) => {
    try {
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, statut: false } : user
        )
      );
      // envoie de l'id de l'utilisateur rejeter avec un statut FALSE
      await axios.put(`http://localhost:5000/users/${userId}`, {
        statut: false,
      });
    } catch (error) {
      console.log("Erreur lors du rejet:", error);
      charger();
    }
  };

  // const handleLogout = () => {
  //   authUtils.logout();
  // };

  // const getGreeting = () => {
  //   const hour = new Date().getHours();
  //   let greeting = "Bonsoir";
  //   if (hour < 12) greeting = "Bonjour";
  //   else if (hour < 18) greeting = "Bon après-midi";
  //   return greeting;
  // };

  useEffect(() => {
    if (authUtils.verifyAndRedirect) {
      setUser(authUtils.getUserData());
    } else {
      window.location.href = "/connexion";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto">
        {/* <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
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
        </header> */}

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Administration des Utilisateurs
        </h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prénom
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poste solicité
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département affecté
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((personne) => (
                    <tr key={personne.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {personne.nom}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {personne.prenom}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {personne.email}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {personne.telephone}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {personne.poste}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {personne.departement}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            personne.statut
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {personne.statut ? "Approuvé" : "En attente"}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => approuver(personne.id)}
                          disabled={personne.statut}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                            personne.statut
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : "text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                          }`}
                        >
                          {personne.statut ? "Approuvé" : "Approuver"}
                        </button>
                        <button
                          onClick={() => rejeter(personne.id)}
                          disabled={!personne.statut}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                            !personne.statut
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : "text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                          }`}
                        >
                          {!personne.statut ? "Rejeté" : "Rejeter"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center">
                      <div className="text-gray-500">
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span>Chargement...</span>
                          </div>
                        ) : (
                          "Aucun utilisateur trouvé"
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total utilisateurs
            </h3>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Approuvés</h3>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.statut).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">En attente</h3>
            <p className="text-2xl font-bold text-orange-600">
              {users.filter((u) => !u.statut).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
