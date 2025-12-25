import "../styles/ResetPassword.css";
import "../styles/AuthCommon.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPassword } from "../Services/authservice";
import { useLocation } from "react-router-dom";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      alert(result.message);
      return;
    }

    alert("رمز عبور با موفقیت تغییر کرد");
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="reset-password-main">
        <h2 className="auth-title">بازیابی رمز عبور</h2>
        <p className="auth-subtitle">رمز عبور جدید خود را وارد کنید</p>
          <form onSubmit={handleSubmit(onSubmit)} >
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
                {...register("password")}
              />
            </div>
            <p className="error">{errors.password?.message}</p>

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
                {...register("confirmPassword")}
              />
            </div>
            <p className="error">{errors.confirmPassword?.message}</p>


            {/* Reset password button */}
            <button type="submit" className="reset-password-btn" disabled={isLoading}>
            تغییر رمز عبور
          </button>
        </form>
        <p className="reset-password">
          <Link className="reset-password-link" to="/login">
            بازگشت به ورود
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
