import { getGreeting } from "../utils/greeting";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailjs from "@emailjs/browser";


// Configuration EmailJS
const SERVICE_ID = 'service_agd3g1c';
const TEMPLATE_TASK_ASSIGNMENT = 'template_task123'; // À remplacer par votre ID
const PUBLIC_KEY = 'xdfZm5dV41Ewzjb3R';

export const assignTask = async (
 email, nom, taskData, assignedBy, project 
) => {
  try {
    const params = {
      greeting: getGreeting(),
      name: nom,
      task_name: taskData.titre,
      task_description: taskData.description || 'Aucune description',
      project_name: project ? project.nom : '',
      has_project: project ? 'true' : 'false',
      priority: taskData.priorite,
      due_date: new Date(taskData.date_echeance).toLocaleDateString('fr-FR'),
      assigned_by: assignedBy,
      dashboard_url: `${window.location.origin}/employee-dashboard`,
      to_email: email
    };

    console.log("Tentative d'envoi email tâche vers:", email);
    
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_TASK_ASSIGNMENT,
      params,
      PUBLIC_KEY
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
    
  } catch (error) {
    console.error("Erreur envoi email tâche:", error);
    return false;
  }
};