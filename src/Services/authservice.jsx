import api from "./api";

/* -------------------------
   Error mapper
-------------------------- */
const mapBackendMessage = (message, fallback) => {
  if (!message || typeof message !== "string") {
    return fallback;
  }

  const exactMappings = {
    // -------- Signup --------
    "Username already exists.":
      "این نام کاربری قبلاً استفاده شده است",

    "Email already exists.":
      "این ایمیل قبلاً ثبت شده است",

    "Confirm password is not the same as password.":
      "رمز عبور و تکرار آن یکسان نیستند",

    "Username can only contain letters, numbers, underscores and periods.":
      "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، _ و . باشد",

    // -------- Auth --------
    "User not found.":
      "نام کاربری یا ایمیل اشتباه است",

    "Invalid credentials":
      "نام کاربری یا رمز عبور اشتباه است",

    "Account is not active. Please verify your email.":
      "حساب کاربری فعال نیست. لطفاً ایمیل خود را تأیید کنید",

    // -------- OTP --------
    "Invalid OTP.":
      "کد تأیید نادرست است",

    "OTP expired.":
      "کد تأیید منقضی شده است",

    // -------- Common --------
    "This field is required.": "پر کردن این فیلد الزامی است",
  };

  if (exactMappings[message]) {
    return exactMappings[message];
  }

  /* =========================
     PARTIAL / DYNAMIC MESSAGES
  ========================= */

  // Password rules (dynamic)
  if (message.startsWith("Password must contain")) {
    return "رمز عبور باید حداقل ۸ کاراکتر بوده و شامل حرف بزرگ، حرف کوچک، عدد و کاراکتر خاص باشد";
  }

  // DRF length errors
  if (
    message.includes("Ensure this field has at least") ||
    message.includes("Ensure this field has no more than")
  ) {
    return "طول مقدار وارد شده خارج از محدوده مجاز است";
  }

  // Email validation
  if (message.includes("Enter a valid email")) {
    return "فرمت ایمیل وارد شده صحیح نیست";
  }

  /* =========================
     FALLBACK (NO RAW ERROR)
  ========================= */
  return fallback;
};


/* -------------------------
   Error parser
-------------------------- */
const FIELD_LABELS = {
  first_name: "نام",
  last_name: "نام خانوادگی",
  username: "نام کاربری",
  email: "ایمیل",
  password: "رمز عبور",
  confirm_password: "تکرار رمز عبور",
};

const parseError = (error, fallback = "عملیات ناموفق بود") => {
  if (!error.response) {
    return "عدم ارتباط با سرور";
  }

  const data = error.response.data;

  // error
  if (data?.error) {
    return mapBackendMessage(data.error, fallback);
  }

  // message
  if (data?.message) {
    return mapBackendMessage(data.message, fallback);
  }

  // DRF FIELD ERRORS
  if (typeof data === "object") {
    const field = Object.keys(data)[0];
    const messages = data[field];

    if (Array.isArray(messages) && messages.length > 0) {
      const fieldName = FIELD_LABELS[field] || field;
      const userMessage = mapBackendMessage(messages[0], fallback);

      return `${fieldName}: ${userMessage}`;
    }
  }

  return fallback;
};

/* =========================
   SIGN UP
========================= */
export const signup = async (data) => {
  const payload = {
    first_name: data.firstName?.trim(),
    last_name: data.lastName?.trim(),
    username: data.username?.trim(),
    email: data.email?.trim(),
    password: data.password,
    confirm_password: data.confirmPassword?.trim(),
  };

  console.log("🚀 SIGNUP PAYLOAD:", payload);

  try {
    const res = await api.post("/users/signup/", payload);

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(error, "ثبت نام ناموفق بود"),
    };
  }
};


export const verifyOtp = async ({ email, otp, purpose }) => {
  try {
    console.log("verifyOtp payload:", {
      email,
      code: otp,
      purpose,
    });

    const res = await api.post("/users/otp/verify/", {
      email,
      code: otp,
      purpose,
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("verifyOtp error:", error);

    return {
      success: false,
      message: parseError(error, "تأیید کد ناموفق بود"),
    };
  }
};

/* =========================
   REQUEST OTP
========================= */
export const requestOtp = async (email) => {
  try {
    const res = await api.post("/users/otp/request/", {
      email,
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(
        error,
        "ارسال مجدد کد ناموفق بود"
      ),
    };
  }
};

/* =========================
   LOGIN
========================= */
export const login = async ({ identifier, password }) => {
  try {
    const res = await api.post("/users/login/", {
      identifier,
      password,
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    const data = error.response?.data;
    const status = error.response?.status;

    if (
      status === 403 &&
      data?.error === "Account is not active. Please verify your email."
    ) {
      return {
        success: false,
        reason: "INACTIVE_ACCOUNT",
        email: identifier,
        message: mapBackendMessage(data.error),
      };
    }

    return {
      success: false,
      message: parseError(error, "ورود ناموفق بود"),
    };
  }
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async ({ email, code, newPassword }) => {
  console.log("resetPassword input:", {
    email,
    code,
    newPassword,
  });

  try {
    const res = await api.post("/users/password/reset/", {
      email,
      code,
      new_password: newPassword,
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(
        error,
        "تغییر رمز عبور ناموفق بود"
      ),
    };
  }
};
