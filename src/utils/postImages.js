import { config } from "../config";
import dogImg from "../assets/images/dog.png";
import catImg from "../assets/images/cat.png";
import birdImg from "../assets/images/bird.png";
import rabbitImg from "../assets/images/rabbit.png";
import hamsterImg from "../assets/images/hamester.png";
import otherImg from "../assets/images/other.png";

import successDogImg from "../assets/images/success_story_dog.png";
import successCatImg from "../assets/images/success_story_cat.png";
import successRabbitImg from "../assets/images/success_story_rabbit.png";
import successHamsterImg from "../assets/images/success_story_hamster.png";
import successBirdImg from "../assets/images/success_story_bird.png";
import successOtherImg from "../assets/images/success_story_other.png";

const BACKEND_URL = config.BACKEND_URL;

export const PET_DEFAULT_IMAGES = {
  dog: dogImg,
  cat: catImg,
  bird: birdImg,
  rabbit: rabbitImg,
  hamster: hamsterImg,
  other: otherImg,
};

export const SUCCESS_STORY_DEFAULT_IMAGES = {
  dog: successDogImg,
  cat: successCatImg,
  rabbit: successRabbitImg,
  hamster: successHamsterImg,
  bird: successBirdImg,
  other: successOtherImg,
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

export const getSuccessStoryDefaultImage = (data) => {
  const rawType =
    data?.pet_type?.value ||
    data?.pet_type ||
    data?.pet?.pet_type ||
    data?.pet?.type ||
    data?.type ||
    data?.petType ||
    "";

  const typeKey = String(rawType).toLowerCase().trim();
  return SUCCESS_STORY_DEFAULT_IMAGES[typeKey] || SUCCESS_STORY_DEFAULT_IMAGES.other;
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
