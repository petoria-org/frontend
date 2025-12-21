import React from 'react';
import SuccessStoriesAll from '../../components/SuccessStoriesAll';
import '../../styles/SuccessStoriesAll.css';
import { Footer } from "../../components/Footer";
import { Navbar_SignIn } from "../../components/Navbar_SignIn";

const SuccessStoriesAllPage = () => {
  return (
    <div className="success-stories-page">
      <Navbar_SignIn />
      <div className="success-stories-content">
        <SuccessStoriesAll />
      </div>
      <Footer />
    </div>
  );
};

export default SuccessStoriesAllPage;