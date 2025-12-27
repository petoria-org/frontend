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

const normalizeResults = (data) => {
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
};

export const getChatList = async () => {
  try {
    const res = await api.get("/chat/list/");
    return {
      success: true,
      data: normalizeResults(res.data),
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
      data: normalizeResults(res.data),
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(error, "دریافت پیام‌ها ناموفق بود"),
    };
  }
};

export const uploadAttachments = async (files, type = null) => {
  try {
    const fd = new FormData();
    const list = Array.isArray(files) ? files : [];

    if (list.length === 1) {
      fd.append("file", list[0]);
    } else {
      list.forEach((file) => fd.append("files", file));
    }

    if (type) fd.append("type", type);

    const res = await api.post("/chat/attachments/upload/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const payload = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.results)
      ? res.data.results
      : res.data
      ? [res.data]
      : [];

    return {
      success: true,
      data: payload,
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(error, "Attachment upload failed."),
    };
  }
};

// ✅ get-or-create chat for recipient
// Backend should implement: POST /chat/ensure/ { recipient_id } -> returns chat object {id,...}
export const ensureChat = async (recipientId) => {
  try {
    const res = await api.post("/chat/ensure/", { recipient_id: recipientId });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      message: parseError(error, "ساخت/یافتن گفتگو ناموفق بود"),
    };
  }
};

export function buildChatWsUrl() {
  const token = localStorage.getItem("access");
  if (!token) return null;

  return `${WS_BASE_URL}/ws/chat/?token=${encodeURIComponent(token)}`;
}
