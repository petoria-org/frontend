import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import  Navbar from './components/Navbar.jsx'
import {BrowserRouter, Route , Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'


function App() {

  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>    
  )
}

export default App
