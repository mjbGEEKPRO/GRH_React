import axios from "axios";

export const authUtils = {
  //je set le user et son token
  setUserData: (userData, token) => {
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("access_token", token);
  },

  //get user
  getUserData: () => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  //get token
  getToken: () => localStorage.getItem("access_token"),

  // isHauthentificated: () => {
  //   const token = localStorage.getItem('access_token');
  //   const userData = localStorage.getItem('user_data');
  //   return !!(token && userData);
  // },

  //recuperer le user et le token et returner true si les 2 existe
  hasAuthData: () => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    return !!(token && userData);
  },

  //  Vérifier la validité du token avec Laravel
  checkTokenValidity: async () => {
    const token = this.getToken();

    if (!token) {
      console.log(" Aucun token trouvé");
      return false;
    }

    try {
      console.log("Vérification du token avec Laravel...");

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
        console.log("Token valide");
        return true;
      } else {
        console.log("Token invalide");
        return false;
      }
    } catch (error) {
      console.log("Erreur vérification token:", error.response?.status);

      if (error.response?.status === 401) {
        console.log("Token expiré (401)");
      }

      return false;
    }
  },

  //FONCTION PRINCIPALE: Vérifier et rediriger si nécessaire
  verifyAndRedirect: async () => {
    console.log(" Début vérification authentification...");

    //  Vérifier si on a les données de base

    if (!this.hasAuthData()) {
      console.log("Pas de données d'authentification");
      this.redirectToLogin();
      return false;
    }

    // Vérifier si le token fonctionne avec Laravel
    const isTokenValid = await this.checkTokenValidity();

    if (!isTokenValid) {
      console.log("Token expiré, déconnexion...");
      this.logout();
      return false;
    }

    console.log("Authentification valide");
    return true;
  },

  // Redirection vers login
  redirectToLogin: () => {
    window.location.href = "/connexion";
  },

  // Déconnexion complète
  logout: () => {
    console.log(" Déconnexion...");
    localStorage.removeItem("user_data");
    localStorage.removeItem("access_token");
    localStorage.removeItem("login_time");

    // Afficher un message à l'utilisateur
    if (window.location.pathname !== "/connexion") {
      alert("Votre session a expiré. Reconnexion nécessaire.");
    }

    window.location.href = "/connexion";
  },

  // Redirection selon le département
  getRedirectPath: (user) => {
    switch (user.departement) {
      case "Informatique":
        return "/departement/informatique";
      case "Comptabilité":
        return "/departement/comptabilite";
      case "Ressources Humaines":
        return "/departement/rh";
      case "Administration":
        return "/codeAdmin";
      default:
        return "/";
    }
  },

  // CONFIGURER L'INTERCEPTOR
  setupAxiosInterceptor: () => {
    console.log("Configuration intercepteur sélectif...");

    // URLs publiques
    const publicUrls = [
      "/api/login",
      "/api/verif",
      "/api/users",
      "http://localhost:5000/users",
      "/api/approuver",
    ];

    const isPublicUrl = (url) => {
      return publicUrls.some((publicUrl) => url?.includes(publicUrl));
    };

    // Intercepteur requêtes
    axios.interceptors.request.use(
      (config) => {
        if (!isPublicUrl(config.url)) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur réponses
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        console.log("Erreur interceptée:", { status, url });

        if (
          status === 401 &&
          !isPublicUrl(url) &&
          window.location.pathname !== "/connexion"
        ) {
          console.log(" Token expiré - Déconnexion");
          this.logout();
        }

        return Promise.reject(error);
      }
    );
  },
};
