import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NavbarPage } from "./pages/NavbarPage";
import "./styles/global.css";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <NavbarPage />
  </StrictMode>,
);