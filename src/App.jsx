import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PostDetails } from "./pages/PostDetails";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <PostDetails />
  </StrictMode>,
);