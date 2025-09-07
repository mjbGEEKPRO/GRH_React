// import emailjs from "@emailjs/browser";
// import { getGreeting } from "../utils/greeting";





// Fonction d'envoi d'email 
export const sendEmailWithCode = async (email, nom, code) => {
  try {
    // Remplacez cette simulation par votre vraie logique emailjs
    console.log(`Email envoyé à ${email} avec le code ${code}`);
    // const params = {
    //     greeting: getGreeting(),
    //     name: nom,
    //     passcode: code,
    //     email: email,
    //   };

    console.log("📧 Tentative d'envoi email vers:", email);

    //     await emailjs.send(
    //       "service_agd3g1c",
    //       "template_l6fe2s5",
    //       params,
    //       "xdfZm5dY4lEwzjD3B"
    //     );
    // Simulation d'un délai d'envoi
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return false;
  }
};