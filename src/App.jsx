import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route , Routes } from 'react-router-dom'
import { PostDetails } from "./pages/PostDetails";

function App() {

  return (
    <>
    <Routes>
      <Route path='/post-details' element={<PostDetails />} />
    </Routes>
    </>
  )
}

export default App