import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditStory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`stories/<int:pk>/`)
      .then((res) => res.json())
      .then((data) => {
        setStory(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>در حال بارگذاری...</p>;
  if (!story) return <p>داستان پیدا نشد</p>;

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/stories/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
    })
      .then(() => navigate(`/stories/${id}`))
      .catch((err) => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={story.title}
        onChange={(e) => setStory({ ...story, title: e.target.value })}
      />
      <input
        value={story.content}
        onChange={(e) => setStory({ ...story, content: e.target.value })}
      />
      <input
        value={story.image}
        onChange={(e) => setStory({ ...story, image: e.target.value })}
      />
      <input
        value={story.status}
        onChange={(e) => setStory({ ...story, status: e.target.value })}
      />
      <button type="submit">به‌روزرسانی</button>
    </form>
  );
}
