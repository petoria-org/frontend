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
  return res.data.results; 
};

export const createSuccessStory = async (data) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("story", data.story);
  formData.append("story_type", data.story_type);

  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  const res = await api.post(
    "/SuccessStory/stories/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const updateSuccessStory = async (id, data) => {
  if (!id) throw new Error("Story ID is required");
  
  console.log("Updating story with ID:", id);
  console.log("Data being sent:", data);
  
  try {
    const res = await api.put(`/SuccessStory/stories/${id}/`, data);
    console.log("Update response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Update API error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteSuccessStory = async (id) => {
  if (!id) throw new Error("Story ID is required");
  
  console.log("Deleting story with ID:", id);
  
  try {
    const res = await api.delete(`/SuccessStory/stories/${id}/`);
    console.log("Delete response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Delete API error:", error.response?.data || error.message);
    throw error;
  }
};
