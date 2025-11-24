import { Route, Routes } from "react-router-dom";
import ViewDetails from "./pages/viewDetails.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ViewDetails />} />
    </Routes>
  );
}

export default App;
