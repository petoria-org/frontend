import "../styles/Login.css";
import "../styles/AuthCommon.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { login } from "../Services/authservice";

const Login = () => {
  const navigate = useNavigate();
  
  const schema = yup.object().shape({
    identifier: yup.string().required("ایمیل یا نام کاربری الزامی است"),
    password: yup.string().required("رمز عبور الزامی است")
  });
  
  const {register, handleSubmit, formState: { errors, isSubmitting }} = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data);

      if (response.success) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        console.log("Login successful:", response.data);
        navigate("/");
      } else {
        alert(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  };


  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-main">
          {/* card */}
          <div className="login-card">
            <h2 className="login-title">ورود به حساب کاربری</h2>
            <p className="login-subtitle">به Petoria خوش آمدید</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* identifier (email/username) */}
              <label className="field-label">ایمیل یا نام کاربری*</label>
              <div className="input-wrapper">
                <img className="input-icon" src="/src/icons/profile-circle.svg" alt="profile" />
                <input
                  type="text"
                  className="text-input"
                  placeholder="ایمیل یا نام کاربری خود را وارد کنید"
                  {...register("identifier")}
                />
              </div>
              <p className="error">{errors.identifier?.message}</p>

              {/* password */}
              <label className="field-label">رمز عبور*</label>
              <div className="input-wrapper">
                <img className="input-icon" src="/src/icons/lock.svg" alt="lock" />
                <input
                  type="password"
                  className="text-input"
                  placeholder="رمز عبور خود را وارد کنید"
                  {...register("password")}
                />
              </div>
              <p className="error">{errors.password?.message}</p>
            

              {/* forgot */}
              <Link className="forgot-pass" to={"/forgot-password"}> رمز عبور خود را فراموش کرده‌اید؟</Link>

              {/* login */}
              <button 
                className="login-btn" 
                type="submit"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "در حال ورود..." : "ورود"}</span>
                {!isSubmitting && <img className="arrow" src="/src/icons/arrow-right.svg" alt="arrow" />}
              </button>
            </form>

            {/* divider */}
            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">یا</span>
              <span className="divider-line" />
            </div>

            {/* google */}
            <button className="google-btn">
              <span>ورود با حساب گوگل</span>
              <img src="/src/icons/chrome.svg" alt="chrome" />
            </button>

            {/* signup */}
            <p className="signup-text">
              حساب کاربری ندارید؟{" "}
              <Link className="signup-link" to={"/register"}>ثبت نام کنید</Link>
            </p>
          </div>
          {/* image section */}
          <div className="login-img">
            <img src="/src/images/dog.svg" alt="dog" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;