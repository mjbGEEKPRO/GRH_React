import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
const Permissions = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [selectRoles, setSelectRoles] = useState(null);
  const [selectPermissions, setSelectPermissions] = useState([]);
  const [selectTeams, setSelectTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // États pour les données du formulaire modal
  const [editForm, setEditForm] = useState({
    nom: "",
    email_pro: "",
  });

  const charger = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/getinfo");
      console.log("recuperer", res.data);
      setUsers(res.data.users);
      setRoles(res.data.role);
      setPermissions(res.data.permissions);
      setTeams(res.data.teams);
    } catch (res) {
      const serverErrorMessage = res.data.message;
      if (res.status === 422) {
        toast.info(`❌ ${serverErrorMessage}`);
      } else if (res.status === 500) {
        toast.error(`❌ ${serverErrorMessage}`);
      }
    }
  };
  //je lance la requette et je recupère toutes mes données
  useEffect(() => {
    charger();
  }, []);

  const UserSelection = (user) => {
    console.log("User sélectionné:", user);
    setSelectUser(user);

    if (user.role?.id) {
      const fullRole = roles.find((r) => r.id === user.role.id);
      setSelectRoles(fullRole || null);
    } else {
      setSelectRoles(null);
    }

    setSelectPermissions(user.permissions || []);
    setSelectTeams(user.teams || []);
  };

  const RoleSelection = (role) => {
    setSelectRoles(role);
  };

  const PermissionSelection = (permission) => {
    if (selectPermissions.some((p) => p.id === permission.id)) {
      setSelectPermissions(
        selectPermissions.filter((p) => p.id !== permission.id)
      );
    } else {
      setSelectPermissions([...selectPermissions, permission]);
    }
  };

  const TeamSelection = (team) => {
    if (selectTeams.some((t) => t.id === team.id)) {
      setSelectTeams(selectTeams.filter((t) => t.id !== team.id));
    } else {
      setSelectTeams([...selectTeams, team]);
    }
  };

  const Envoie = async () => {
    if (!selectUser) {
      toast.error("Aucun utilisateur sélectionné");
      return;
    }

    const sendData = {
      role_id: selectRoles ? selectRoles.id : null,
      permissions: selectPermissions.map((p) => p.id),
      teams: selectTeams.map((t) => t.id),
    };

    try {
      setLoading(true);
      console.log("debut connexion...");
      console.log("id user", selectUser.id);
      console.log("send data", sendData);
      const res = await axios.put(
        `http://127.0.0.1:8000/api/users/${selectUser.id}`,
        sendData
      );

      if (res.data.success) {
        setTimeout(() => {
          toast.success(res.data.message);
          setLoading(false);
          const updatedUser = {
            ...selectUser,
            role: res.data.user.role,
            permissions: res.data.user.permissions,
            teams: res.data.user.teams,
          };
          setSelectUser(updatedUser);
          setUsers(
            users.map((u) => (u.id === selectUser.id ? updatedUser : u))
          );
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Erreur lors de la mise à jour: " + error.message);
    }
  };

  const openModal = (user) => {
    setEditForm({
      nom: user.nom,
      email_pro: user.email_pro,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditForm({ nom: "", email_pro: "" });
  };

  const FormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const Submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("donner à update", editForm);
      const res = await axios.put(
        `http://127.0.0.1:8000/api/useEdit/${selectUser.id}`,
        editForm
      );

      if (res.data.success) {
        setTimeout(() => {
          toast.success(res.data.message);
          // ✅ Correction : res.data.user au lieu de res.user
          const updatedUser = { ...selectUser, ...res.data.user };
          setSelectUser(updatedUser);
          setUsers(
            users.map((u) => (u.id === selectUser.id ? updatedUser : u))
          );
          setLoading(false);
          closeModal();
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      const serverErrorMessage = error.response.data.message;
      if (error.response.status === 422) {
        toast.info(`❌ ${serverErrorMessage}`);
      } else if (error.response.status === 500) {
        toast.error(`❌ ${serverErrorMessage}`);
      }
    }
  };

  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md w-full">
          <h3 className="text-2xl font-bold text-white mb-6">
            Modifier les informations
          </h3>

          <form onSubmit={Submit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nom complet
              </label>
              <input
                type="text"
                name="nom"
                value={editForm.nom}
                onChange={FormChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom complet"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email_pro"
                value={editForm.email_pro}
                onChange={FormChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@entreprise.com"
              />
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestion des Permissions
            </h1>
            <p className="text-white/70">
              Attribuez des rôles, permissions et équipes aux utilisateurs
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Liste des utilisateurs */}
            <div className="lg:w-1/3 border-r border-white/10 bg-white/5">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  Utilisateurs ({users.length})
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => UserSelection(user)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all hover:bg-white/10 ${
                          selectUser?.id === user.id
                            ? "bg-white/15 border border-blue-400/50 shadow-lg"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-semibold text-sm">
                              {user.nom
                                .split(" ")
                                .map((n) => n.charAt(0))
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">
                              {user.nom}
                            </div>
                            <div className="text-sm text-white/60 truncate">
                              {user.email_pro}
                            </div>
                            {user.role && (
                              <div className="text-xs text-blue-300 mt-1 flex items-center">
                                {user.role.nom}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Panel de détails */}
            <div className="lg:w-2/3 p-6">
              {selectUser ? (
                <div className="space-y-8">
                  {/* Informations utilisateur */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {selectUser.nom
                              .split(" ")
                              .map((n) => n.charAt(0))
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {selectUser.nom}
                          </h2>
                          <p className="text-white/70">
                            {selectUser.email_pro}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openModal(selectUser)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Modifier
                      </button>
                    </div>

                    {/* Droits actuels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                        <div className="font-semibold text-orange-300 mb-3 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Rôle actuel
                        </div>
                        {selectUser.role ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            {selectUser.role.nom}
                          </span>
                        ) : (
                          <span className="text-orange-400/60 text-sm italic">
                            Aucun rôle attribué
                          </span>
                        )}
                      </div>

                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="font-semibold text-green-300 mb-3 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Permissions ({selectUser.permissions?.length || 0})
                        </div>
                        {selectUser.permissions &&
                        selectUser.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectUser.permissions.map((permission) => (
                              <span
                                key={permission.id}
                                className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-green-500/20 text-green-300 border border-green-500/30"
                              >
                                {permission.nom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-400/60 text-sm italic">
                            Aucune permission
                          </span>
                        )}
                      </div>

                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                        <div className="font-semibold text-purple-300 mb-3 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Équipes ({selectUser.teams?.length || 0})
                        </div>
                        {selectUser.teams && selectUser.teams.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectUser.teams.map((team) => (
                              <span
                                key={team.id}
                                className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              >
                                {team.nom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-purple-400/60 text-sm italic">
                            Aucune équipe
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modification des droits */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Modifier les droits
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Section Rôles */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="font-semibold text-white mb-4 flex items-center">
                          <span className="mr-2">👑</span> Rôles
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {roles.map((role) => (
                            <label
                              key={role.id}
                              className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <input
                                type="radio"
                                checked={selectRoles?.id === role.id}
                                onChange={() => RoleSelection(role)}
                                className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 focus:ring-2 mr-3"
                              />
                              <span className="flex items-center text-white">
                                {role.nom}
                              </span>
                            </label>
                          ))}
                          <label className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <input
                              type="radio"
                              checked={selectRoles === null}
                              onChange={() => setSelectRoles(null)}
                              className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 focus:ring-2 mr-3"
                            />
                            <span className="text-white/60 italic">
                              Aucun rôle
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Section Permissions */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="font-semibold text-white mb-4 flex items-center">
                          <span className="mr-2">🔐</span> Permissions
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectPermissions.some(
                                  (p) => p.id === permission.id
                                )}
                                onChange={() => PermissionSelection(permission)}
                                className="w-4 h-4 text-green-500 bg-white/10 border-white/30 focus:ring-green-500 focus:ring-2 rounded mr-3"
                              />
                              <span className="flex items-center text-white">
                                {permission.nom}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Section Équipes */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="font-semibold text-white mb-4 flex items-center">
                          <span className="mr-2">👥</span> Équipes
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {teams.map((team) => (
                            <label
                              key={team.id}
                              className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectTeams.some(
                                  (t) => t.id === team.id
                                )}
                                onChange={() => TeamSelection(team)}
                                className="w-4 h-4 text-purple-500 bg-white/10 border-white/30 focus:ring-purple-500 focus:ring-2 rounded mr-3"
                              />
                              <span className="flex items-center text-white">
                                {team.nom}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bouton de sauvegarde */}
                    <div className="flex justify-end mt-8">
                      <button
                        onClick={Envoie}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Mise à jour en cours...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Enregistrer les droits
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Aucun utilisateur sélectionné
                    </h3>
                    <p className="text-white/40">
                      Choisissez un utilisateur dans la liste pour gérer ses
                      permissions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal />

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
        className="backdrop-blur-lg"
        toastClassName="backdrop-blur-lg bg-white/10 border border-white/20"
      />
    </div>
  );
};

export default Permissions;
