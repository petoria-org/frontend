import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateStory() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("user/stories/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content, image, status }),
    })
      .then((res) => res.json())
      .then(() => navigate("/"))
      .catch((err) => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="محتوا" value={content} onChange={(e) => setContent(e.target.value)} />
      <input placeholder="لینک عکس" value={image} onChange={(e) => setImage(e.target.value)} />
      <input placeholder="وضعیت" value={status} onChange={(e) => setStatus(e.target.value)} />
      <button type="submit">ثبت داستان</button>
    </form>
  );
}
