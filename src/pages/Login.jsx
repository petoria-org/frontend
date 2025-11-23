import "../styles/login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate()
  return (
    <div className="login-page">

      <main className="login-main">
        <div className="login-card" dir="rtl">
          <h2 className="login-title">ورود به حساب کاربری</h2>
          <p className="login-subtitle">به Petoria خوش آمدید</p>

          {/* username */}
          <label className="field-label">
            نام کاربری*
          </label>
          <div className="input-wrapper">
            <img className="input-icon" src="/src/icons/profile-circle.svg" alt="profile-circle" />
            <input
              type="text"
              className="text-input"
              placeholder="نام کاربری خود را وارد کنید"
            />
          </div>

          {/* password */}
          <label className="field-label">رمز عبور</label>
          <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/lock.svg" alt="lock" />
            <input
              type="password"
              className="text-input"
              placeholder="رمز عبور خود را وارد کنید"
            />
          </div>

          {/* forgot password -> go to forgot page */}
          <button
            className="forgot-pass"
            onClick={() => navigate("/forgot-password")}
          >
            رمز عبور خود را فراموش کرده‌اید؟
          </button>

          {/* login button */}
          <button className="login-btn">
            <span>ورود</span>
            <img className="arrow" src="/src/icons/arrow-right.svg" alt="arrow-right" />
          </button>

          {/* divider */}
          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">یا</span>
            <span className="divider-line" />
          </div>

          {/* Google login */}
          <button className="google-btn">
            <span>ورود با حساب گوگل</span>
           <img src="/src/icons/chrome.svg" alt="chrome-icon" />
          </button>

          {/* sign up -> go to register page */}
          <p className="signup-text">
            حساب کاربری ندارید؟{" "}
            <button
              className="signup-link"
              onClick={() => navigate("/register")}
            >
              ثبت نام کنید
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;