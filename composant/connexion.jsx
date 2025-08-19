import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import validateschem from "./verif";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaUser } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authUtils } from "./redirectionForm";

function Connexion() {
  const [infos, setInfos] = useState({
    email: "",
    password: "",
  });
  const [erreur, setErreur] = useState({});
  const [afficher, setAfficher] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // // Vérifier si déjà connecté
  // useEffect(() => {
  //   if (authUtils.isAuthenticated()) {
  //     const user = authUtils.getUserData();
  //     navigate(authUtils.getRedirectPath(user));
  //   }
  // }, [navigate]);
  useEffect(() => {
    const checkIfAlreadyLoggedIn = async () => {
      const isValid = await authUtils.verifyAndRedirect();
      if (isValid) {
        // Déjà connecté avec token valide → rediriger
        const user = authUtils.getUserData();
        const redirectPath = authUtils.getRedirectPath(user);
        navigate(redirectPath);
      }
    };

    checkIfAlreadyLoggedIn();
  }, [navigate]);

  //  Configurer l'interceptor
  useEffect(() => {
    authUtils.setupAxiosInterceptor();
  }, []);

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

      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        infos
      );

      const serverMessage = response.data.message;

      if (response.data.success) {
        toast.update(loadingToast, {
          render: `✅ ${serverMessage}`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        //  Utiliser authUtils pour sauvegarder
        authUtils.setUserData(response.data.user, response.data.access_token);
        console.log("donner sauvegarder ", response.data.user);
        //  Redirection
        console.log("departement redirection", response.data.user.departement);
        const redirectPath = authUtils.getRedirectPath(response.data.user);

        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);

        // Reset du formulaire
        setInfos({
          email: "",
          password: "",
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
        const status = error.response.status;
        const serverErrorMessage = error.response.data.message;

        if ([422, 401, 403, 404].includes(status)) {
          toast.error(`🚫 ${serverErrorMessage}`);
        } else if (status === 500) {
          toast.error(`❌ ${serverErrorMessage}`);
        }
      } else {
        toast.error("❌ Erreur de connexion, veuillez réessayer");
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
                id="email"
                name="email"
                placeholder="Adresse email"
                value={infos.email}
                onChange={Valeur}
                disabled={loading}
                className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 ${
                  erreur.email ? "border-red-400 bg-red-500/20" : ""
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {erreur.email && (
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
                  <p className="text-red-300 text-sm">{erreur.email}</p>
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
                to={"/"}
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
