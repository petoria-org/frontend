import api from "./api";

export const getSuccessStories = async () => {
  const res = await api.get("/SuccessStory/stories/");
  return res.data.results;
};

export const getSuccessStoryDetail = async (id) => {
  if (!id) throw new Error("Story ID is required");
  const res = await api.get(`/SuccessStory/stories/${id}/`);
  return res.data;
};

export const getUserSuccessStories = async () => {
  const res = await api.get("/SuccessStory/user/stories/");
  return res.data.results; // فقط آرایه داستان‌ها
};

export const createSuccessStory = async (data) => {
  const res = await api.post("/SuccessStory/user/stories/", data);
  return res.data;
};

export const updateSuccessStory = async (id, data) => {
  if (!id) throw new Error("Story ID is required");
  const res = await api.put(`/SuccessStory/stories/${id}/`, data);
  return res.data;
};

export const deleteSuccessStory = async (id) => {
  if (!id) throw new Error("Story ID is required");
  const res = await api.delete(`/SuccessStory/stories/${id}/`);
  return res.data;
};
