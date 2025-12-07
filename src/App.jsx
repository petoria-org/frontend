import './App.css'
import  Navbar from './components/Navbar.jsx'
import {BrowserRouter as Router, Route , Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Notification from './pages/Notification.jsx'
import Verify from './pages/verify.jsx'


function App() {

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/notification' element={<Notification />} />
        <Route path='/verify' element={<Verify />} />
      </Routes>
    </Router>
  )
}

export default App
