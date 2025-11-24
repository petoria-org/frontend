import { useState } from 'react'
import './App.css';
import { Route , Routes } from 'react-router-dom';
import ViewDetails from './pages/ViewDetails.jsx';


function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<ViewDetails />} />
    </Routes>
    </>
  )
}

export default App
