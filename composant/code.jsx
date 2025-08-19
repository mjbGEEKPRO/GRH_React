import React, { useEffect } from "react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import axios from "axios";

function Code() {
  const location = useLocation();
  const email = location.state?.email;
  const userForAdmin = location.state?.userForAdmin; 

  const [code, setCode] = useState("");
  const [compteur, setCompteur] = useState(60);
  const [estvalide, setEstvalide] = useState(true);
  const [sendCode, setSendCode] = useState("");
  const generateCode = () => {
    const codeGenerer = Math.floor(100000 + Math.random() * 900000).toString();
    setSendCode(codeGenerer);
    setEstvalide(true);
  };

  const Verifycode = async () => {
    try {
      if (estvalide && code === sendCode) {
        // requête pour stocker dans la table de reserve
        console.log("connexion api reserve");
        const res = await axios.post(
          "http://127.0.0.1:8000/api/users",
          userForAdmin
        );
        console.log("reponse reserve", res.data);
        const userForJson = res.data.user;
        if (res.data.success) {
          window.location.href = "/connexion";
          console.log("envoie à json ", userForJson);
          await axios.post("http://localhost:5000/users", userForJson);
        }
      } else {
        const erreur = "code incorrecte";
        toast.error(`❌ ${erreur}`);
      }
    } catch (Erreur) {
      console.log("Errer ", Erreur);
    }
  };

  useEffect(() => {
    generateCode();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("code envoyer", sendCode);
      if (compteur > 0) {
        setCompteur(compteur - 1);
      } else {
        setEstvalide(false);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [compteur]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Nous avons envoyé un code à cette adresse email {""}
          <span className="font-medium text-blue-600">{email}</span>
        </p>
        <span className="text-xl font-semibold text-gray-800 mb-2">
          Demander un nouveau code dans : {compteur} seconde
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code de validation
          </label>
          <input
            type="number"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
            placeholder="000000"
            maxLength="6"
          />
        </div>

        <button
          type="button"
          onClick={Verifycode}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          Confirmer
        </button>

        <button
          type="button"
          onClick={() => {
            generateCode();
            setCompteur(60);
            setEstvalide(true);
            toast(`Nouveau code envoyer vérifier vos mail`, {
              type: "success",
            });
          }}
          disabled={estvalide}
          className="w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
        >
          Renvoyer le code
        </button>
      </div>

      <ToastContainer
        position="center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default Code;
