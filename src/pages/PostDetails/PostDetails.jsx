import { useLocation } from "react-router-dom";
import { ShowDetailsAdopt } from "../../components/ShowDetailsAdopt";
import "../../styles/PostDetails.css";

export const PostDetails = () => {
  const location = useLocation();
  const { postId, postType, postData } = location.state || {};
  
  console.log("داده‌های دریافتی:", { postId, postType, postData });
  
  return (
    <div className="post-details-page">
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