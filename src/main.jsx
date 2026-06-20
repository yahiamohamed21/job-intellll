// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

// Import i18n setup
import "./lib/i18n.js";

// مهم: استورد الـAuthProvider
import { AuthProvider } from "./context/AuthContext.jsx";
import { PictureProvider } from "./context/PictureContext.jsx";

// لو عندك ThemeProvider
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import "./styles/globals.css";
import "./theme/theme.css";
import "./styles/SciFiScanner.css";
import "./styles/FullScreenLoader.css";
// LoaderProvider
import { LoaderProvider } from "./loader/LoaderProvider.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';

// TODO: Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "1094518034372-ka3p6p1dc6ur5d9os4pula12d2u9e7jl.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <PictureProvider>
          <NotificationProvider>
            <LoaderProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </LoaderProvider>
          </NotificationProvider>
        </PictureProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
