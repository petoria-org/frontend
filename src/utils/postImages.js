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

  const backendImage = normalizeBackendImageUrl(
    post.image_url || post.image || post.thumbnail
  );

  if (backendImage) {
    return backendImage;
  }

  const petType = String(post.pet_type || "").toLowerCase();
  return PET_DEFAULT_IMAGES[petType] || PET_DEFAULT_IMAGES.other;
};
