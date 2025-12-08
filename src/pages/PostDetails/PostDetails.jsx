import React from "react";
import { Navbar_SignIn } from "../../components/Navbar_SignIn";
import { ShowDetailsAdopt } from "../../components/ShowDetailsAdopt";
import "../../styles/PostDetails.css";

export const PostDetails = () => {
  return (
    <div className="post-details-page">
      <div className="navbar-container">
        <Navbar_SignIn />
      </div>
      <div className="page-content">
        <ShowDetailsAdopt />
      </div>
    </div>
  );
};