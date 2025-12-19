import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function StoryDetail() {
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
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>در حال بارگذاری...</p>;
  if (!story) return <p>داستان پیدا نشد</p>;

  const handleDelete = () => {
    fetch(`http://localhost:8000/stories/${id}/`, { method: "DELETE" })
      .then(() => navigate("/"))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>{story.title}</h1>
      <p>توسط {story.author} • {story.date}</p>
      <img src={story.image} alt={story.title} />
      <p>{story.content}</p>
      <p>وضعیت: {story.status}</p>
      <button onClick={() => navigate(`/stories/edit/${id}`)}>ویرایش</button>
      <button onClick={handleDelete}>حذف</button>
    </div>
  );
}
