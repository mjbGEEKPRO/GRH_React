import emailjs from '@emailjs/browser';
import { getGreeting } from '../utils/greeting';

// Configuration EmailJS
const SERVICE_ID = 'service_agd3g1c';
const TEMPLATE_PASSWORD_CHANGE = 'template_16fe255';
const TEMPLATE_TASK_ASSIGNMENT = 'template_task123'; // À remplacer par votre ID
const PUBLIC_KEY = 'xdfZm5dV41Ewzjb3R';

export const resetPass = async (email, nom, newPassword ) => {
  try {
    const params = {
      greeting: getGreeting(),
      name: nom,
      password: newPassword ,
      professional_email: email,
      email: email
    };

    console.log("Tentative d'envoi email vers:", email);
    
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_PASSWORD_CHANGE,
      params,
      PUBLIC_KEY
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
    
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return false;
  }
};