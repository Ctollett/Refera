import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import { Session } from "./pages/Session";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/session" element={<Session />} />
          <Route path="/sessions/:id" element={<Session />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
