import "../styles/resetPassword.css";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="reset-password-page">
      <div className="reset-password-container" dir="rtl">

        <h2 className="reset-password-title">بازیابی رمز عبور</h2>
        <p className="reset-password-subtitle">رمز عبور جدید خود را وارد کنید</p>

        {/* New password */}
        <label className="field-label">
            رمز عبور جدید
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
            تأیید رمز عبور
        </label>
        <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/lock.svg" alt="lock" />
          <input
            type="password"
            className="text-input"
            placeholder="رمز عبور را دوباره وارد کنید"
          />
        </div>

        {/* Reset password button */}
        <button className="reset-password-btn">
          <span>تغییر رمز عبور</span>
        </button>

        <div className="reset-password">
            <button
            className="reset-password-link"
            onClick={() => navigate("/login")}
          >
            بازگشت به ورود
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword