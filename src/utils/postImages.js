import { config } from "../config";
import { ANIMAL_TO_BACKEND } from "./postFilters";
import { PET_TYPE_ORDER } from "./petTypes";

const BACKEND_URL = config.BACKEND_URL;

export const PET_DEFAULT_IMAGES = {
  dog: "/src/assets/images/dog.png",
  cat: "/src/assets/images/cat.png",
  bird: "/src/assets/images/bird.png",
  rabbit: "/src/assets/images/rabbit.png",
  hamster: "/src/assets/images/hamester.png",
  other: "/src/assets/images/other.png",
};

export const SUCCESS_STORY_DEFAULT_IMAGES = {
  dog: "/src/assets/images/success_story_dog.png",
  cat: "/src/assets/images/success_story_cat.png",
  rabbit: "/src/assets/images/success_story_rabbit.png",
  hamster: "/src/assets/images/success_story_hamster.png",
  bird: "/src/assets/images/success_story_bird.png",
  other: "/src/assets/images/success_story_other.png",
};

const STORY_PET_TYPE_CACHE_KEY = "successStoryPetTypes";

const readStoryPetTypeCache = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORY_PET_TYPE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writeStoryPetTypeCache = (cache) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORY_PET_TYPE_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch {
    // Ignore storage failures to avoid blocking UI.
  }
};

const normalizePetTypeKey = (value) => {
  const key = String(value || "").toLowerCase().trim();
  if (ANIMAL_TO_BACKEND[key]) {
    return ANIMAL_TO_BACKEND[key];
  }
  if (ANIMAL_TO_BACKEND[value]) {
    return ANIMAL_TO_BACKEND[value];
  }
  if (/^\d+$/.test(key)) {
    const numericKey = Number.parseInt(key, 10);
    if (Number.isFinite(numericKey)) {
      if (numericKey === 0 && PET_TYPE_ORDER.length > 0) {
        return PET_TYPE_ORDER[0];
      }
      if (numericKey >= 1 && numericKey <= PET_TYPE_ORDER.length) {
        return PET_TYPE_ORDER[numericKey - 1];
      }
      if (numericKey >= 0 && numericKey < PET_TYPE_ORDER.length) {
        return PET_TYPE_ORDER[numericKey];
      }
    }
  }
  const map = {
    "سگ": "dog",
    "گربه": "cat",
    "پرنده": "bird",
    "خرگوش": "rabbit",
    "همستر": "hamster",
    "سایر": "other",
    "others": "other"
  };

  return map[key] || key;
};

const resolvePetTypeValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return resolvePetTypeValue(
      value.value ||
        value.label ||
        value.name ||
        value.title ||
        value.slug ||
        value.type ||
        value.pet_type ||
        value.animal_type ||
        value.animalType
    );
  }

  return "";
};

const pickPetTypeValue = (...values) => {
  for (const value of values) {
    const resolved = resolvePetTypeValue(value);
    if (resolved) {
      return resolved;
    }
  }

  return "";
};

const getCachedStoryPetType = (data) => {
  const cache = readStoryPetTypeCache();
  if (!cache) {
    return "";
  }

  const storyId = data?.id ?? data?.storyId;
  if (storyId && cache.story?.[storyId]) {
    return cache.story[storyId];
  }

  const petId = data?.pet_id ?? data?.pet?.id;
  if (petId && cache.pet?.[petId]) {
    return cache.pet[petId];
  }

  return "";
};

const getCachedStoryDefaultImage = (data) => {
  const cache = readStoryPetTypeCache();
  if (!cache) {
    return "";
  }

  const storyId = data?.id ?? data?.storyId;
  if (storyId && cache.storyImage?.[storyId]) {
    return cache.storyImage[storyId];
  }

  const petId = data?.pet_id ?? data?.pet?.id;
  if (petId && cache.petImage?.[petId]) {
    return cache.petImage[petId];
  }

  return "";
};

export const cacheSuccessStoryPetType = (storyId, petType, petId) => {
  if (!storyId || !petType) {
    return;
  }

  const cache = readStoryPetTypeCache() || {};
  cache.story = cache.story || {};
  cache.story[storyId] = petType;

  if (petId) {
    cache.pet = cache.pet || {};
    cache.pet[petId] = petType;
  }

  writeStoryPetTypeCache(cache);
};

export const cacheSuccessStoryDefaultImage = (storyId, imageUrl, petId) => {
  if (!storyId || !imageUrl) {
    return;
  }

  const cache = readStoryPetTypeCache() || {};
  cache.storyImage = cache.storyImage || {};
  cache.storyImage[storyId] = imageUrl;

  if (petId) {
    cache.petImage = cache.petImage || {};
    cache.petImage[petId] = imageUrl;
  }

  writeStoryPetTypeCache(cache);
};

const normalizeBackendImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (typeof imagePath === "object" && imagePath !== null) {
    const nested =
      imagePath.url ||
      imagePath.image ||
      imagePath.thumbnail ||
      imagePath.file ||
      imagePath.image_url;
    return normalizeBackendImageUrl(nested);
  }

  const pathString = String(imagePath);

  if (
    pathString === "null" ||
    pathString === "" ||
    pathString === "undefined"
  ) {
    return null;
  }

  if (pathString.startsWith("http://") || pathString.startsWith("https://")) {
    return pathString;
  }

  if (pathString.startsWith("/")) {
    return `${BACKEND_URL}${pathString}`;
  }

  return `${BACKEND_URL}/${pathString}`;
};

export const getFallbackPetImage = (data) => {
  const rawType = pickPetTypeValue(
    data?.pet_type,
    data?.originalData?.pet_type
  );

  const typeKey = normalizePetTypeKey(rawType);
  return PET_DEFAULT_IMAGES[typeKey] || PET_DEFAULT_IMAGES.other;
};

export const getSuccessStoryDefaultImage = (data) => {
  let rawType = pickPetTypeValue(
    data?.pet_type,
    data?.pet_type_id,
    data?.pet?.pet_type,
    data?.pet?.pet_type_id,
    data?.pet?.type,
    data?.type,
    data?.petType,
    data?.originalData?.pet_type
  );

  if (!rawType) {
    rawType = getCachedStoryPetType(data);
  }

  const typeKey = normalizePetTypeKey(rawType);
  const computedImage =
    SUCCESS_STORY_DEFAULT_IMAGES[typeKey] || SUCCESS_STORY_DEFAULT_IMAGES.other;
  const cachedImage = getCachedStoryDefaultImage(data);
  if ((!rawType || typeKey === "other") && cachedImage) {
    return cachedImage;
  }
  return computedImage;
};

export const getPostImage = (post) => {
  if (!post) {
    return PET_DEFAULT_IMAGES.other;
  }

  const backendImage = normalizeBackendImageUrl(
    post.image_url || post.image || post.thumbnail
  );

  if (backendImage) {
    return backendImage;
  }

  const petType = String(resolvePetTypeValue(post.pet_type) || "").toLowerCase();
  return PET_DEFAULT_IMAGES[petType] || PET_DEFAULT_IMAGES.other;
};
