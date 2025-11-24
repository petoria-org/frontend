import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route , Routes } from 'react-router-dom'
import Posts from './pages/Posts.jsx';

function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<Posts />} />
    </Routes>
    </>
  )
}

export default App
