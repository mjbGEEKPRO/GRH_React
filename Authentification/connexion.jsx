import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import validateschem from "./verif";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaUser } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authUtils } from "../utils/redirectionForm";

function Connexion() {
  const [infos, setInfos] = useState({
    email_pro: "",
    password: "",
  });
  const [erreur, setErreur] = useState({});
  const [afficher, setAfficher] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkIfAlreadyLoggedIn = () => {
      // localStorage.removeItem("user_data");
      // localStorage.removeItem("access_token");
      // localStorage.removeItem("token_expires_at");
      // localStorage.removeItem("token_expires_in");
      // localStorage.removeItem("login_time");
      //  Vérification simple et rapide
      if (authUtils.isAuthenticated()) {
        console.log(" Utilisateur déjà connecté, redirection...");
        const user = authUtils.getUserData();
        const redirectPath = authUtils.getRedirectPath(user);
        console.log("redirection vers", redirectPath, "user info", user);
        navigate(redirectPath);
      } else {
        console.log("Utilisateur pas connecté, affichage du formulaire");
      }
    };

    // Vérifier une seule fois au montage du composant
    checkIfAlreadyLoggedIn();
  }, []); // Dépendances vides pour éviter les re-exécutions

  // Configuration de l'interceptor une seule fois
  useEffect(() => {
    authUtils.setupAxiosInterceptor();
  }, []); // Dépendances vides

  const Afficher = (e) => {
    setAfficher(e.target.checked);
  };

  const Valeur = (e) => {
    setInfos({ ...infos, [e.target.name]: e.target.value });
  };

  const connecter = async (e) => {
    e.preventDefault();
    setLoading(true);

    let loadingToast = null;

    try {
      await validateschem.validate(infos, { abortEarly: false });

      loadingToast = toast.loading("Connexion en cours...");

      const response = await axios.post("http://192.168.56.1/api/login", infos);

      // // 🔍 AJOUTEZ CES LOGS
      // console.log("=== RÉPONSE COMPLÈTE ===");
      // console.log("Response:", response.data);
      // console.log("User:", response.data.user);
      // console.log("Département:", response.data.user?.departement);
      // console.log("Poste:", response.data.user?.poste);
      // console.log("=====================");

      const serverMessage = response.data.message;

      if (response.data.success) {
        toast.success(`✅ ${serverMessage}`, { autoClose: 2000 });

        authUtils.setUserData(
          response.data.user,
          response.data.access_token,
          response.data.expires_at,
          response.data.expires_in
        );

        const redirectPath = authUtils.getRedirectPath(response.data.user);

        // Navigation immédiate sans setTimeout
        window.location.href = redirectPath;

        // Reset du formulaire
        setInfos({ email_pro: "", password: "" });
        setErreur({});
      }
    } catch (error) {
      // ✅ Fermer le toast de chargement en cas d'erreur
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <FaUser className="text-white text-2xl" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Se connecter</h1>
          </div>

          <form onSubmit={connecter} className="space-y-6">
            <div>
              <input
                type="text"
                id="email_pro"
                name="email_pro"
                placeholder="Adresse email"
                value={infos.email_pro}
                onChange={Valeur}
                disabled={loading}
                className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 ${
                  erreur.email_pro ? "border-red-400 bg-red-500/20" : ""
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {erreur.email_pro && (
                <div className="flex items-center mt-2">
                  <svg
                    className="w-4 h-4 text-red-300 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <p className="text-red-300 text-sm">{erreur.email_pro}</p>
                </div>
              )}
            </div>

            <div>
              <input
                type={afficher ? "text" : "password"}
                id="password"
                name="password"
                value={infos.password}
                placeholder="Mot de passe"
                onChange={Valeur}
                disabled={loading}
                className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 ${
                  erreur.password ? "border-red-400 bg-red-500/20" : ""
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {erreur.password && (
                <div className="flex items-center mt-2">
                  <svg
                    className="w-4 h-4 text-red-300 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <p className="text-red-300 text-sm">{erreur.password}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={afficher}
                  onChange={Afficher}
                  disabled={loading}
                  className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label className="text-white/80">
                  Afficher le mot de passe
                </label>
              </div>

              <Link
                to={"/mot_de_passe_oubli"}
                className="text-white/80 hover:text-white font-medium underline transition duration-200"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transform transition-all duration-300 shadow-xl ${
                loading
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 hover:scale-[1.02]"
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
                    Connexion...
                  </>
                ) : (
                  "Se connecter →"
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              Vous n'avez pas de compte ?{" "}
              <Link
                to={"/formulaire"}
                className="text-white hover:text-white/80 font-semibold underline transition duration-200"
              >
                Créer un compte
              </Link>
            </p>
          </div>
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
      />
    </div>
  );
}

export default Connexion;
