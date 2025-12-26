import "../styles/login.css";
import "../styles/AuthCommon.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { login as loginRequest } from "../Services/authservice";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const from = location.state?.from || "/";

  const schema = yup.object().shape({
    identifier: yup.string().required("ایمیل یا نام کاربری الزامی است"),
    password: yup.string().required("رمز عبور الزامی است"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const response = await loginRequest(data);

    if (response.success) {
      login({
        access: response.data.access,
        refresh: response.data.refresh,
      });

      navigate(from, { replace: true });
    } else {
      alert(response.message || "ورود ناموفق بود");
    }
  };

  return (
    <div className="auth-page">
      <div className="login-main">
        <div className="login-card">
          <h2 className="auth-title">ورود به حساب کاربری</h2>
          <p className="auth-subtitle">به Petoria خوش آمدید</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="field-label">ایمیل یا نام کاربری*</label>
            <div className="input-wrapper">
              <img
                className="input-icon"
                src="/src/icons/profile-circle.svg"
                alt="profile"
              />
              <input
                type="text"
                className="text-input"
                placeholder="ایمیل یا نام کاربری خود را وارد کنید"
                {...register("identifier")}
              />
            </div>
            <p className="error">{errors.identifier?.message}</p>

            <label className="field-label">رمز عبور*</label>
            <div className="input-wrapper">
              <img
                className="input-icon"
                src="/src/icons/lock.svg"
                alt="lock"
              />
              <input
                type="password"
                className="text-input"
                placeholder="رمز عبور خود را وارد کنید"
                {...register("password")}
              />
            </div>
            <p className="error">{errors.password?.message}</p>

            <Link className="forgot-pass" to="/forgot-password">
              رمز عبور خود را فراموش کرده‌اید؟
            </Link>

            <button
              className="login-btn"
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "در حال ورود..." : "ورود"}</span>
              {!isSubmitting && (
                <img
                  className="arrow"
                  src="/src/icons/arrow-right.svg"
                  alt="arrow"
                />
              )}
            </button>
          </form>

          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">یا</span>
            <span className="divider-line" />
          </div>

          <button className="google-btn">
            <span>ورود با حساب گوگل</span>
            <img src="/src/icons/chrome.svg" alt="chrome" />
          </button>

          <p className="signup-text">
            حساب کاربری ندارید؟{" "}
            <Link className="signup-link" to="/register">
              ثبت نام کنید
            </Link>
          </p>
        </div>

        <div className="login-img">
          <img src="/src/images/dog.svg" alt="dog" />
        </div>
      </div>
    </div>
  );
};

export default Login;
