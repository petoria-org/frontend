import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route , Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Posts from './pages/Posts.jsx'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import { UserProfilePage } from "./pages/UserProfilePage";
import { PostDetails } from "./pages/PostDetails";

function App() {

  return (
    <>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/posts' element={<Posts />} />
      <Route path='/user-profile' element={<UserProfilePage />} />
      <Route path='/post-details' element={<PostDetails />} />
    </Routes>
    </>
  )
}

export default App