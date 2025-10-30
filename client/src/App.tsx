import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Welcome />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
