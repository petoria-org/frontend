export const PET_TYPE_LABELS = {
  cat: "گربه",
  dog: "سگ",
  bird: "پرنده",
  rabbit: "خرگوش",
  hamster: "همستر",
  other: "سایر",
};

export const PET_TYPE_ORDER = ["dog", "cat", "rabbit", "hamster", "bird", "other"];

const PET_TYPE_LABEL_SET = new Set(Object.values(PET_TYPE_LABELS));

export const getPetType = (type, fallback = "نامشخص") => {
  if (!type) {
    return fallback;
  }

  const normalized = String(type).trim();
  const lower = normalized.toLowerCase();

  if (PET_TYPE_LABELS[lower]) {
    return PET_TYPE_LABELS[lower];
  }

  if (PET_TYPE_LABEL_SET.has(normalized)) {
    return normalized;
  }

  return fallback;
};
