import React from "react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

function UserModals() {
  const [users, setUsers] = useState([]);
 const [professionalData, setProfessionalData] = useState({
    emailPro: "",
    motDePassePro: "",
    departement: "",
  });
  
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

    setModalLoading(true);

    try {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
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
        throw new Error(res.data.message || "Erreur serveur");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'approbation:", error);
      toast.error(
        "Erreur lors de l'approbation: " +
          (error.response?.data?.message || error.message)
      );

      // Annuler la mise à jour optimiste
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id ? { ...u, statut: false } : u
        )
      );
    } finally {
      setModalLoading(false);
    }
  };

     //fonction pur rejeter la demande
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
          toast.error("Erreur lors du rejet", error);
        }
      };
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestion des Utilisateurs
        </h1>
        <p className="text-white/70">
          Gérez les demandes d'inscription et attribuez les accès professionnels
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
          <h3 className="text-white/70 text-sm font-medium mb-2">Approuvés</h3>
          <p className="text-3xl font-bold text-green-400">
            {users.filter((u) => u.statut).length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-white/70 text-sm font-medium mb-2">En attente</h3>
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
}
export default UserModals