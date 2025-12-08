import "../styles/Verify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(5);
  const [canResend, setCanResend] = useState(false);

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

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  // Resend code
  const handleResend = () => {
    setTimer(5);
    setCanResend(false);

    console.log("Resend code to:", email);
  };

  const handleSubmit = () => {
    const finalCode = code.join("");
    console.log("User entered code:", finalCode);

    navigate("/reset-password");
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-main">

          <div className="verify-icon">
            <img src="/src/icons/verify.svg" alt="verify" />
          </div>

          <p className="verify-subtitle">کد تأیید ارسال شده را وارد کنید</p>

          {email && (
            <p className="verify-email-text">
              یک کد ۶ رقمی به ایمیل <span>{email}</span> ارسال شد
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
          <button className="verify-submit-btn" onClick={handleSubmit}>
            <span>تأیید و ادامه</span>
            <img className="arrow" src="/src/icons/arrow-right.svg" alt="arrow-right" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default Verify;