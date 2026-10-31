import React, { useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/mockAuth";
import { api } from "@/lib/api";
import TemporaryLanding from "@/pages/TemporaryLanding";
import Feedback from "@/pages/Feedback";
import Privacy from "@/pages/Privacy";
import DeleteAccount from "@/pages/DeleteAccount";

// Handles the Emergent Google OAuth return (#session_id=...).
function AuthCallback() {
  const { setUserFromCallback } = useAuth();
  const navigate = useNavigate();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    (async () => {
      if (!sessionId) { navigate("/login"); return; }
      try {
        const res = await api.post("/auth/google/session", { session_id: sessionId });
        setUserFromCallback(res.data.user, res.data.token);
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/scan");
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate, setUserFromCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in\u2026</p>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<TemporaryLanding />} />
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
