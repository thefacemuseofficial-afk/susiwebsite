import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/mockAuth";
import TemporaryLanding from "@/pages/TemporaryLanding";
import Feedback from "@/pages/Feedback";
import Privacy from "@/pages/Privacy";
import DeleteAccount from "@/pages/DeleteAccount";
import About from "@/pages/About";
import TermsOfService from "@/pages/TermsOfService";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TemporaryLanding />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/delete-account" element={<DeleteAccount />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
