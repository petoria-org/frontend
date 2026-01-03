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
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="divider-line"></div>
        </div>

          <AnimalTypes />

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="divider-line"></div>
        </div>

          <SuccessStories />

        
        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="divider-line"></div>
        </div>

          <NewPosts />
      </div>
    </div>
  );
}