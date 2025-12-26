import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer/Footer";
import { useState } from "react";
import "../styles/MainLayout.css";

const MainLayout = () => {
  const [hideNavbar, setHideNavbar] = useState(false);
  const [hideFooter, setHideFooter] = useState(false);

  return (
    <div className="app-layout">
      {!hideNavbar && <Navbar />}

      <main className="main-content">
        <div className="page-container">
          <Outlet context={{ setHideNavbar, setHideFooter }} />
        </div>
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
