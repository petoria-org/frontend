import api from "./api";

export const getUserProfile = async () => {
  const res = await api.get("/users/profile/");
  return res.data;
};

export const getUserLostPosts = async () => {
  const res = await api.get("/posts/user/lost/");
  return res.data.results;
};

export const getUserFoundPosts = async () => {
  const res = await api.get("/posts/user/found/");
  return res.data.results;
};

export const getUserSurrenderPosts = async () => {
  const res = await api.get("/posts/user/surrender/");
  return res.data.results;
};
