import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer/Footer";
import { useState } from "react";

const MainLayout = () => {
  const [hideNavbar, setHideNavbar] = useState(false);
  const [hideFooter, setHideFooter] = useState(false);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet context={{ setHideNavbar, setHideFooter }} />
      {!hideFooter && <Footer />}
    </>
  );
};

export default MainLayout;