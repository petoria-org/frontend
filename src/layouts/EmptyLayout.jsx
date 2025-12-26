import { Outlet } from "react-router-dom";
import "../styles/EmptyLayout.css";

const EmptyLayout = () => {
  return (
    <div className="empty-layout">
      <Outlet />
    </div>
  );
};

export default EmptyLayout;