import "../styles/Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleNewAd = () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: { from: "/pick-location" },
      });
    } else {
      navigate("/pick-location");
    }
  };

  return (
    <div className="navbar">
      {/* ================= BEFORE LOGIN ================= */}
      {!isLoggedIn && (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <div className="nav-text">ورود</div>
          <img className="nav-icon" src="/src/icons/login.svg" alt="login" />
        </NavLink>
      )}

      
      {/* ================= NEW AD ================= */}
      <div className="new-ad-button" onClick={handleNewAd}>
        <div className="new-ad-text">آگهی جدید</div>
        <img
          className="add-icon"
          src="/src/assets/icons/add.svg"
          alt="add"
        />
      </div>

      {/* ================= AFTER LOGIN ================= */}
      {isLoggedIn && (
        <>
          <NavLink
            to="/user-profile"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <div className="nav-text">پروفایل</div>
            <img
              className="nav-icon"
              src="/src/assets/icons/user.svg"
              alt="profile"
            />
          </NavLink>

          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <div className="nav-text">گفتگوها</div>
            <img
              className="nav-icon"
              src="/src/assets/icons/message.svg"
              alt="chat"
            />
          </NavLink>
        </>
      )}

      {/* ================= SHARED ================= */}
      <NavLink
        to="/posts"
        className={({ isActive }) =>
          `nav-item ${isActive ? "active" : ""}`
        }
      >
        <div className="nav-text">آگهی ها</div>
        <img
          className="advertisements-icon"
          src="/src/assets/icons/Advertisements.svg"
          alt="posts"
        />
      </NavLink>

      <NavLink
        to="/success-stories"
        className={({ isActive }) =>
          `nav-item ${isActive ? "active" : ""}`
        }
      >
        <div className="nav-text">داستان های موفق</div>
        <img
          className="heart-icon"
          src="/src/assets/icons/heart.svg"
          alt="success"
        />
      </NavLink>

      <NavLink
        to="/"
        className={({ isActive }) =>
          `nav-item ${isActive ? "active" : ""}`
        }
      >
        <div className="nav-text">خانه</div>
        <img
          className="home-icon"
          src="/src/assets/icons/house.svg"
          alt="home"
        />
      </NavLink>

      {/* Logo */}
      <img className="logo" src="/src/assets/images/logo.jpg" alt="logo" />
    </div>
  );
};

export default Navbar;
