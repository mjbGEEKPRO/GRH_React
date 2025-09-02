import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import * as yup from "yup";
import axios from "axios";
function Appli() {
  const [count, setCount] = useState(1);
  const [error, setError] = useState();
  const [send, setSend] = useState(false);

  const handleadd = async () => {
    if (count >= 1) {
      if (count == 1) {
        try {
          await validate1.validate(step1, { abortEarly: false });
          setCount(count + 1);
        } catch (error) {
          const newerror = {};
          error.inner.forEach((err) => {
            newerror[err.path] = err.message;
            setError(newerror);
          });
        }
      } else if (count == 2) {
        try {
          await validate2.validate(step2, { abortEarly: false });
          setSend(!send);
        } catch (error) {
          const newerror = {};
          error.inner.forEach((err) => {
            newerror[err.path] = err.message;
            setError(newerror);
            console.log("echoué");
          });
        }
      }
    }
  };

  const handledel = () => {
    if (count >= 2 && count < 3) {
      setCount(count - 1);
    }
  };

  const [step1, setStep1] = useState({
    nom: "",
    email: "",
    numero: "",
  });
  const [step2, setStep2] = useState({
    user: "",
    password: "",
    cpassword: "",
  });
  const [step3, setStep3] = useState({
    department: "",
    fil: "",
  });

  const handlechange1 = (e) => {
    const { name, value } = e.target;
    setStep1({
      ...step1,
      [name]: value,
    });
  };

  const handlechange2 = (e) => {
    const { name, value } = e.target;
    setStep2({
      ...step2,
      [name]: value,
    });
  };

  const handlechange3 = (e) => {
    const { name, value } = e.target;
    setStep3({
      ...step3,
      [name]: value,
    });
  };

  const validate1 = yup.object({
    nom: yup.string().required("Entrer le nom"),
    email: yup.string().email().required("Entrer le nom"),
    numero: yup
      .number()
      .positive()
      .integer()
      .typeError("Entrer un nombre valide"),
  });
  const validate2 = yup.object({
    user: yup.string().required("Entrer un nom d'utilsiateur"),
    password: yup.string().required("Veuilez entrer un mot de passe "),
    cpassword: yup
      .string()
      .required()
      .oneOf(
        [yup.ref("password"), null],
        "Password 1 est different de Password 2"
      ),
  });
  const validate3 = yup.object({
    department: yup.string().required(),
    fil: yup.string().required(),
  });

  const handlesubmit = async (e) => {
    e.preventDefault();
    try {
      const fusion = Object.assign({}, step1, step2);
      await axios.post("http://127.0.0.1:8000/api/users", fusion);
      toast.success("Utilisateur enregistré avec succès !!!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log("envoyer");
      console.log(fusion);
    } catch (errorvalidation) {
      console.log("dsqdqsd");
    }
  };

  console.log(send);

  return (
    <>
      <div class="bg-gray-100 min-h-screen flex items-center justify-center">
        <div class="container mx-auto p-4">
          <div class="bg-white rounded-lg shadow-lg p-6 md:p-10 max-w-3xl mx-auto">
            <h1 class="text-3xl font-bold text-center mb-8">Sign In</h1>

            <div class="mb-8">
              <div class="flex justify-between mb-2">
                <span
                  class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200"
                  id="step1"
                >
                  Information personnelle
                </span>
                <span
                  class={`text-xs  inline-block py-1 px-2 uppercase rounded-full ${
                    count == 2
                      ? "text-green-600 bg-green-200 "
                      : "bg-green-200  text-green-300  font-semibold "
                  }`}
                  id="step2"
                >
                  Informations supplementaire
                </span>
              </div>
              <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div
                  id="progress-bar"
                  class={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500 ease-in-out ${
                    count == 2 ? "w-full" : "w-1/3"
                  } `}
                ></div>
              </div>
            </div>

            <form id="multi-step-form" onSubmit={handlesubmit}>
              {count && count == 1 && (
                <div id="step-1" class="step">
                  <div class="mb-6">
                    <label
                      for="fullName"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                      name="nom"
                      onChange={handlechange1}
                      value={step1.nom}
                    />
                    {error && error.nom && (
                      <p className="text-red-500">{error.nom}</p>
                    )}
                  </div>
                  <div class="mb-6">
                    <label
                      for="email"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                      name="email"
                      onChange={handlechange1}
                      value={step1.email}
                    />
                    {error && error.email && (
                      <p className="text-red-500">{error.email}</p>
                    )}
                  </div>
                  <div class="mb-6">
                    <label
                      for="phone"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Numero de telephone
                    </label>
                    <input
                      type="number"
                      id="phone"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                      name="numero"
                      onChange={handlechange1}
                      value={step1.numero}
                    />
                    {error && error.numero && (
                      <p className="text-red-500">{error.numero}</p>
                    )}
                  </div>
                </div>
              )}

              {count && count == 2 && (
                <div id="step-2" class="step ">
                  <div class="mb-6">
                    <label
                      for="username"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Nom utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                      name="user"
                      onChange={handlechange2}
                      value={step2.user}
                    />
                    {error && error.user && (
                      <p className="text-red-500">{error.user}</p>
                    )}
                  </div>
                  <div class="mb-6">
                    <label
                      for="password"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="password"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                      name="password"
                      onChange={handlechange2}
                      value={step2.password}
                    />
                    {error && error.password && (
                      <p className="text-red-500">{error.password}</p>
                    )}
                  </div>
                  <div class="mb-6">
                    <label
                      for="confirmPassword"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                      name="cpassword"
                      onChange={handlechange2}
                      value={step2.cpassword}
                    />
                    {error && error.cpassword && (
                      <p className="text-red-500">{error.cpassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* {
          count && count==3 && <div id="step-3" class="step">
          <div class="mb-6">
            <label for="interests" class="block mb-2 text-sm font-medium text-gray-900">Filiere</label>
            <select id="interests" multiple class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" name='fil' onChange={handlechange3} value={step3.fil}>
                            <option value="Genie logiciel">Genie logiciel</option>
                            <option value="Système d'information">SI</option>
                        </select>
          </div>
          <div class="mb-6">
            <label for="interests" class="block mb-2 text-sm font-medium text-gray-900">Departement</label>
            <select id="interests" multiple class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" name='department' onChange={handlechange3} value={step3.department}>
                            <option value="ESTTI">ESSTI</option>
                            <option value="ESTTI">ESSTI</option>
                        </select>
          </div>
          <div class="flex items-center mb-6">
            <input id="newsletter" type="checkbox" class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"/>
            <label for="newsletter" class="ml-2 text-sm font-medium text-gray-900">Inscrire</label>
          </div>
        </div>
        } */}

              <div class="flex justify-between mt-8">
                <button
                  type="button"
                  id="prevBtn"
                  class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:shadow-outline "
                  onClick={handledel}
                >
                  Precedent
                </button>
                <button
                  type="button"
                  id="nextBtn"
                  class={`px-4 py-2 ${
                    send == true ? "bg-blue-600" : "bg-green-500"
                  } text-white rounded-lg hover:bg-green-600 focus:outline-none focus:shadow-outline ${
                    send == true ? "hidden" : "visible"
                  }`}
                  onClick={handleadd}
                >
                  Suivant
                </button>
                <button
                  type="submit"
                  id="submitBtn"
                  class={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline ${
                    send == true ? "visible" : "hidden"
                  } `}
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default Appli;
