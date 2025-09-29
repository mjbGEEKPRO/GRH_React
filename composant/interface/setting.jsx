import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { authUtils } from "../../utils/redirectionForm";

const Settings = ({ user, onClose }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("password");
  const [loading, setLoading] = useState(false);

  // États pour la modification du mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      taskReminders: true,
      projectUpdates: true,
      deadlineAlerts: true,
    },
    theme: "dark",
    language: "fr",
    autoLogout: 30, // en minutes
  });

  // États pour les informations personnelles
  const [personalInfo, setPersonalInfo] = useState({
    telephone: user?.telephone || "",
    adresse: user?.adresse || "",
    dateNaissance: user?.date_naissance || "",
    situationFamiliale: user?.situation_familiale || "",
  });

  // États pour les paramètres de sécurité
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/user-preferences"
      );
      if (response.data.success) {
        setPreferences({ ...preferences, ...response.data.preferences });
        setSecuritySettings({ ...securitySettings, ...response.data.security });
      }
    } catch (error) {
      console.error("Erreur chargement préférences:", error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(
        "Le nouveau mot de passe doit contenir au moins 8 caractères"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        "http://localhost:8000/api/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      );

      if (response.data.success) {
        toast.success("Mot de passe modifié avec succès");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.patch(
        "http://localhost:8000/api/update-personal-info",
        personalInfo
      );

      if (response.data.success) {
        toast.success("Informations personnelles mises à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);

    try {
      const response = await axios.patch(
        "http://localhost:8000/api/update-preferences",
        {
          preferences,
          security: securitySettings,
        }
      );

      if (response.data.success) {
        toast.success("Préférences sauvegardées");
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Modification du mot de passe
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez votre mot de passe actuel"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimum 8 caractères"
              required
              minLength="8"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirmez votre nouveau mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <h4 className="text-yellow-400 font-medium mb-2">
          Conseils de sécurité
        </h4>
        <ul className="text-yellow-300/80 text-sm space-y-1">
          <li>• Utilisez au moins 8 caractères</li>
          <li>• Mélangez majuscules, minuscules, chiffres et symboles</li>
          <li>• Évitez les informations personnelles</li>
          <li>• Changez régulièrement votre mot de passe</li>
        </ul>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Informations personnelles
        </h3>
        <form onSubmit={handlePersonalInfoUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={personalInfo.telephone}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    telephone: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+221 XX XXX XX XX"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                value={personalInfo.dateNaissance}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    dateNaissance: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Adresse
            </label>
            <textarea
              value={personalInfo.adresse}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, adresse: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre adresse complète"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Situation familiale
            </label>
            <select
              value={personalInfo.situationFamiliale}
              onChange={(e) =>
                setPersonalInfo({
                  ...personalInfo,
                  situationFamiliale: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner</option>
              <option value="Célibataire">Célibataire</option>
              <option value="Marié(e)">Marié(e)</option>
              <option value="Divorcé(e)">Divorcé(e)</option>
              <option value="Veuf/Veuve">Veuf/Veuve</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Préférences de notification
        </h3>

        <div className="space-y-4">
          {Object.entries(preferences.notifications).map(([key, value]) => {
            const labels = {
              email: "Notifications par email",
              taskReminders: "Rappels de tâches",
              projectUpdates: "Mises à jour des projets",
              deadlineAlerts: "Alertes d'échéance",
            };

            return (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div>
                  <h4 className="text-white font-medium">{labels[key]}</h4>
                  <p className="text-white/60 text-sm">
                    {key === "email" && "Recevoir les notifications par email"}
                    {key === "taskReminders" &&
                      "Rappels pour vos tâches en cours"}
                    {key === "projectUpdates" &&
                      "Notifications des changements de projets"}
                    {key === "deadlineAlerts" && "Alertes avant les échéances"}
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="sr-only"
                  />
                  <label
                    htmlFor={key}
                    className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      value ? "bg-blue-600" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        value ? "translate-x-6" : ""
                      }`}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h4 className="text-white font-medium mb-3">Paramètres généraux</h4>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <label className="block text-white/70 text-sm font-medium mb-2">
                Déconnexion automatique (minutes)
              </label>
              <select
                value={preferences.autoLogout}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    autoLogout: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 heure</option>
                <option value={120}>2 heures</option>
              </select>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <label className="block text-white/70 text-sm font-medium mb-2">
                Langue
              </label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({ ...preferences, language: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="wo">Wolof</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handlePreferencesUpdate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder les préférences"}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Paramètres de sécurité
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">
                  Authentification à deux facteurs
                </h4>
                <p className="text-white/60 text-sm">
                  Sécurisez votre compte avec un code de vérification
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  id="2fa"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      twoFactorAuth: e.target.checked,
                    })
                  }
                  className="sr-only"
                />
                <label
                  htmlFor="2fa"
                  className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    securitySettings.twoFactorAuth
                      ? "bg-green-600"
                      : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      securitySettings.twoFactorAuth ? "translate-x-6" : ""
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Alertes de connexion</h4>
                <p className="text-white/60 text-sm">
                  Être notifié des nouvelles connexions à votre compte
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  id="loginAlerts"
                  checked={securitySettings.loginAlerts}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      loginAlerts: e.target.checked,
                    })
                  }
                  className="sr-only"
                />
                <label
                  htmlFor="loginAlerts"
                  className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    securitySettings.loginAlerts ? "bg-blue-600" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      securitySettings.loginAlerts ? "translate-x-6" : ""
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <h4 className="text-red-400 font-medium mb-3">Zone de danger</h4>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Êtes-vous sûr de vouloir déconnecter toutes les sessions actives ?"
                  )
                ) {
                  // Logique pour déconnecter toutes les sessions
                  toast.info("Toutes les sessions ont été fermées");
                }
              }}
              className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 px-4 rounded-lg transition-colors border border-red-500/30"
            >
              Déconnecter toutes les sessions
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Cette action supprimera définitivement votre compte. Êtes-vous sûr ?"
                  )
                ) {
                  // Logique pour supprimer le compte
                  toast.error("Fonctionnalité non disponible pour le moment");
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>

        <button
          onClick={handlePreferencesUpdate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Paramètres</h2>
            <p className="text-white/70">
              Gérez votre compte et vos préférences
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Navigation des onglets */}
          <div className="md:w-1/4 p-6 border-r border-white/10">
            <nav className="space-y-2">
              {[
                { id: "password", label: "Mot de passe", icon: "🔐" },
                { id: "personal", label: "Informations", icon: "👤" },
                { id: "notifications", label: "Notifications", icon: "🔔" },
                { id: "security", label: "Sécurité", icon: "🛡️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSettingsTab === tab.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="md:w-3/4 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeSettingsTab === "password" && renderPasswordSettings()}
            {activeSettingsTab === "personal" && renderPersonalInfo()}
            {activeSettingsTab === "notifications" &&
              renderNotificationSettings()}
            {activeSettingsTab === "security" && renderSecuritySettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
