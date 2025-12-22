import { useEffect } from "react";
import api from "../Services/api";

import { Navbar } from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import SucccessStories from "../components/SuccessStories";
import NewPosts from "../components/NewPosts";
import "../styles/Home.css";

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
      <Navbar />
      <Hero />
      <Stats />
      <SucccessStories />
      <NewPosts />
    </div>
  );
}
