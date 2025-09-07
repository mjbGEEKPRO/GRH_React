import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Form } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Appli = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectUser, setSelectUser] = useState(null); //je gère un user à la foie
  const [selectRoles, setSelectRoles] = useState(null); //idem un rôle à la foie pour chaque user
  const [selectPermissions, setSelectPermissions] = useState([]);
  const [selectTeams, setSelectTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // États pour les données du formulaire modal
  const [editForm, setEditForm] = useState({
    nom: "",
    email: "",
  });

  // Référence pour l'input file (la fenètre de lexplorateur de fichier)
  //useRef permet de le reférencier dans le Dom et manipuler ce qu'il envoie vue qu'il sort de notre navigateur
  //et ramène un fichier de l'exterieur (BONUS : d'ou le faite que si vous faite une video de la démo et que vous
  //cliquez sur le bouton qui l'ouvre il ne s'affcihe pas dans la video car il est invisible par le navigateur
  const fileInputRef = useRef(null);

  //je lance la requette et je recupère toutes mes données
  useEffect(() => {
    fetch("http://localhost:8000/api/data")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
        setRoles(data.roles);
        setPermissions(data.permissions);
        setTeams(data.teams);
      })
      .catch((error) => console.error(error));
  }, []);

  // cette fonction UserSelection recupère le user et tente de recupérer ses permissions, roles etc...
  const UserSelection = (user) => {
    setSelectUser(user);
    setSelectRoles(user.roles || null);
    setSelectPermissions(user.permissions || []);
    setSelectTeams(user.teams || []);
  };

  // je recupèrre le role sélection (un role à la foie )
  const RoleSelection = (role) => {
    setSelectRoles(role);
  };

  //vérification si l'id de la permission selectionner exist dans le tablo
  const PermissionSelection = (permission) => {
    if (selectPermissions.some((p) => p.id === permission.id)) {
      //filter pour retirer la permission décocher si some return true
      setSelectPermissions(
        selectPermissions.filter((p) => p.id !== permission.id)
      );
    } else {
      //spread pour ajouter la permission si some return false
      setSelectPermissions([...selectPermissions, permission]);
    }
  };

  //idem ici
  const TeamSelection = (team) => {
    if (selectTeams.some((t) => t.id === team.id)) {
      setSelectTeams(selectTeams.filter((t) => t.id !== team.id));
    } else {
      setSelectTeams([...selectTeams, team]);
    }
  };

  //envoie des infos en vérifiant qu'il y'a un role si non on met à null
  const Envoie = async () => {
    const sendData = {
      role_id: selectRoles ? selectRoles.id : null,
      permissions: selectPermissions.map((p) => p.id), //map pour uniquement envoyer les id à la table pivot
      teams: selectTeams.map((t) => t.id), //idem
    };
    console.log("Données à envoyer:", sendData);
    try {
      console.log("debut connexion");
      await axios
        .put(`http://127.0.0.1:8000/api/users/${selectUser.id}`, sendData)
        .then((response) => {
          toast.success(response.data.message);
        });
    } catch (response) {
      toast.error(" ❌ Erreur:", response.data.message);
    }
  };

  // Fonction pour ouvrir le modal
  const openModal = (user) => {
    setEditForm({
      nom: user.nom,
      email: user.email,
    });
    setShowModal(true);
  };
  // Fonction pour fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setEditForm({ nom: "", email: "" });
  };

  // Fonction pour gérer les changements dans le formulaire
  const FormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };
  // Fonction pour soumettre les modifications
  const Submit = async (e) => {
    e.preventDefault();
    try {
      console.log("info à modifier ", editForm);
      console.log("debut connexion...");
      const res = await axios.put(
        `http://127.0.0.1:8000/api/useEdit/${selectUser.id}`,
        editForm
      );
      toast.success(`✅${res.data.message}`);
      // Mettre à jour l'utilisateur sélectionné
      setSelectUser({ ...selectUser, ...editForm });

      closeModal();
    } catch (error) {
      toast.success(" ✅ erreur ", error.message);
    }
  };

  // Validation du fichier
  const validateFile = (file) => {
    const maxSize = 2 * 1024 * 1024; //taille max autoriser 2mo
    const Types = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    console.log("nom du fichier", file.name);
    if (file.size > maxSize) {
      toast.warning(" 💥Le fichier est trop volumineux (max 2MB)");
      return false;
    }
    if (!Types.includes(file.type)) {
      toast.warning(" 🚫Format non supporté. Utilisez JPEG, PNG, JPG ou GIF");
      return false;
    }
    return true;
  };

  // Gestion de la sélection de fichier
  const FileSelect = async (event) => {
    const file = event.target.files[0]; //[0] pour recupérer la première valeur du tableau si il selectionne plusieurs imgs
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        //NB: current pour interragir avec notre input masquer (la fenètre qui soufre vers l'explorateur de fichier)
        fileInputRef.current.value = "";
      }
      return;
    }
    await uploadPhoto(file);
  };

  // Upload de la photo
