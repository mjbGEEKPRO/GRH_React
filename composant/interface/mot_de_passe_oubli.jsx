import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { validateCode, validatePasswords, validateEmail } from "../passverif";
import { resetPass } from "../../mail/resetPass";

function ForgetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [id, setId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [afficher, setAfficher] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [resetCode, setResetCode] = useState("");
  const [nom, setNom] = useState("");
  const generateAndSendCode = async () => {
    const codeGenerer = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("code geneerer ", codeGenerer);
    setResetCode(codeGenerer);

    try {
      // const emailSent = await resetPass(email, nom, codeGenerer);
      const emailSent = true;
      if (emailSent) {
        toast.success("Un code a été envoyé à votre adresse mail");
        return true;
      } else {
        toast.error("Impossible d'envoyer l'email");
        return false;
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email");
      return false;
    }
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      setError(null);
      setValidationErrors({});

      // Validation de l'email
      const emailValidation = await validateEmail(email);
      if (!emailValidation.isValid) {
        setValidationErrors({ email: emailValidation.errors });
        setIsLoading(false);
        return;
      }

      const mail = { email };
      const res = await axios.post(
        "http://localhost:8000/api/emeilverif",
        mail
      );
      setId(res.data.id);
      setNom(res.data.nom);
      if (res.data.success) {
        // const emailSent = await generateAndSendCode(nom);
        const emailSent = true;
        if (emailSent) {
          setTimeout(() => {
            setStep(2);
            setIsLoading(false);
          }, 1000);
        } else {
          setIsLoading(false);
        }
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
        toast.error("❌ Erreur de connexion, veuillez réessayer");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    setValidationErrors({});

    // Validation du code
    const codeValidation = await validateCode(code);
    if (!codeValidation.isValid) {
      setValidationErrors({ code: codeValidation.errors });
      return;
    }

    if (code === resetCode) {
      setStep(3);
    } else {
      setError("Code de réinitialisation incorrect");
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setValidationErrors({});

    // Validation des mots de passe
    const passwordValidation = await validatePasswords(
      newPassword,
      confirmPassword
    );
    if (!passwordValidation.isValid) {
      setValidationErrors({ password: passwordValidation.errors });
      return;
    }

    try {
      const password = { password: confirmPassword };
      const res = await axios.put(
        `http://localhost:8000/api/passReset/${id}`,
        password
      );

      setSuccess(res.data.message);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
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
        toast.error("❌ Erreur lors de la réinitialisation");
      }
    }
  };

  const Afficher = (e) => {
    setAfficher(e.target.checked);
  };

  const handleResendCode = async () => {
    console.log("nom ", nom);
    await generateAndSendCode(nom);
  };

  const getStepIndicator = (stepNumber) => {
    if (step > stepNumber)
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
          ✓
        </div>
      );
    if (step === stepNumber)
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white/20">
          {stepNumber}
        </div>
      );
    return (
      <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/50 text-sm font-bold border border-white/20">
        {stepNumber}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white/20">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Récupération du mot de passe
            </h1>
            <p className="text-white/70 text-sm">
              Suivez les étapes pour réinitialiser votre accès
            </p>
          </div>

          {/* Indicateur de progression */}
          <div className="px-8 py-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center space-y-2">
                {getStepIndicator(1)}
                <span
                  className={`text-xs font-medium ${
                    step >= 1 ? "text-white" : "text-white/50"
                  }`}
                >
                  E-mail
                </span>
              </div>

              <div
                className={`flex-1 h-1 mx-4 rounded-full ${
                  step > 1
                    ? "bg-gradient-to-r from-green-400 to-emerald-400"
                    : "bg-white/20"
                }`}
              ></div>

              <div className="flex flex-col items-center space-y-2">
                {getStepIndicator(2)}
                <span
                  className={`text-xs font-medium ${
                    step >= 2 ? "text-white" : "text-white/50"
                  }`}
                >
                  Code
                </span>
              </div>

              <div
                className={`flex-1 h-1 mx-4 rounded-full ${
                  step > 2
                    ? "bg-gradient-to-r from-green-400 to-emerald-400"
                    : "bg-white/20"
                }`}
              ></div>

              <div className="flex flex-col items-center space-y-2">
                {getStepIndicator(3)}
                <span
                  className={`text-xs font-medium ${
                    step >= 3 ? "text-white" : "text-white/50"
                  }`}
                >
                  Nouveau
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Saisissez votre adresse e-mail
                  </h2>
                  <p className="text-white/70 text-sm">
                    Nous vous enverrons un code de réinitialisation sécurisé
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Adresse e-mail professionnelle
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                        validationErrors.email
                          ? "border-red-500/50"
                          : "border-white/20"
                      }`}
                      placeholder="prenom.nom@entreprise.com"
                      disabled={isLoading}
                    />
                    {validationErrors.email && (
                      <p className="mt-2 text-sm text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Envoi en cours...
                      </div>
                    ) : (
                      "Envoyer le code de réinitialisation"
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Vérifiez votre code
                  </h2>
                  <p className="text-white/70 text-sm">
                    Code envoyé à{" "}
                    <span className="font-medium text-blue-300">{email}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Code de réinitialisation (6 chiffres)
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white text-center text-2xl font-mono tracking-widest placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                        validationErrors.code
                          ? "border-red-500/50"
                          : "border-white/20"
                      }`}
                      placeholder="000000"
                      maxLength="6"
                    />
                    {validationErrors.code && (
                      <p className="mt-2 text-sm text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {validationErrors.code}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-lg"
                  >
                    Vérifier le code
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-6 rounded-2xl font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Nouveau mot de passe
                  </h2>
                  <p className="text-white/70 text-sm">
                    Choisissez un mot de passe fort et sécurisé
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={afficher ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-6 py-4 pr-12 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                          validationErrors.password
                            ? "border-red-500/50"
                            : "border-white/20"
                        }`}
                        placeholder="Nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => setAfficher(!afficher)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {afficher ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type={afficher ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                        validationErrors.password
                          ? "border-red-500/50"
                          : "border-white/20"
                      }`}
                      placeholder="Confirmer le mot de passe"
                    />
                    {validationErrors.password && (
                      <p className="mt-2 text-sm text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      checked={afficher}
                      onChange={Afficher}
                      className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label className="text-white/80 text-sm">
                      Afficher les mots de passe
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-2xl font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 shadow-lg"
                  >
                    Réinitialiser le mot de passe
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-300 text-sm text-center">{success}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-white/5 border-t border-white/10 text-center">
            <p className="text-xs text-white/60">
              Vous vous souvenez de votre mot de passe ?
              <Link
                to="/connexion"
                className="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors"
              >
                Se connecter
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
        className="backdrop-blur-lg"
      />
    </div>
  );
}

export default ForgetPassword;
