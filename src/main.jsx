import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";

import "./index.css";

const savedTheme = localStorage.getItem("store-theme") || "light";
document.documentElement.dataset.theme = savedTheme;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);