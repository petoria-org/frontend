import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";
import "../styles/ChatLayout.css";

const MainLayout = () => {
  const [hideNavbar, setHideNavbar] = useState(false);

  return (
    <div className="app-layout-chat">
      {!hideNavbar && <Navbar />}

      <main className="main-content-chat">
        <div className="page-container-chat">
          <Outlet context={{ setHideNavbar }} />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
