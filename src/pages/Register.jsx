import "../styles/register.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="register-page">
      <div className="register-container" dir="rtl">

        <h2 className="register-title">ثبت نام</h2>
        <p className="register-subtitle">حساب کاربری جدید بسازید</p>

        {/* Full name */}
        <label className="field-label">
            نام و نام خانوادگی*
        </label>
        <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/user.svg" alt="user" />
          <input
            className="text-input"
            placeholder="نام کامل خود را وارد کنید"
          />
        </div>

        {/* Username */}
        <label className="field-label">
            نام کاربری*
        </label>
        <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/profile-circle.svg" alt="profile-circle" />

          <input
            className="text-input"
            placeholder="نام کاربری خود را وارد کنید"
          />
        </div>

        {/* Phone */}
        <label className="field-label">
            شماره موبایل*
        </label>
        <div className="input-wrapper">
            <img className="input-icon" src="/src/icons/call.svg" alt="call" />

          <input
            className="text-input"
            placeholder="09123456789"
          />
        </div>

        {/* Email */}
        <label className="field-label">
            ایمیل*
        </label>
        <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/sms.svg" alt="sms" />
          <input
            className="text-input"
            placeholder="example@gmail.com"
          />
        </div>

        {/* Password */}
        <label className="field-label">
            رمز عبور*
        </label>
        <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/lock.svg" alt="lock" />
          <input
            type="password"
            className="text-input"
            placeholder="حداقل 8 کاراکتر"
          />
        </div>

        {/* Confirm password */}
        <label className="field-label">
            تأیید رمز عبور*
        </label>
        <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/lock.svg" alt="lock" />
          <input
            type="password"
            className="text-input"
            placeholder="رمز عبور را دوباره وارد کنید"
          />
        </div>

        {/* Register button */}
        <button className="register-btn">
          <span>ثبت نام</span>
          <img className="arrow" src="/src/icons/arrow-right.svg" alt="arrow-right" />
        </button>

        {/* divider */}
          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">یا</span>
            <span className="divider-line" />
          </div>

        {/* Google */}
        <button className="google-btn">
          <span>ثبت نام با حساب گوگل</span>
          <img src="/src/icons/chrome.svg" alt="chrome-icon" />
        </button>

        {/* Already have account */}
        <p className="register-footer">
           قبلاً ثبت نام کرده‌اید؟
          <button
            className="register-footer-link"
            onClick={() => navigate("/login")}
          >
            وارد شوید
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;