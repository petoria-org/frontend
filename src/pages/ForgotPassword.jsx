import "../styles/auth/AuthBase.css"
import "../styles/auth/AuthLayout.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { requestOtp } from "../Services/authservice";
import { NotificationToast } from "../components/NotificationToast/NotificationToast";


const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const schema = yup.object().shape({
    email: yup
      .string()
      .required("ایمیل را وارد کنید")
      .email("ایمیل وارد شده معتبر نیست")
      .trim(),
  });

  const {register, handleSubmit, formState: { errors }} = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    const result = await requestOtp(data.email);

    setIsLoading(false);

    if (!result.success) {
      showNotification(result.message || "ارسال کد تأیید ناموفق بود", "error");
      return;
    }

    showNotification("کد تأیید ارسال شد", "success");
    navigate("/verify", {
      state: {
        email: data.email,
        purpose: "reset",
      },
    });
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
      <div className="auth-main forgot-password-main auth-context-ltr">
        <div className="auth-card forgot-password-card">
          <h2 className="auth-title">بازیابی رمز عبور</h2>
          <p className="auth-subtitle">ایمیل خود را وارد کنید</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="field-label">ایمیل</label>
            <div className="input-wrapper">
              <img className="input-icon" src="/src/icons/sms.svg" alt="sms" />
              <input
                className="text-input"
                placeholder="example@gmail.com"
                {...register("email")}
              />
            </div>
            <p className="error">{errors.email?.message}</p>

            <button type="submit" className="form-btn" disabled={isLoading}>
              {isLoading ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
          </form>

          <p className="forgot-password">
            <Link className="interactive-link" to="/login">
              بازگشت به ورود
            </Link>
          </p>
        </div>
        <div className="auth-img forgot-password-img">
          <img src="/src/images/dogFP.svg" alt="dog" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
