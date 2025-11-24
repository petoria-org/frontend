import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UserProfilePage } from "./pages/UserProfilePage/UserProfilePage";
import "./styles/global.css";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <StrictMode>
    <UserProfilePage />
  </StrictMode>
);