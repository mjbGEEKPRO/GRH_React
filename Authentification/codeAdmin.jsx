import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminCode() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const Password = "Admin1!";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (password === Password) {
        navigate("/admin");
      } else {
        setError("Mot de passe incorrect");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900  flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-semibold text-gray-800 text-center mb-6">
            Espace Administrateur
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Renseigner votre mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleLogin(e);
                  }
                }}
              />
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !password.trim()}
              className={`w-full py-2 px-4 rounded text-white ${
                loading || !password.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCode;
