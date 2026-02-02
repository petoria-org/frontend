import "../../styles/auth/AuthBase.css"
import "../../styles/auth/AuthLayout.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signup } from "../../Services/authservice";
import { useState } from "react";
import { NotificationToast } from "../../components/NotificationToast";

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const schema = yup.object().shape({
    firstName: yup.string()
      .required('نام را وارد کنید')
      .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
      .max(30, 'نام باید حداکثر ۳۰ کاراکتر باشد')
      .matches(/^[\u0600-\u06FF\s]+$/, 'نام باید فقط حروف فارسی باشد')
      .trim(),

    lastName: yup.string()
      .required('نام خانوادگی را وارد کنید')
      .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد')
      .max(30, 'نام خانوادگی باید حداکثر ۳۰ کاراکتر باشد')
      .matches(/^[\u0600-\u06FF\s]+$/, 'نام خانوادگی باید فقط حروف فارسی باشد')
      .trim(),
    
    username: yup.string()
      .required('نام کاربری را وارد کنید')
      .min(2, 'نام کاربری باید حداقل ۲ کاراکتر باشد')
      .max(50, 'نام کاربری باید حداکثر ۵۰ کاراکتر باشد')
      .matches(/^[a-zA-Z0-9._]+$/, 'نام کاربری فقط باید شامل حروف انگلیسی، اعداد، نقطه و _ باشد')
      .trim(),

    email: yup.string()
      .required('ایمیل را وارد کنید')
      .email('ایمیل وارد شده معتبر نیست')
      .trim(),

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

    const {register, handleSubmit, formState: {errors}} = useForm({
      resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword
    };

    const result = await signup(payload);

    setLoading(false);

    if (!result.success) {
      showNotification(result.message || "خطا در ثبت نام", "error");
      return;
    }

    showNotification("کد تایید به ایمیل شما ارسال شد", "success");
    navigate("/verify", {
      state: {
        email: data.email,
        purpose: "email",
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
      <div className="auth-main register-main">
        <div className="auth-card register-card">
          <h2 className="auth-title">ثبت نام</h2>
          <p className="auth-subtitle">حساب کاربری جدید بسازید</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First name */}
            <label className="field-label">
                نام*
            </label>
            <div className="input-wrapper">
              <img className="input-icon input-icon-user" src="/src/assets/icons/user.svg" alt="user" />
              <input
                type="text"
                className="text-input"
                placeholder="نام خود را وارد کنید"
                {...register("firstName")}
              />
            </div>
            <p className="error">{errors.firstName?.message}</p>

            {/* Last name */}
            <label className="field-label">
                نام خانوادگی*
            </label>
            <div className="input-wrapper">
              <img className="input-icon input-icon-user" src="/src/assets/icons/user.svg" alt="user" />
              <input
                type="text"
                className="text-input"
                placeholder="نام خانوادگی خود را وارد کنید"
                {...register("lastName")}
              />
            </div>
            <p className="error">{errors.lastName?.message}</p>
            
            {/* Username */}
            <label className="field-label">
                نام کاربری*
            </label>
            <div className="input-wrapper">
              <img className="input-icon" src="/src/assets/icons/profile-circle.svg" alt="profile-circle" />
              <input
                type="text"
                className="text-input"
                placeholder="نام کاربری خود را وارد کنید"
                {...register("username")}
              />
            </div>
            <p className="error">{errors.username?.message}</p>

            {/* Email */}
            <label className="field-label">
                ایمیل*
            </label>
            <div className="input-wrapper">
              <img className="input-icon" src="/src/assets/icons/sms.svg" alt="sms" />
              <input
                className="text-input"
                placeholder="example@gmail.com"
                {...register("email")}
              />
            </div>
            <p className="error">{errors.email?.message}</p>

            {/* Password */}
            <label className="field-label">
                رمز عبور*
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
                تأیید رمز عبور*
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

            {/* Register button */}
            <button className="form-btn" disabled={loading}>
              <span>{loading ? "در حال ارسال..." : "ثبت نام"}</span>
              <img className="arrow" src="/src/assets/icons/arrow-right.svg" alt="arrow-right" />
            </button>
          </form>

          {/* divider */}
            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">یا</span>
              <span className="divider-line" />
            </div>

          {/* Google */}
          <button className="google-btn">
            <span>ثبت نام با حساب گوگل</span>
            <img src="/src/assets/icons/chrome.svg" alt="chrome-icon" />
          </button>

          {/* Already have account */}
          <p className="auth-footer">
            قبلاً ثبت نام کرده‌اید؟{" "}
            <Link className="interactive-link" to={"/login"}>وارد شوید</Link>
          </p>
        </div>
        <div className="auth-img register-img">
          <img src="/src/assets/images/cat.svg" alt="cat" />
        </div>
      </div>
    </div>
  );
};

export default Register;


