import axios from "axios";

export const authUtils = {
  setUserData: (userData, token, expiresAt, expiresIn) => {
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("access_token", token);
    localStorage.setItem("token_expires_at", expiresAt);
    localStorage.setItem("token_expires_in", expiresIn.toString());
    localStorage.setItem("login_time", Date.now().toString());

    console.log(
      "✅ Token sauvé, expire à:",
      new Date(expiresAt).toLocaleString()
    );
  },

  getUserData: () => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  getToken: () => {
    return localStorage.getItem("access_token");
  },

  //informations d'expiration
  getTokenExpiryInfo: () => {
    const expiresAt = localStorage.getItem("token_expires_at");
    const expiresIn = localStorage.getItem("token_expires_in");
    const loginTime = localStorage.getItem("login_time");

    if (!expiresAt || !loginTime) {
      return null;
    }

    const expiryDate = new Date(expiresAt);
    const loginDate = new Date(parseInt(loginTime));
    const now = new Date();

    return {
      expiryDate,
      loginDate,
      expiresInMinutes: parseInt(expiresIn) || 60,
      isExpired: now > expiryDate,
      timeLeft: Math.max(0, expiryDate - now),
      timeLeftMinutes: Math.max(
        0,
        Math.floor((expiryDate - now) / (1000 * 60))
      ),
    };
  },

  // Vérification rapide côté client
  isTokenExpiredLocally: () => {
    const expiryInfo = authUtils.getTokenExpiryInfo();

    if (!expiryInfo) {
      console.log("❌ Pas d'info d'expiration");
      return true;
    }

    if (expiryInfo.isExpired) {
      console.log(
        "❌ Token expiré localement à:",
        expiryInfo.expiryDate.toLocaleString()
      );
      return true;
    }

    console.log(
      "✅ Token valide encore",
      expiryInfo.timeLeftMinutes,
      "minutes"
    );
    return false;
  },

  // Vérification existence des données
  hasAuthData: () => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    return !!(token && userData);
  },

  // Vérification avec Laravel
  checkTokenValidity: async () => {
    const token = authUtils.getToken();

    if (!token) {
      console.log("❌ Aucun token trouvé");
      return false;
    }

    // Vérification locale d'abord
    if (authUtils.isTokenExpiredLocally()) {
      console.log(
        "❌ Token expiré localement - Pas d'appel serveur nécessaire"
      );
      return false;
    }

    try {
      console.log("🔍 Vérification avec Laravel...");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/check-token",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("✅ Token confirmé valide par Laravel");
        return true;
      }

      return false;
    } catch (error) {
      console.log("❌ Erreur vérification token:", error.response?.status);
      return false;
    }
  },

  verifyAndRedirect: async () => {
    console.log("🚀 Début vérification authentification optimisée...");

    if (!authUtils.hasAuthData()) {
      console.log("❌ Pas de données d'authentification");
      authUtils.redirectToLogin();
      return false;
    }

    if (authUtils.isTokenExpiredLocally()) {
      console.log("❌ Token expiré localement");
      authUtils.logout();
      return false;
    }

    // Vérification avec Laravel (par précaution)
    const isTokenValid = await authUtils.checkTokenValidity();

    if (!isTokenValid) {
      console.log("❌ Token rejeté par Laravel");
      authUtils.logout();
      return false;
    }

    console.log("✅ Authentification valide");
    return true;
  },

  // programmation déconnexion automatique
  scheduleAutoLogout: () => {
    const expiryInfo = authUtils.getTokenExpiryInfo();

    if (!expiryInfo || expiryInfo.isExpired) {
      return;
    }

    const timeLeft = expiryInfo.timeLeft;

    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 1000 / 60);
      console.log(
        ` Déconnexion automatique programmée dans ${minutes} minutes`
      );

      // Nettoyer le timer précédent s'il existe
      if (authUtils.autoLogoutTimer) {
        clearTimeout(authUtils.autoLogoutTimer);
      }

      // Programmer la déconnexion
      authUtils.autoLogoutTimer = setTimeout(() => {
        console.log("⏰ Déconnexion automatique - Session expirée");
        alert("Votre session a expiré. Reconnexion nécessaire.");
        authUtils.logout();
      }, timeLeft);
    }
  },

  // temps restant pour affichage
  getTimeLeftDisplay: () => {
    const expiryInfo = authUtils.getTokenExpiryInfo();

    if (!expiryInfo || expiryInfo.isExpired) {
      return "Expiré";
    }

    const minutes = expiryInfo.timeLeftMinutes;

    if (minutes < 1) {
      return "Expire bientôt";
    } else if (minutes === 1) {
      return "1 minute restante";
    } else {
      return `${minutes} minutes restantes`;
    }
  },

  redirectToLogin: () => {
    window.location.href = "/connexion";
  },

  //  Logout sans erreur de référence
  logout: () => {
    console.log("Déconnexion...");

    // Nettoyer le timer de déconnexion automatique
    if (authUtils.autoLogoutTimer) {
      clearTimeout(authUtils.autoLogoutTimer);
      authUtils.autoLogoutTimer = null;
    }

    // Nettoyer localStorage
    localStorage.removeItem("user_data");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_expires_at");
    localStorage.removeItem("token_expires_in");
    localStorage.removeItem("login_time");

    if (window.location.pathname !== "/connexion") {
      alert("Votre session a expiré. Reconnexion nécessaire.");
    }

    window.location.href = "/connexion";
  },

  getRedirectPath: (user) => {
    switch (user.departement) {
      case "Informatique":
        return "/departement/informatique";
      case "Comptabilité":
        return "/departement/comptabilite";
      case "Ressources humaines":
        return "/departement/rh";
      case "Administration":
        return "/codeAdmin";
      default:
        return "/connexion";
    }
  },

  // Interceptor sans erreur de référence
  setupAxiosInterceptor: () => {
    // Protection contre les appels multiples
    if (authUtils._interceptorSetup) {
      console.log("Intercepteur déjà configuré");
      return;
    }

    console.log(" Configuration intercepteur...");

    const publicUrls = [
      "/api/postes",
      "/api/login",
      "/api/verif",
      "/api/data",
      "api/delete",
      "api/getinfo",
      "api/useEdit",
      "api/users",
      "/api/approuver",
      "http://localhost:5000/users",
      "/api/users",
      "/api/forgot-password",
    ];

    const isPublicUrl = (url) => {
      return publicUrls.some((publicUrl) => url?.includes(publicUrl));
    };
    axios.interceptors.request.use(
      (config) => {
        if (!isPublicUrl(config.url)) {
          // Vérification rapide avant d'envoyer
          if (authUtils.isTokenExpiredLocally()) {
            console.log("⚠️ Token expiré - Annulation requête");
            authUtils.logout();
            return Promise.reject(new Error("Token expiré"));
          }

          const token = authUtils.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        if (
          status === 401 &&
          !isPublicUrl(url) &&
          window.location.pathname !== "/connexion"
        ) {
          console.log("🚨 Erreur 401 - Déconnexion");
          authUtils.logout();
        }

        return Promise.reject(error);
      }
    );
    authUtils._interceptorSetup = true;
    console.log("✅ Intercepteur configuré avec succès");
  },
};

authUtils.isAuthenticated = () => {
  return authUtils.hasAuthData() && !authUtils.isTokenExpiredLocally();
};
