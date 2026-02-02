import "../styles/auth/AuthBase.css";
import "../styles/auth/AuthLayout.css";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPassword } from "../Services/authservice";
import { NotificationToast } from "../components/NotificationToast/NotificationToast";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const location = useLocation();
  const email = location.state?.email;
  const code = location.state?.code;

  const schema = yup.object().shape({
    password: yup.string()
    .required('رمز عبور را وارد کنید')
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .matches(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
    .matches(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد')
    .matches(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد')
    .matches(/[@$!%*?&#]/, 'رمز عبور باید حداقل یک کاراکتر خاص داشته باشد'),
    confirmPassword: yup.string()
    .required('تکرار رمز عبور را وارد کنید')
    .oneOf([yup.ref('password'), null], 'رمز عبور و تکرار آن یکسان نیست'),
  });

  const {register, handleSubmit, formState: { errors }} = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    const result = await resetPassword({
      email,
      code,
      newPassword: data.password,
    });

    setIsLoading(false);

    if (!result.success) {
      showNotification(result.message || "خطا در تغییر رمز عبور", "error");
      return;
    }

    showNotification("رمز عبور با موفقیت تغییر کرد", "success");
    navigate("/login");
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
      <div className="auth-main reset-password-main auth-context-ltr">
        <div className="auth-card reset-password-card">
          <h2 className="auth-title">بازیابی رمز عبور</h2>
          <p className="auth-subtitle">رمز عبور جدید خود را وارد کنید</p>
            <form onSubmit={handleSubmit(onSubmit)} >
              {/* New password */}
              <label className="field-label">
                  رمز عبور جدید
              </label>
              <div className="input-wrapper">
                <img className="input-icon" src="/src/assets/icons/lock.svg" alt="lock" />
                <input
                  type="password"
                  className="text-input"
                  placeholder="حداقل 8 کاراکتر"
                  {...register("password")}
                />
              </div>
              <p className="error">{errors.password?.message}</p>

              {/* Confirm password */}
              <label className="field-label">
                  تأیید رمز عبور
              </label>
              <div className="input-wrapper">
                <img className="input-icon" src="/src/assets/icons/lock.svg" alt="lock" />
                <input
                  type="password"
                  className="text-input"
                  placeholder="رمز عبور را دوباره وارد کنید"
                  {...register("confirmPassword")}
                />
              </div>
              <p className="error">{errors.confirmPassword?.message}</p>


              {/* Reset password button */}
              <button type="submit" className="form-btn" disabled={isLoading}>
              تغییر رمز عبور
            </button>
          </form>
          <p className="reset-password">
            <Link className="interactive-link" to="/login">
              بازگشت به ورود
            </Link>
          </p>
        </div>

        <div className="auth-img reset-password-img">
          <img src="/src/assets/images/catRP.svg" alt="cat" />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


