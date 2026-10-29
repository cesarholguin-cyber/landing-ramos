import React from "react";
import { hydrateRoot } from "react-dom/client";
import "./styles.css";
import "./identity.css";
import "./cinema.css";
import "./video.css";
import "./credentials.css";
import "./locations.css";
import "./whatsapp.css";
import { App } from "./App.jsx";

document.documentElement.classList.add('js-enabled');
hydrateRoot(document.getElementById("root"),
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
