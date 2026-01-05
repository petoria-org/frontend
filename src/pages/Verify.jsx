import "../styles/auth/AuthBase.css"
import "../styles/auth/AuthLayout.css";
import "../styles/auth/Verify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyOtp, requestOtp } from "../Services/authservice";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const purpose = location.state?.purpose;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(15);
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
    setTimer(15);

    const result = await requestOtp(email);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert("کد تأیید جدید ارسال شد");
  };


  const handleSubmit = async () => {
    const finalCode = code.join("");

    if (finalCode.length !== 6) {
      alert("لطفاً کد ۶ رقمی را کامل وارد کنید");
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
      alert(result.message);
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
      alert("حساب کاربری شما با موفقیت فعال شد");
      navigate("/login");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-main verify-main auth-context-ltr">
        <div className="auth-card verify-card">
          <div className="verify-icon">
            <img src="/src/icons/verify.svg" alt="verify" />
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
            <span>00:{timer < 10 ? `0${timer}` : timer}</span>
          </p>

          {/* Resend link */}
          <div
            className={`verify-resend-link ${canResend ? "active" : ""}`}
            onClick={canResend ? handleResend : null}
          >
            <img src="/src/icons/resend.svg" alt="resend" />
            <span>ارسال مجدد کد</span>
          </div>

          {/* Continue */}
          <button
            className="form-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            <span>{loading ? "در حال بررسی..." : "تأیید و ادامه"}</span>
            <img className="arrow" src="/src/icons/arrow-right.svg" alt="arrow-right" />
          </button>
        </div>

        <div className="auth-img verify-img">
          <img src="/src/images/catV.svg" alt="cat" />
        </div>
      </div>
    </div>
  );
};

export default Verify;