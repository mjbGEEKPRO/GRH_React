import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterForm from "./exoserdi/form";
import ForgetPassword from "./composant/interface/mot_de_passe_oubli";
import Formulaire from "./Authentification/formulaire";
import Connexion from "./Authentification/connexion";
import Informatiques from "./composant/departement/informatique";
import Rh from "./composant/departement/rh";
import Comptabilite from "./composant/departement/comptabilite";
import SerdiFormationCarousel from "./composant/departement/mjb";
import Code from "./Authentification/code";
import Admin from "./composant/interface/admin/admin";
import AdminCode from "./Authentification/codeAdmin";
import Dashboard from "./composant/interface/dashbordTest";
// import Appli from "./exoserdi/exercice";
import Permissions from "./composant/interface/permission";
import ProjectTaskManager from "./composant/interface/tacheProjet";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Formulaire />} />
        <Route path="/connexion" element={<Connexion />} /> 
        <Route path="/admin" element={<Admin />} /> 
        <Route path="/permission" element={<Permissions />} /> 
        <Route path="/dashbordTest" element={<Dashboard />} /> 
        <Route path="/form" element={<RegisterForm />} />
        <Route path="/code" element={<Code />} />
        <Route path="/tacheProjet" element={<ProjectTaskManager />} />
        <Route path="/codeAdmin" element={<AdminCode />} /> 
        <Route path="/mot_de_passe_oubli" element={<ForgetPassword />} />
        <Route path="/departement/comptabilite" element={<Comptabilite />} />
        <Route path="/departement/informatique" element={<Informatiques />} />
        <Route path="/departement/rh" element={<Rh />} />
        <Route path="/departement/mjb" element={<SerdiFormationCarousel />} />
      </Routes>
    </Router>
  );
}
export default App;
