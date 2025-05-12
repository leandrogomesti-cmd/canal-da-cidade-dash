// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css"; // Importação atualizada para o novo caminho
import AppRoutes from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
)