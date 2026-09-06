import React, { useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/mockAuth";
import { api } from "@/lib/api";
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
import { PaymentSuccess, PaymentCancel } from "@/pages/Payment";

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
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
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
