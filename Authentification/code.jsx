import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { sendEmailWithCode } from "../mail/authUserCode";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

function Code() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sendCode, setSendCode] = useState("");
  const [compteur, setCompteur] = useState(60);
  const [estValide, setEstValide] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // États pour la gestion des données
  const [initState, setInitState] = useState("loading");
  const [email, setEmail] = useState("");
  const [userForAdmin, setUserForAdmin] = useState(null);
  const [nom, setNom] = useState("");
  const [emailError, setEmailError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Fonction de génération de code
  const generateCode = useCallback(async () => {
    const codeGenerer = Math.floor(100000 + Math.random() * 900000).toString();
    setSendCode(codeGenerer);
    console.log(" Nouveau code généré:", codeGenerer);

    if (email && nom) {
      const emailSent = await sendEmailWithCode(email, nom, codeGenerer);
      if (emailSent) {
        toast.success("Un code a été envoyer à votre adresse mail");
      } else {
        setEmailError("Impossible d'envoyer l'email");
      }
      return { code: codeGenerer, emailSent };
    }
    return { code: codeGenerer, emailSent: false };
  }, [email, nom]);

  // Reset du timer
  const resetAndStartTimer = useCallback(() => {
    console.log("Timer réinitialisé");
    setEstValide(false);
    setCompteur(60);
    setTimeout(() => {
      setEstValide(true);
    }, 100);
  }, []);

  // Chargement des données - VERSION SIMPLIFIÉE
  useEffect(() => {
    console.log("🔄 Chargement des données...");
    console.log("Location state:", location.state);

    // Vérification simple des données de navigation
    if (location.state?.email && location.state?.userForAdmin) {
      console.log("✅ Données trouvées dans location.state");
      setEmail(location.state.email);
      setUserForAdmin(location.state.userForAdmin);
      setNom(location.state.userForAdmin.nom);
      setInitState("ready");
    } else {
      console.log("❌ Données manquantes dans location.state");
      setError(
        "Données de session manquantes. Veuillez recommencer l'inscription."
      );
      setInitState("error");

      // Redirection après 3 secondes
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [location.state, navigate]);

  // Génération du premier code
  useEffect(() => {
    if (initState === "ready" && email && userForAdmin && !sendCode) {
      console.log("✅ Génération du premier code...");
      generateCode().then(() => {
        resetAndStartTimer();
      });
    }
  }, [
    initState,
    email,
    userForAdmin,
    sendCode,
    generateCode,
    resetAndStartTimer,
  ]);

  // Gestion du timer
  useEffect(() => {
    let interval = null;
    if (estValide && compteur > 0) {
      interval = setInterval(() => {
        setCompteur((prev) => {
          if (prev <= 1) {
            setEstValide(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [estValide, compteur]);

  // Gestion de l'input
  const handleInputChange = useCallback((value) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(numericValue);
    setError("");
  }, []);

  // Vérification du code
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return;
    }

    if (!estValide) {
      setError("Le code a expiré");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (code === sendCode) {
        setSuccess(true);
        toast.success("✅ Code vérifié avec succès");

        // Appel à l'API
        console.log("user pour admin api ", userForAdmin.dateNaissance);
        console.log("📤 Envoi à l'API...");
        const res = await axios.post(
          "http://127.0.0.1:8000/api/users",
          userForAdmin,
          { timeout: 10000 }
        );
        console.log("deja envoyer à api")
        if (res.data.success) {
          const userForJson = res.data.user;
          await axios.post("http://localhost:5000/users", userForJson, {
            timeout: 5000,
          });
          console.log("deja envoyer à json")
          toast.info("🎉 Inscription terminée avec succès !");
          
          
          window.location.href = "/connexion";
          
        } else {
          setError(res.data.message || "Erreur lors de l'inscription");
        }
      } else {
        setError("❌ Code incorrect, veuillez réessayer");
      }
    } catch (error) {
      console.log("❌ Erreur lors de la vérification:", error);

      if (error.code === "ECONNABORTED") {
        setError("Délai d'attente dépassé. Vérifiez votre connexion.");
      } else if (error.response?.status === 422) {
        setError("Données invalides. Veuillez recommencer l'inscription.");
      } else {
        setError("Erreur lors de la vérification. Réessayez.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoi du code
  const handleResendCode = async () => {
    if (estValide) {
      toast.info("⏱Le code est encore valide vous pouvez l'entrez!");
      return;
    }

    setIsResending(true);
    setEmailError(null);

    try {
      const result = await generateCode();
      if (result.emailSent) {
        resetAndStartTimer();
        setCode("");
        setError("");
        setSuccess(false);
        toast.success("📨 Nouveau code envoyé !");
      }
    } catch (error) {
      console.log("Erreur renvoi:", error);
      toast.error("❌ Erreur lors du renvoi du code");
    } finally {
      setIsResending(false);
    }
  };

  // Spinner component
  const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  );

  // Écran de chargement
  if (initState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Chargement...
            </h2>
            <p className="text-white/80">Préparation de la vérification</p>
          </div>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (initState === "error" || !email || !userForAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">Erreur</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Retour à l'inscription
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Interface principale
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-700"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vérification</h1>
            <p className="text-white/70 text-sm">Code envoyé à</p>
            <p className="text-blue-300 font-semibold mt-1">{email}</p>

            {estValide && (
              <div className="mt-3">
                <span className="text-yellow-400 text-sm font-medium">
                  ⏱️ Code valide encore {compteur}s
                </span>
              </div>
            )}
          </div>

          {/* Messages d'erreur */}
          {emailError && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-2xl">
              <p className="text-orange-300 text-sm">{emailError}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl">
              <p className="text-green-300">
                Code vérifié avec succès ! Redirection...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isLoading}
                maxLength="6"
                className="w-full px-6 py-4 text-center text-2xl font-bold tracking-widest bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-white/50"
                placeholder="000000"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Spinner />
                  <span className="ml-2">Vérification...</span>
                </span>
              ) : (
                "Vérifier le code"
              )}
            </button>
          </form>

          {/* Section renvoi */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-300 text-sm">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              onClick={handleResendCode}
              disabled={estValide || isLoading || isResending}
              className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Envoi en cours..."
                : estValide
                ? `Renvoyer dans ${compteur}s`
                : "Renvoyer le code"}
            </button>

            <div className="pt-4 border-t border-white/10">
              <Link
                to="/"
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                ← Retour à l'inscription
              </Link>
            </div>
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

export default Code;
