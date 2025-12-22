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

export const deleteLostPost = (id) =>
  api.delete(`/posts/lost-posts/${id}/`);

export const deleteFoundPost = (id) =>
  api.delete(`/posts/found-posts/${id}/`);

export const deleteSurrenderPost = (id) =>
  api.delete(`/posts/surrender-posts/${id}/`);


// ---------- GET detail ----------
export const getLostPostDetail = (id) =>
  api.get(`/posts/lost-posts/${id}/`).then(res => res.data);

export const getFoundPostDetail = (id) =>
  api.get(`/posts/found-posts/${id}/`).then(res => res.data);

export const getSurrenderPostDetail = (id) =>
  api.get(`/posts/surrender-posts/${id}/`).then(res => res.data);

// ---------- PATCH edit ----------
export const updateLostPost = (id, data) =>
  api.put(`/posts/lost-posts/${id}/`, data);

export const updateFoundPost = (id, data) =>
  api.put(`/posts/found-posts/${id}/`, data);

export const updateSurrenderPost = (id, data) =>
  api.put(`/posts/surrender-posts/${id}/`, data);
