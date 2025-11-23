import "../styles/forgotPassword.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container" dir="rtl">

        <h2 className="forgot-password-title">بازیابی رمز عبور</h2>
        <p className="forgot-password-subtitle">ایمیل خود را وارد کنید</p>

        {/* Email */}
        <label className="field-label">
            ایمیل
        </label>
        <div className="input-wrapper">
          <img className="input-icon" src="/src/icons/sms.svg" alt="sms" />
          <input
            className="text-input"
            placeholder="example@gmail.com"
          />
        </div>

        {/* Verify button */}
        <button 
        className="verify-btn"
        onClick={() => navigate("/reset-password")}>
          <span>ارسال کد تأیید</span>
        </button>

        <div className="forgot-password">
            <button
            className="forgot-password-link"
            onClick={() => navigate("/login")}
          >
            بازگشت به ورود
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword