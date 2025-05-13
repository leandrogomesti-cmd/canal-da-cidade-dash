// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css"; // Importação atualizada para o novo caminho
import AppRoutes from "./App";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLightbulb, faShieldVirus, faBook, faTools, faLeaf, faHeartbeat, faShieldAlt, faBus, faWater, faHandsHelping, faCircle } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faLightbulb, faShieldVirus, faBook, faTools, faLeaf, faHeartbeat, faShieldAlt, faBus, faWater, faHandsHelping, faCircle);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
)