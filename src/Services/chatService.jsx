import api from "./api";
import { config } from "../config";

const WS_BASE_URL = config.BACKEND_URL.replace(/^http/, "ws");

const parseError = (error, fallback = "عملیات ناموفق بود") => {
  if (!error.response) return "عدم ارتباط با سرور";

  const data = error.response.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (data?.message) return data.message;

  return fallback;
};

export const getChatList = async () => {
  try {
    const res = await api.get("/chat/list/");
    return {
      success: true,
      data: res.data?.results || [],
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(error, "دریافت لیست گفتگوها ناموفق بود"),
    };
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const res = await api.get(`/chat/messages/${chatId}/`);
    return {
      success: true,
      data: res.data?.results || [],
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(error, "دریافت پیام‌ها ناموفق بود"),
    };
  }
};

export function buildChatWsUrl() {
  const token = localStorage.getItem("access");
  if (!token) return null;

  return `${WS_BASE_URL}/ws/chat/?token=${encodeURIComponent(token)}`;
}
