import { PET_TYPE_LABELS, PET_TYPE_ORDER } from "./petTypes";

export const SORT_OPTIONS = [
  {
    value: "newest-post",
    label: "جدیدترین پست",
    description: "مرتب‌سازی بر اساس تاریخ انتشار آگهی (جدید به قدیم)",
    backendValue: "-created_at",
  },
  {
    value: "oldest-post",
    label: "قدیمی‌ترین پست",
    description: "مرتب‌سازی بر اساس تاریخ انتشار آگهی (قدیم به جدید)",
    backendValue: "created_at",
  },
  {
    value: "newest-event",
    label: "جدیدترین رویداد",
    description: "مرتب‌سازی بر اساس تاریخ وقوع رویداد (جدید به قدیم)",
    backendValue: "-event",
  },
  {
    value: "oldest-event",
    label: "قدیمی‌ترین رویداد",
    description: "مرتب‌سازی بر اساس تاریخ وقوع رویداد (قدیم به جدید)",
    backendValue: "event",
  },
  {
    value: "recently-updated",
    label: "آخرین بروزرسانی",
    description: "مرتب‌سازی بر اساس تاریخ آخرین ویرایش آگهی",
    backendValue: "-updated_at",
  },
];

export const SORT_TO_BACKEND = SORT_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.backendValue;
  return acc;
}, {});

export const ANIMAL_OPTIONS = PET_TYPE_ORDER.map(
  (type) => PET_TYPE_LABELS[type]
);

export const PET_TYPE_VALUES = Object.keys(PET_TYPE_LABELS);

export const ANIMAL_TO_BACKEND = PET_TYPE_VALUES.reduce((acc, type) => {
  const label = PET_TYPE_LABELS[type];
  acc[label] = type;
  acc[type] = type;
  return acc;
}, {});

export const SEX_OPTIONS = ["نر", "ماده"];

export const SEX_TO_BACKEND = {
  "نر": "male",
  "ماده": "female",
  male: "male",
  female: "female",
};

export const SEX_VALUES = ["male", "female"];

export const AGE_OPTIONS = [
  { value: "under-1", label: "زیر 1 سال" },
  { value: "1-2", label: "1 تا 2 سال" },
  { value: "2-3", label: "2 تا 3 سال" },
  { value: "3-5", label: "3 تا 5 سال" },
  { value: "5-7", label: "5 تا 7 سال" },
  { value: "over-7", label: "بالای 7 سال" },
];

const AGE_LABEL_ALIASES = {
  "زیر 1 سال": "under-1",
  "1-2 سال": "1-2",
  "2-3 سال": "2-3",
  "3-5 سال": "3-5",
  "5-7 سال": "5-7",
  "بالای 7 سال": "over-7",
};

export const AGE_TO_BACKEND = AGE_OPTIONS.reduce((acc, option) => {
  const backendValue = option.value.replace("-", "_");
  acc[option.value] = backendValue;
  acc[option.label] = backendValue;
  return acc;
}, {});

Object.entries(AGE_LABEL_ALIASES).forEach(([label, value]) => {
  AGE_TO_BACKEND[label] = value.replace("-", "_");
});

export const AGE_VALUES = Array.from(
  new Set(AGE_OPTIONS.map((option) => option.value.replace("-", "_")))
);

export const STATUS_OPTIONS = [
  { value: "yes", label: "دارد" },
  { value: "no", label: "ندارد" },
];

export const STATUS_YES_NO_OPTIONS = [
  { value: "yes", label: "انجام شده" },
  { value: "no", label: "انجام نشده" },
];

export const YES_NO_TO_BACKEND = {
  yes: "yes",
  no: "no",
  true: "true",
  false: "false",
  "1": "1",
  "0": "0",
  "دارد": "yes",
  "ندارد": "no",
  "انجام شده": "yes",
  "انجام نشده": "no",
};

export const YES_NO_VALUES = ["yes", "no", "true", "false", "1", "0"];
