import "../styles/auth/AuthBase.css"
import "../styles/auth/AuthLayout.css";
import "../styles/auth/Verify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyOtp, requestOtp } from "../Services/authservice";
import { NotificationToast } from "../components/NotificationToast/NotificationToast";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  const email = location.state?.email;
  const purpose = location.state?.purpose;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle input change
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };


  // Resend code
  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(60);

    const result = await requestOtp(email);

    if (!result.success) {
      showNotification(result.message || "ارسال مجدد کد ناموفق بود", "error");
      return;
    }

    showNotification("کد تأیید جدید ارسال شد", "success");
  };


  const handleSubmit = async () => {
    const finalCode = code.join("");

    if (finalCode.length !== 6) {
      showNotification("لطفاً کد ۶ رقمی را کامل وارد کنید", "warning");
      return;
    }

    setLoading(true);

    const result = await verifyOtp({
      email,
      otp: finalCode,
      purpose,
    });

    setLoading(false);

    if (!result.success) {
      showNotification(result.message || "کد وارد شده معتبر نیست", "error");
      return;
    }

    if (purpose === "reset") {
      navigate("/reset-password", {
        state: {
          email,
          code: finalCode,
        },
      });
    } else {
      showNotification("حساب کاربری شما با موفقیت فعال شد", "success");
      navigate("/login");
    }
  };

  return (
    <div className="auth-page">
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          position="top-right"
        />
      )}
      <div className="auth-main verify-main auth-context-ltr">
        <div className="auth-card verify-card">
          <div className="verify-icon">
            <img src="/src/assets/icons/verify.svg" alt="verify" />
          </div>

          <p className="auth-subtitle">کد تأیید ارسال شده را وارد کنید</p>

          {email && (
            <p className="verify-email-text">
              یک کد ۶ رقمی به ایمیل <span>{email}</span> ارسال شد.
            </p>
          )}

          {/* OTP Inputs */}
          <div className="verify-code-box">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                className="verify-code-input"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
              />
            ))}
          </div>

          {/* Timer */}
          <p className="verify-timer">
            زمان باقی‌مانده:{" "}
            <span>
              {`${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`}
            </span>
          </p>

          {/* Resend link */}
          <div
            className={`verify-resend-link ${canResend ? "active" : ""}`}
            onClick={canResend ? handleResend : null}
          >
            <img src="/src/assets/icons/resend.svg" alt="resend" />
            <span>ارسال مجدد کد</span>
          </div>

          {/* Continue */}
          <button
            className="form-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            <span>{loading ? "در حال بررسی..." : "تأیید و ادامه"}</span>
            <img className="arrow" src="/src/assets/icons/arrow-right.svg" alt="arrow-right" />
          </button>
        </div>

        <div className="auth-img verify-img">
          <img src="/src/assets/images/catV.svg" alt="cat" />
        </div>
      </div>
    </div>
  );
};

export default Verify;


