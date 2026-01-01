import { config } from "../config";

const BACKEND_URL = config.BACKEND_URL;

export const PET_DEFAULT_IMAGES = {
  dog: "/src/assets/images/dog.png",
  cat: "/src/assets/images/cat.png",
  bird: "/src/assets/images/bird.png",
  rabbit: "/src/assets/images/rabbit.png",
  hamster: "/src/assets/images/hamester.png",
  other: "/src/assets/images/other.png",
};

export const getFallbackPetImage = (data) => {
  const rawType =
    data?.pet_type?.value ||
    data?.pet_type ||
    data?.originalData?.pet_type?.value ||
    data?.originalData?.pet_type ||
    "";

  const typeKey = String(rawType).toLowerCase().trim();
  return PET_DEFAULT_IMAGES[typeKey] || PET_DEFAULT_IMAGES.other;
};

export const getPostImage = (post) => {
  if (!post) {
    return PET_DEFAULT_IMAGES.other;
  }

  if (post.thumbnail) {
    return `${BACKEND_URL}${post.thumbnail}`;
  }

  const petType = String(post.pet_type || "").toLowerCase();
  return PET_DEFAULT_IMAGES[petType] || PET_DEFAULT_IMAGES.other;
};
