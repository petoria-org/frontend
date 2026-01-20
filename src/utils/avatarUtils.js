import { config } from "../config";
import profileAvatar from "../assets/images/profile_avatar.png";

const SCHEME_RE = /^[a-z][a-z\d+\-.]*:/i;

const normalizeAvatarValue = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "object") {
    if (value.url) return normalizeAvatarValue(value.url);
    if (value.image) return normalizeAvatarValue(value.image);
    if (value.thumbnail) return normalizeAvatarValue(value.thumbnail);
    return null;
  }
  const str = String(value).trim();
  return str || null;
};

export const resolveAvatarUrl = (value) => {
  const candidate = normalizeAvatarValue(value);
  if (!candidate) return null;
  if (SCHEME_RE.test(candidate)) return candidate;
  if (candidate.startsWith("//")) return candidate;
  const base = (config?.BACKEND_URL || "").replace(/\/$/, "");
  if (!base) return candidate;
  const suffix = candidate.startsWith("/") ? candidate : `/${candidate}`;
  return `${base}${suffix}`;
};

export const DEFAULT_AVATAR = profileAvatar;
