import { getGreeting } from "../utils/greeting";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import emailjs from "@emailjs/browser";


export const envoyerEmailIdentifiants = async (
  utilisateur,
  emailPro,
  motDePassePro
) => {
  try {
    const params = {
      greeting: getGreeting(),
      name: `${utilisateur.prenom} ${utilisateur.nom}`,
      email: utilisateur.email, 
      email_pro: emailPro,
      password_pro: motDePassePro,
      poste: utilisateur.poste,
      departement: utilisateur.departement,
    };

    console.log("📧 Envoi email identifiants:", params);

    // await emailjs.send(
    //   "service_agd3g1c",
    //   "template_approval",
    //   params,
    //   "xdfZm5dY4lEwzjD3B"
    // );

    console.log("✅ Email d'identifiants envoyé avec succès");
    toast.success("📧 Identifiants envoyés par email");
  } catch (error) {
    console.error("❌ Erreur envoi email identifiants:", error);
    toast.error("Erreur lors de l'envoi de l'email");
    throw error;
  }
};
