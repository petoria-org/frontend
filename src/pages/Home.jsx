import { useEffect } from "react";
import api from "../Services/api";
import Hero from "../components/Hero";
import AnimalTypes from "../components/AnimalTypes/AnimalTypes";
import SuccessStories from "../components/SuccessStories";
import NewPosts from "../components/NewPosts";

export default function Home() {

  useEffect(() => {
    api.get("posts/user/all/")
      .then(res => {
        console.log("✅ USER POSTS:", res.data);
      })
      .catch(err => {
        console.error(
          "❌ ERROR:",
          err.response?.status,
          err.response?.data
        );
      });
  }, []);

  return (
    <div>
      <Hero />
      <AnimalTypes /> 
      <SuccessStories />
      <NewPosts />
    </div>
  );
}
