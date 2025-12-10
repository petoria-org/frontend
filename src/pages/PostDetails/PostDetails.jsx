import React from "react";
import { useLocation } from "react-router-dom";
import { Navbar_SignIn } from "../../components/Navbar_SignIn";
import { ShowDetailsAdopt } from "../../components/ShowDetailsAdopt";
import "../../styles/PostDetails.css";

export const PostDetails = () => {
  const location = useLocation();
  const { postId, postType, postData } = location.state || {};
  
  console.log("داده‌های دریافتی:", { postId, postType, postData });
  
  return (
    <div className="post-details-page">
      <div className="navbar-container">
        <Navbar_SignIn />
      </div>
      <div className="page-content">
        <ShowDetailsAdopt 
          postId={postId}
          postType={postType}
          postData={postData}
        />
      </div>
    </div>
  );
};