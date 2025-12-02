import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FooterPage } from "./pages/FooterPage";
import "./styles/global.css";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <FooterPage />
  </StrictMode>,
);