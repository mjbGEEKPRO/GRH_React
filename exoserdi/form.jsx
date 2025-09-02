import React, { useReducer, useCallback, useMemo, useState } from "react";
import axios from "axios";



const initialState = {
  name: "",
  email: "",
  password: "",
};


function reducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, [action.champ]: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function RegisterForm() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = useCallback((e) => {
    dispatch({ type: "UPDATE", champ: e.target.name, value: e.target.value });
  }, []);

  const isEmailValid = useMemo(() => {
    return /^[a-z][a-z0-9._-]*@gmail.com$/.test(state.email);
  }, [state.email]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isEmailValid) {
        setMessage("Email invalide !");
        return;
      }
      if (!state.name || !state.password) {
        setMessage("Tous les champs doivent être remplis !");
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const response = await axios.post("http://votre-laravel-api.test/api/exercice", state)

        if (!response !==200) {
          const errorData = response.data;
          setMessage(errorData.message);
        } else {
          setMessage("Inscription réussie !");
          dispatch({ type: "RESET" });
        }
      } catch {
        setMessage("serveur");
      } finally {
        setLoading(false);
      }
    },
    [state, isEmailValid]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center">Inscription</h2>

      <div className="mb-4">
        <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={state.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Votre nom"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={state.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            !isEmailValid && state.email.length > 0
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="exemple@mail.com"
        />
        {!isEmailValid && state.email.length > 0 && (
          <p className="text-red-600 mt-1 text-sm">Email invalide</p>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="password"
          className="block mb-1 font-medium text-gray-700"
        >
          Mot de passe
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Votre mot de passe"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 text-white rounded-md font-semibold transition-colors ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Envoi..." : "S'inscrire"}
      </button>

      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message.includes("succès") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}