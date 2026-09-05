import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/mockAuth";
import Welcome from "@/pages/Welcome";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import Scan from "@/pages/Scan";
import ResultsLayout from "@/pages/ResultsLayout";
import ResultsIndex from "@/pages/ResultsIndex";
import CategoryResults from "@/pages/CategoryResults";
import Placement from "@/pages/Placement";
import Guide from "@/pages/Guide";
import Shopping from "@/pages/Shopping";
import Profile from "@/pages/Profile";
import Favourites from "@/pages/Favourites";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/results" element={<ResultsLayout />}>
              <Route index element={<ResultsIndex />} />
              <Route path=":category" element={<CategoryResults />} />
            </Route>
            <Route path="/placement" element={<Placement />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favourites" element={<Favourites />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
