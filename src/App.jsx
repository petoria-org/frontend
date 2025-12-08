import './App.css'
import "./styles/global.css";
import { Route , Routes } from 'react-router-dom'
import { UserProfilePage } from "./pages/UserProfilePage";
import { PostDetails } from "./pages/PostDetails";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from './pages/Home.jsx'
import Posts from './pages/Posts.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Notification from './pages/Notification.jsx'
import Verify from './pages/verify.jsx'


function App() {

  return (
    <>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/posts' element={<Posts />} />
      <Route path='/user-profile' element={<UserProfilePage />} />
      <Route path='/post-details' element={<PostDetails />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/notification' element={<Notification />} />
      <Route path='/verify' element={<Verify />} />
    </Routes>
    </>
  )
}

export default App