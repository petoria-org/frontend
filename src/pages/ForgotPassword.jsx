import "../styles/forgotPassword.css";
import "../styles/AuthCommon.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { requestOtp } from "../Services/authservice";


const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      alert(result.message);
      return;
    }

    navigate("/verify", {
      state: {
        email: data.email,
        purpose: "reset",
      },
    });
  };

  return (
    <div className="auth-page forgot-password-page">
      {/* <div className="paw pawA p1"></div>
      <div className="paw pawA p2"></div>
      <div className="paw pawA p3"></div>
      <div className="paw pawA p4"></div>
      <div className="paw pawA p5"></div>

      <div className="paw pawB p6"></div>
      <div className="paw pawB p7"></div>
      <div className="paw pawB p8"></div>
      <div className="paw pawB p9"></div>
      <div className="paw pawB p10"></div> */}

      <div className="forgot-password-main">
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

          <button type="submit" className="verify-btn" disabled={isLoading}>
            {isLoading ? "در حال ارسال..." : "ارسال کد تأیید"}
          </button>
        </form>

        <p className="forgot-password">
          <Link className="forgot-password-link" to="/login">
            بازگشت به ورود
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
