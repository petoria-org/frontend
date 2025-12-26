import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import EmptyLayout from "./layouts/EmptyLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import './App.css'
import "./styles/global.css";

// Public pages
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import {PostDetails} from "./pages/PostDetails";
import SuccessStoriesAllPage from "./pages/SuccessStoriesAllPage/SuccessStoriesAllPage";

// Auth / flow pages (NO navbar, NO footer)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Verify from "./pages/Verify";
import LocationPicker from "./pages/LocationPicker/LocationPicker";

// Protected pages
import { UserProfilePage } from "./pages/UserProfilePage";
import ChatPage from "./pages/Chats";
import CreateAd from "./pages/CreateAd";

function App() {
  return (
    <Routes>
      {/* =========================
          NO Navbar / NO Footer
      ========================= */}
      <Route element={<EmptyLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/pick-location" element={<LocationPicker />} />
      </Route>

      {/* =========================
          Navbar + Footer
      ========================= */}
      <Route element={<MainLayout />}>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/post-details" element={<PostDetails />} />
        <Route
          path="/success-stories"
          element={<SuccessStoriesAllPage />}
        />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/create-ad" element={<CreateAd />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
