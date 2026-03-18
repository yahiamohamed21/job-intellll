// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

// مهم: استورد الـAuthProvider
import { AuthProvider } from "./context/AuthContext.jsx";

// لو عندك ThemeProvider
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import "./styles/globals.css";
import "./theme/theme.css";
// LoaderProvider
import { LoaderProvider } from "./loader/LoaderProvider.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';

// TODO: Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <LoaderProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LoaderProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
