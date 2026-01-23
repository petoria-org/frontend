import { useEffect } from "react";
import api from "../Services/api";
import Hero from "../components/Hero";
import AnimalTypes from "../components/AnimalTypes/AnimalTypes";
import SuccessStories from "../components/SuccessStories";
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
    <div className="landing-page"> 
      <div className="landing-page-container">
        <div className="background-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
          <div className="blob blob-4"></div>
        </div>
        
        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--i': i,
              '--x': Math.random() * 100,
              '--y': Math.random() * 100,
              '--size': Math.random() * 2 + 1
            }}></div>
          ))}
        </div>

        <div className="landing-content-wrapper">
          <div className="landing-section hero-section-wrapper">
            <Hero />
          </div>
          
          <div className="section-divider">
            <div className="divider-line"></div>
            <div className="divider-icon">
              <span className="divider-icon-image" aria-hidden="true" />
            </div>
            <div className="divider-line"></div>
          </div>

          <AnimalTypes />

          <div className="section-divider">
            <div className="divider-line"></div>
            <div className="divider-icon">
              <span className="divider-icon-image" aria-hidden="true" />
            </div>
            <div className="divider-line"></div>
          </div>

          <SuccessStories />

          <div className="section-divider">
            <div className="divider-line"></div>
            <div className="divider-icon">
              <span className="divider-icon-image" aria-hidden="true" />
            </div>
            <div className="divider-line"></div>
          </div>

          <NewPosts />
        </div>
      </div>
    </div> 
  );
}
