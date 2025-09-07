import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

function Select({ value, onChange, error }) {
  const [options, setOptions] = useState([]);

  const charger = async () => {
    try {
      const res = await axios.get("http://localhost/api/postes");
      console.log("donner recupérer ", res.data);
      setOptions(res.data.postes);
      console.log("contenue du state ");
    } catch (res) {
      console.log("Erreur reponse du serveur ", res?.data?.message);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const SelectChange = (e) => {
    const selecteValue = e.target.value;
    onChange(selecteValue);
  };

  return (
    <div className="space-y-3">
      <select
        value={value}
        onChange={SelectChange}
        className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
          error ? "border-red-400 bg-red-500/10" : "hover:bg-white/15"
        }`}
      >
        <option value="" className="bg-gray-800 text-white">
          Sélectionner votre poste
        </option>
        {options.map((poste) => (
          <option
            key={poste.id}
            value={poste.nom}
            className="bg-gray-800 text-white"
          >
            {poste.nom}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-red-300 text-sm mt-2 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;
