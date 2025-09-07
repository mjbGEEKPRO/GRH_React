import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import schema from "./validation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "../composant/select";

function Formulaire() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [infos, setInfos] = useState({
    nom: "",
    prenom: "",
    email: "",
    poste: "",
    telephone: "",
    date_naissance: "",
    lieu_naissance: "",
  });

  const [erreur, setErreur] = useState({});

  const Valeur = (e) => {
    setInfos({
      ...infos,
      [e.target.name]: e.target.value,
    });
  };

  const PosteChange = (selectedPoste) => {
    setInfos({
      ...infos,
      poste: selectedPoste,
    });
  };

  // Validation de la date de naissance
  const validateDateNaissance = (date) => {
    if (!date) return false;

    const selectedDate = new Date(date);
    const currentYear = new Date().getFullYear();
    const selectedYear = selectedDate.getFullYear();

    // Vérifier que l'année est entre 1927 et 2025
    if (selectedYear < 1927 || selectedYear > 2025) {
      return false;
    }

    // Vérifier que la date n'est pas dans le futur
    if (selectedDate > new Date()) {
      return false;
    }

    return true;
  };

  const Ajouter = async (e) => {
    e.preventDefault();
    setLoading(true);

    let loadingToast = null;

    try {
      // Validation personnalisée de la date de naissance
      if (!validateDateNaissance(infos.date_naissance)) {
        setErreur({
          ...erreur,
          date_naissance:
            "La date de naissance doit être entre 1927 et aujourd'hui",
        });
        setLoading(false);
        return;
      }
      console.log("donner send yup ", infos);
      await schema.validate(infos, { abortEarly: false });

      loadingToast = toast.loading("Veuillez patienter...");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/verif",
        infos
      );

      if (response.data.success) {
        toast.update(loadingToast, {
          render: `✅ ${response.data.message}`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        console.log("Utilisateur créé:", response.data.user);
        const userForAdmin = infos;
        console.log("user for admin form ", userForAdmin);
        setTimeout(() => {
          navigate("/code", {
            state: {
              email: infos.email,
              userForAdmin: userForAdmin,
            },
          });
        }, 1500);

        // Reset du formulaire
        setInfos({
          nom: "",
          prenom: "",
          email: "",
          poste: "",
          telephone: "",
          date_naissance: "",
          lieu_naissance: "",
        });
        setErreur({});
      }
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      if (error.name === "ValidationError") {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErreur(validationErrors);
      } else if (error.response) {
        const serverErrorMessage = error.response.data.message;
        if (error.response.status === 422) {
          toast.info(`❌ ${serverErrorMessage}`);
        } else if (error.response.status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur de connexion, veuillez réessayer", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculer l'âge pour affichage
  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = calculateAge(infos.dateNaissance);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
              S'inscrire
            </h1>
          </div>

          <form onSubmit={Ajouter} className="space-y-6">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  placeholder="Nom"
                  value={infos.nom}
                  onChange={Valeur}
                  disabled={loading}
                  className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    erreur.nom
                      ? "border-red-400 bg-red-500/10"
                      : "hover:bg-white/15"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {erreur.nom && (
                  <p className="text-red-300 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {erreur.nom}
                  </p>
                )}
              </div>

              <div className="relative group">
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  placeholder="Prénom"
                  value={infos.prenom}
                  onChange={Valeur}
                  disabled={loading}
                  className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    erreur.prenom
                      ? "border-red-400 bg-red-500/10"
                      : "hover:bg-white/15"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {erreur.prenom && (
                  <p className="text-red-300 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {erreur.prenom}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Adresse email"
                value={infos.email}
                disabled={loading}
                onChange={Valeur}
                className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                  erreur.email
                    ? "border-red-400 bg-red-500/10"
                    : "hover:bg-white/15"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {erreur.email && (
                <p className="text-red-300 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {erreur.email}
                </p>
              )}
            </div>

            {/* Date de naissance */}
            <div className="relative group">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                id="date_naissance"
                name="date_naissance"
                value={infos.date_naissance}
                onChange={Valeur}
                disabled={loading}
                min="1927-01-01"
                max={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                  erreur.dateNaissance
                    ? "border-red-400 bg-red-500/10"
                    : "hover:bg-white/15"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  colorScheme: "dark",
                }}
              />
              {age && age >= 0 && (
                <p className="text-blue-300 text-sm mt-1 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Âge : {age} ans
                </p>
              )}
              {erreur.dateNaissance && (
                <p className="text-red-300 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {erreur.dateNaissance}
                </p>
              )}
            </div>

            {/* Lieu de naissance */}
            <div className="relative group">
              <input
                type="text"
                id="lieu_naissance"
                name="lieu_naissance"
                placeholder="Lieu de naissance"
                value={infos.lieu_naissance}
                onChange={Valeur}
                disabled={loading}
                className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                  erreur.lieuNaissance
                    ? "border-red-400 bg-red-500/10"
                    : "hover:bg-white/15"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {erreur.lieuNaissance && (
                <p className="text-red-300 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {erreur.lieuNaissance}
                </p>
              )}
            </div>

            {/* Téléphone et Poste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  type="number"
                  id="telephone"
                  name="telephone"
                  placeholder="Téléphone"
                  disabled={loading}
                  value={infos.telephone}
                  onChange={Valeur}
                  className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    erreur.telephone
                      ? "border-red-400 bg-red-500/10"
                      : "hover:bg-white/15"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {erreur.telephone && (
                  <p className="text-red-300 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {erreur.telephone}
                  </p>
                )}
              </div>

              <div className="relative group">
                <Select
                  value={infos.poste}
                  onChange={PosteChange}
                  error={erreur.poste}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-2xl transform hover:scale-105"
              }`}
            >
              <span className="flex items-center justify-center">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    veuillez patienter...
                  </>
                ) : (
                  <>
                    S'inscrire
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-300">
              Vous avez un compte ?{" "}
              <Link
                to="/connexion"
                className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold hover:from-purple-300 hover:to-pink-300 transition-all duration-200 underline decoration-purple-400"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            📅 Date de naissance acceptée : 1927 - {new Date().getFullYear()}
          </p>
        </div>
      </div>

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
}

export default Formulaire;
