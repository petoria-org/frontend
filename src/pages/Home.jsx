import {Navbar} from "../components/Navbar"
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import SucccessStories from "../components/SuccessStories";
import NewPosts from "../components/NewPosts";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <Hero />
      <Stats />
      <SucccessStories />
      <NewPosts />
    </div>
  );
}
