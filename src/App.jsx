import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import { UserProfilePage } from "./pages/UserProfilePage";
import { Route , Routes } from 'react-router-dom'

function App() {

  return (
    <>
    <Routes>
      <Route path='/user-profile' element={<UserProfilePage />} />
    </Routes>
    </>
  )
}

export default App
