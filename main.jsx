import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { authUtils } from "./utils/redirectionForm.jsx";

console.log("initialisation de l'application");
authUtils.setupAxiosInterceptor();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
