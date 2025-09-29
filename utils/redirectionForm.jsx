import axios from "axios";

export const authUtils = {
  _isLoggingOut: false,
  _interceptorSetup: false,
  autoLogoutTimer: null,

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

  isTokenExpiredLocally: () => {
    const expiryInfo = authUtils.getTokenExpiryInfo();

    if (!expiryInfo) {
      return true;
    }

    return expiryInfo.isExpired;
  },

  hasAuthData: () => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    return !!(token && userData);
  },

  checkTokenValidity: async () => {
    const token = authUtils.getToken();

    if (!token) {
      return false;
    }

    if (authUtils.isTokenExpiredLocally()) {
      return false;
    }

    try {
      const response = await axios.get(
        "http://localhost:8000/api/check-token",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      return response.data.success;
    } catch {
      return false;
    }
  },

  verifyAndRedirect: async () => {
    // Si logout en cours, ne pas faire de vérifications
    if (authUtils._isLoggingOut) {
      return false;
    }

    if (!authUtils.hasAuthData()) {
      authUtils.redirectToLogin();
      return false;
    }

    if (authUtils.isTokenExpiredLocally()) {
      authUtils.logout();
      return false;
    }

    const isTokenValid = await authUtils.checkTokenValidity();
    if (!isTokenValid) {
      authUtils.logout();
      return false;
    }

    return true;
  },

  scheduleAutoLogout: () => {
    const expiryInfo = authUtils.getTokenExpiryInfo();

    if (!expiryInfo || expiryInfo.isExpired) {
      return;
    }

    const timeLeft = expiryInfo.timeLeft;

    if (timeLeft > 0) {
      if (authUtils.autoLogoutTimer) {
        clearTimeout(authUtils.autoLogoutTimer);
      }

      authUtils.autoLogoutTimer = setTimeout(() => {
        alert("Votre session a expiré. Reconnexion nécessaire.");
        authUtils.logout();
      }, timeLeft);
    }
  },

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
    window.location.href = "/";
  },

  getRedirectPath: (user) => {
    switch (user.departement) {
      case "Administration":
        return "/codeAdmin";
      default:
        return "/departement/employer";
    }
  },

  // Version simplifiée de logout qui fonctionne
  logout: async () => {
    // Protection contre les appels multiples
    if (authUtils._isLoggingOut) {
      console.log("Logout déjà en cours...");
      return;
    }

    authUtils._isLoggingOut = true;
    console.log("Début de la déconnexion");

    try {
      // 1. Appeler l'API de déconnexion d'abord (si token disponible)
      const token = authUtils.getToken();
      if (token) {
        console.log("Appel API logout...");
        try {
          await axios.post(
            "http://localhost:8000/api/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 5000,
            }
          );
          console.log("Logout API réussi");
        } catch (apiError) {
          console.warn("Erreur API logout:", apiError.message);
          // Continue même si l'API échoue
        }
      }

      // 2. Nettoyer les timers
      if (authUtils.autoLogoutTimer) {
        clearTimeout(authUtils.autoLogoutTimer);
        authUtils.autoLogoutTimer = null;
      }

      // 3. Vider le localStorage
      localStorage.clear(); // Plus simple et efficace

      // 4. Message si nécessaire
      if (window.location.pathname !== "/connexion") {
        alert("Déconnexion effectuée. Redirection vers la page de connexion.");
      }

      // 5. Redirection
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Forcer la déconnexion même en cas d'erreur
      localStorage.clear();
      window.location.href = "/";
    } finally {
      // Reset du flag après un délai
      setTimeout(() => {
        authUtils._isLoggingOut = false;
      }, 2000);
    }
  },

  setupAxiosInterceptor: () => {
    if (authUtils._interceptorSetup) {
      return;
    }

    const publicUrls = [
      "/api/postes",
      "/api/login",
      "/api/verif",
      "/api/users",
      "http://localhost:5000/users",
      "/api/emeilverif",
      "/api/passReset",
      "/api/logout",
      "/api/approuver",
    ];

    const isPublicUrl = (url) => {
      return publicUrls.some((publicUrl) => url && url.includes(publicUrl));
    };

    // Request interceptor simplifié
    axios.interceptors.request.use(
      (config) => {
        // Passer les URLs publiques sans vérification
        if (isPublicUrl(config.url)) {
          return config;
        }

        // Si logout en cours, rejeter les autres requêtes
        if (authUtils._isLoggingOut) {
          return Promise.reject(new Error("Logout en cours"));
        }

        // Ajouter le token si disponible et non expiré
        const token = authUtils.getToken();
        if (token && !authUtils.isTokenExpiredLocally()) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!isPublicUrl(config.url)) {
          // Token manquant ou expiré pour une route protégée
          authUtils.logout();
          return Promise.reject(new Error("Token manquant ou expiré"));
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor simplifié
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        // Si 401 sur une route protégée et pas déjà en logout
        if (
          status === 401 &&
          !isPublicUrl(url) &&
          !authUtils._isLoggingOut &&
          window.location.pathname !== "/"
        ) {
          console.log("Token invalide détecté, déconnexion...");
          authUtils.logout();
        }

        return Promise.reject(error);
      }
    );

    authUtils._interceptorSetup = true;
    console.log("Interceptors configurés");
  },

  debugTokenState: () => {
    const token = authUtils.getToken();
    const hasAuthData = authUtils.hasAuthData();
    const isExpired = authUtils.isTokenExpiredLocally();
    const isLoggingOut = authUtils._isLoggingOut;

    console.log("Debug Token State:", {
      hasToken: !!token,
      tokenLength: token?.length,
      hasAuthData,
      isExpired,
      isLoggingOut,
    });
  },

  isAuthenticated: () => {
    return authUtils.hasAuthData() && !authUtils.isTokenExpiredLocally();
  },
};