const uploadPhoto = async (file) => {
  if (!selectUser) return;

  setIsUploadingPhoto(true);

  const formData = new FormData();
  formData.append("photo", file); 
  console.log("donner à stocket", file)
  try {
    console.log("connexion en cours");
    const response = await axios.put( // ✅ Utiliser PUT directement
      `http://127.0.0.1:8000/api/useEdit/${selectUser.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Header approprié pour les fichiers
        },
      }
    );

    // ✅ Vérifier response.data.success
    if (response.data.success) {
      // Mettre à jour l'utilisateur avec la nouvelle photo
      const updatedUser = {
        ...selectUser,
        photo_url: response.data.user.photo_url, // ✅ Utiliser response.data
      };
      setSelectUser(updatedUser);

      // Mettre à jour aussi dans la liste des utilisateurs
      setUsers(
        users.map((user) =>
          user.id === selectUser.id
            ? { ...user, photo_url: response.data.user.photo_url }
            : user
        )
      );

      toast.success(`✅  reponse serveur ${response.data.message}` );
    } else {
      toast.error("❌ Erreur du serveur: " + response.data.message);
    }
  } catch (error) {
    console.error("Erreur upload:", error);
    
    // ✅ Meilleure gestion des erreurs
    const errorMessage = error.response?.data?.message || error.message;
    toast.error("❌ Erreur lors du téléchargement: " + errorMessage);
  } finally {
    setIsUploadingPhoto(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};

  // Suppression
  const removePhoto = async () => {
    if (!selectUser || !selectUser.photo_url) return;

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      return; //j'utilise ! pour éviter d'ecrire un if...else
    }

    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/delete/ ${selectUser.id}`
      );

      if (response.data.success) {
        // Mettre à jour l'utilisateur sélectionné
        const updatedUser = {
          ...selectUser,
          photo: null,
          photo_url: null,
        };
        setSelectUser(updatedUser);

        // Mettre à jour aussi dans la liste des utilisateurs
        setUsers(
          users.map((user) =>
            user.id === selectUser.id //je cherche dans la liste users le user actuellement sélectionner grace au id
              ? { ...user, photo: null, photo_url: null } //je met le champ photo et photo_url à null
              : user
          )
        );

        toast.success("✅ Photo supprimée avec succès !");
      } else {
        toast.error("❌ Erreur: " + response.data.message);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de la suppression de la photo";
      toast.error("❌ " + errorMessage);
    }
  };

  // Composant pour l'affichage de la photo
  const PhotoDisplay = ({ user, size = "large" }) => {
    const sizeClasses = {
      small: "w-10 h-10",
      medium: "w-16 h-16",
      large: "w-32 h-32",
    };

    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-lg relative`}
      >
        {user.photo_url ? (
          <img
            src={user.photo_url}
            alt="Photo de profil"
            className="w-full h-full object-cover"
            onError={(e) => {
              //onError quand l'img ne pas se charger (serveur eteint ,img delete etc...)
              e.target.style.display = "none"; //img display: none pour cache l'img bizzard qui s'affcihe souvent et maintenir hidden
              e.target.nextSibling.style.display = "flex"; //nextSibling pour ensuite lancer display:flex et afficher le bonhomme
            }}
          /> //si non on met null pas d'erreur donc pas photo_url = null
        ) : null}

        <div
          className={`${
            user.photo_url ? "hidden" : "flex"
          } w-full h-full items-center justify-center text-gray-500`}
        >
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  };

  // composant pour afficher le model d'update
  const Modal = () => {
    if (!showModal) return null;

    return (
      <div
        className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h2 className="text-xl font-semibold">Modifier les informations</h2>
          </div>
          

          <form onSubmit={Submit} className="p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={editForm.nom}
                  onChange={FormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editForm.email}
                  onChange={FormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-light">Gestion des Utilisateurs</h1>
          </div>

          <div className="flex">
            <div className="w-1/3 border-r border-gray-100 bg-gray-50">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-6">
                  Utilisateurs
                </h2>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => UserSelection(user)}
                      className={`p-4 rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                        selectUser?.id === user.id
                          ? "bg-blue-100 border-2 border-blue-300"
                          : "bg-white border border-gray-200 hover:shadow-md"
                      }`}
                    >
                      {/* Photo miniature dans la liste */}
                      <PhotoDisplay user={user} size="small" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {user.nom}
                        </div>
                        {user.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-2/3 p-6">
              {selectUser ? (
                <div>
                  {/* Section photo de profil */}
                  <div className="mb-8 flex items-start space-x-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <PhotoDisplay user={selectUser} size="large" />
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="text-white text-sm">Envoi...</div>
                          </div>
                        )}
                      </div>

                      {/* Boutons de gestion photo */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                          {selectUser.photo_url
                            ? "Changer la photo"
                            : "Ajouter une photo"}
                        </button>

                        {selectUser.photo_url && (
                          <button
                            onClick={removePhoto}
                            disabled={isUploadingPhoto}
                            className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            Supprimer
                          </button>
                        )}

                        <p className="text-xs text-gray-500 text-center">
                          Formats: JPEG, PNG, JPG, GIF
                          <br />
                          Max: 2MB
                        </p>
                      </div>

                      {/* Input file caché */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={FileSelect}
                        accept="image/jpeg,image/png,image/jpg,image/gif"
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-gray-800 mb-2">
                        {selectUser.nom}
                      </h2>
                      {selectUser.email && (
                        <p className="text-gray-600">{selectUser.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Droits actuels
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="font-medium text-orange-800 mb-2">
                          Rôle
                        </div>
                        {selectUser.roles ? (
                          <span className="inline-block bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">
                            {selectUser.roles.nom}
                          </span>
                        ) : (
                          <span className="text-orange-500 text-sm">
                            Aucun rôle
                          </span>
                        )}
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="font-medium text-green-800 mb-2">
                          Permissions
                        </div>
                        {selectUser.permissions &&
                        selectUser.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectUser.permissions.map((permission) => (
                              <span
                                key={permission.id}
                                className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
                              >
                                {permission.nom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-500 text-sm">
                            Aucune permission
                          </span>
                        )}
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="font-medium text-purple-800 mb-2">
                          Équipes
                        </div>
                        {selectUser.teams && selectUser.teams.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectUser.teams.map((team) => (
                              <span
                                key={team.id}
                                className="inline-block bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs"
                              >
                                {team.nom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-purple-500 text-sm">
                            Aucune équipe
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Modifier les droits
                    </h3>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-4">
                          Rôles
                        </h4>
                        <div className="space-y-3">
                          {roles.map((role) => (
                            <label
                              key={role.id}
                              className="flex items-center cursor-pointer p-2 rounded hover:bg-white"
                            >
                              <input
                                type="radio"
                                checked={selectRoles?.id === role.id}
                                onChange={() => RoleSelection(role)}
                                className="w-4 h-4 text-blue-600 mr-3"
                              />
                              <span className="text-gray-700">{role.nom}</span>
                            </label>
                          ))}
                          <label className="flex items-center cursor-pointer p-2 rounded hover:bg-white">
                            <input
                              type="radio"
                              checked={selectRoles === null}
                              onChange={() => setSelectRoles(null)}
                              className="w-4 h-4 text-blue-600 mr-3"
                            />
                            <span className="text-gray-500 italic">
                              Aucun rôle
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-4">
                          Permissions
                        </h4>
                        <div className="space-y-3">
                          {permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center cursor-pointer p-2 rounded hover:bg-white"
                            >
                              <input
                                type="checkbox"
                                checked={selectPermissions.some(
                                  (p) => p.id === permission.id
                                )}
                                onChange={() => PermissionSelection(permission)}
                                className="w-4 h-4 text-blue-600 mr-3 rounded"
                              />
                              <span className="text-gray-700">
                                {permission.nom}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-4">
                          Équipes
                        </h4>
                        <div className="space-y-3">
                          {teams.map((team) => (
                            <label
                              key={team.id}
                              className="flex items-center cursor-pointer p-2 rounded hover:bg-white"
                            >
                              <input
                                type="checkbox"
                                checked={selectTeams.some(
                                  (t) => t.id === team.id
                                )}
                                onChange={() => TeamSelection(team)}
                                className="w-4 h-4 text-blue-600 mr-3 rounded"
                              />
                              <span className="text-gray-700">{team.nom}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={Envoie}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Enregistrer les droits
                    </button>
                    <button
                      onClick={() => openModal(selectUser)}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Modifier les informations
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <h3 className="text-lg mb-2">
                      Aucun utilisateur sélectionné
                    </h3>
                    <p>Choisissez un utilisateur pour voir ses informations</p>
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
        toastClassName="backdrop-blur-lg bg-white/10 border border-white/20"
      />
    </div>
  );
};

export default Appli;
