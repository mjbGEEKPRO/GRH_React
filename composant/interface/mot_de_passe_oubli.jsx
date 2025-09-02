import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { validateCode, validatePasswords, validateEmail } from "../passverif";

function ForgetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const [resetCode, setResetCode] = useState(generateCode());

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

      const res = await axios.put(
        "http://127.0.0.1:8000/api/verifmeil ",
        email
      );
      if (res.data.success) {
        setTimeout(() => {
          console.log(
            `Code de réinitialisation envoyé à ${email} : ${resetCode}`
          );
          setStep(2);
          setIsLoading(false);
        }, 1500);
      }
    } catch {
      const status = error.response.status;
      const serverErrorMessage = error.response.data.message;

      if ([422, 401, 403, 404].includes(status)) {
        toast.error(`🚫 ${serverErrorMessage}`);
      } else if (status === 500) {
        toast.error(`❌ ${serverErrorMessage}`);
      }
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

    console.log(`Mot de passe réinitialisé pour ${email} : ${newPassword}`);
    const formdata = {
      email: email,
      newPassword: confirmPassword,
    };
    const res = await axios.put(
      "http://127.0.0.1:8000/api/resetpassword",
      formdata
    );

    setSuccess(res.data.message);
    setTimeout(() => {
      window.location.href = "/connexion";
    }, 2000);
  };

  const getStepIndicator = (stepNumber) => {
    if (step > stepNumber)
      return (
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          ✓
        </div>
      );
    if (step === stepNumber)
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {stepNumber}
        </div>
      );
    return (
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
        {stepNumber}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Mot de passe oublié</h1>
          </div>

          {/* Indicateur de progression */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStepIndicator(1)}
                <span
                  className={`text-sm font-medium ${
                    step >= 1 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  E-mail
                </span>
              </div>
              <div
                className={`flex-1 h-1 mx-3 rounded ${
                  step > 1 ? "bg-green-400" : "bg-gray-200"
                }`}
              ></div>
              <div className="flex items-center space-x-2">
                {getStepIndicator(2)}
                <span
                  className={`text-sm font-medium ${
                    step >= 2 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  Code
                </span>
              </div>
              <div
                className={`flex-1 h-1 mx-3 rounded ${
                  step > 2 ? "bg-green-400" : "bg-gray-200"
                }`}
              ></div>
              <div className="flex items-center space-x-2">
                {getStepIndicator(3)}
                <span
                  className={`text-sm font-medium ${
                    step >= 3 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  Nouveau
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Saisissez votre e-mail
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Nous vous enverrons un code de réinitialisation
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse e-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="votre.email@exemple.com"
                      disabled={isLoading}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Vérifiez votre code
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Nous avons envoyé un code à cette adresse email{" "}
                    <span className="font-medium text-blue-600">{email}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code de réinitialisation
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest ${
                        validationErrors.code
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="000000"
                      maxLength="6"
                    />
                    {validationErrors.code && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.code}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Vérifier le code
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetCode(generateCode());
                      console.log(`Nouveau code généré: ${resetCode}`);
                    }}
                    className="w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Nouveau mot de passe
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Choisissez un mot de passe sécurisé
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.password
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Nouveau mot de passe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.password
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirmer le mot de passe"
                    />
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Réinitialiser le mot de passe
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t text-center">
            <p className="text-xs text-gray-500">
              Vous vous souvenez de votre mot de passe ?
              <Link
                to={"/connexion"}
                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
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
      />
    </div>
  );
}

export default ForgetPassword;
