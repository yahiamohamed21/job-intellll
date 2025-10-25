// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

// مهم: استورد الـAuthProvider
import { AuthProvider } from "./auth/AuthProvider.jsx";

// لو عندك ThemeProvider
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import "./styles/globals.css";
import "./theme/theme.css";
// LoaderProvider
import { LoaderProvider } from "./loader/LoaderProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>                
      <LoaderProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
        </LoaderProvider>
    </AuthProvider>
  </BrowserRouter>
);
