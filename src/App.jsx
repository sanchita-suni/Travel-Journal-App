import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Earth from "./components/Earth.jsx";
import TripPlanner from "./components/TripPlanner.jsx";
import Shelf3D from "./components/Shelf3D.jsx";
import BookSelection from "./components/BookSelection.jsx";
import PublicFeeds from "./pages/PublicFeeds.jsx";
import BookEditor from "./components/BookEditor.jsx";
import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
// Removed unused import to prevent confusion
import "./App.css";

/* ------------------------------------------------------
   Tailwind Loader
------------------------------------------------------ */
function TailwindConfig() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }, []);
  return null;
}

/* ------------------------------------------------------
   Navbar
------------------------------------------------------ */
function Navbar() {
  const navigate = useNavigate();

  const navFeatures = [
    { name: "Home", path: "/" },
    { name: "My Library", path: "/library" },
    { name: "Trip Planner", path: "/planner" },
    { name: "Look Up", path: "/lookup" },
    { name: "Public", path: "/public" },
    { name: "Profile", path: "/profile" },
  ];

  // Styles
  const navStyle = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backgroundColor: "#1e293b",
    height: "70px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
    borderBottom: "1px solid rgba(255,255,255,0.1)"
  };

  const logoStyle = {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#60a5fa",
    cursor: "pointer",
    background: "none",
    border: "none"
  };

  const buttonStyle = {
    color: "#e2e8f0",
    fontSize: "0.95rem",
    fontWeight: "500",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    transition: "background 0.2s"
  };

  return (
    <nav style={navStyle}>
      <button onClick={() => navigate("/")} style={logoStyle}>
        🌎 Travel Journal App
      </button>

      <div style={{ display: "flex", gap: "1rem" }}>
        {navFeatures.map((feature) => (
          <button
            key={feature.path}
            onClick={() => navigate(feature.path)}
            style={buttonStyle}
            onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.1)")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            {feature.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------
   Protected Route
------------------------------------------------------ */
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" />;
}

/* ------------------------------------------------------
   Pages
------------------------------------------------------ */
function HomePage() {
  const navigate = useNavigate();

  const containerStyle = {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#0f172a",
    color: "white"
  };

  const cardStyle = {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "40px 20px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    textAlign: "center",
    transition: "transform 0.2s",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "3.5rem", fontWeight: "800", marginBottom: "1rem", textAlign: "center" }}>
        Welcome to Your <span style={{ color: "#60a5fa" }}>Digital Journal!</span>
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "600px", textAlign: "center", marginBottom: "50px" }}>
        Capture every memory, plan every trip, and share your adventures.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", width: "100%", maxWidth: "1000px" }}>
        <div style={cardStyle} onClick={() => navigate("/library")} onMouseOver={e => e.currentTarget.style.transform = "translateY(-8px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
          <div style={{ fontSize: "3.5rem", marginBottom: "10px" }}>📚</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>My Library</h2>
          <p style={{ color: "#cbd5e1" }}>View your past journals.</p>
        </div>
        <div style={cardStyle} onClick={() => navigate("/planner")} onMouseOver={e => e.currentTarget.style.transform = "translateY(-8px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
          <div style={{ fontSize: "3.5rem", marginBottom: "10px" }}>🗺️</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Trip Planner</h2>
          <p style={{ color: "#cbd5e1" }}>Plan your next big adventure.</p>
        </div>
        <div style={cardStyle} onClick={() => navigate("/profile")} onMouseOver={e => e.currentTarget.style.transform = "translateY(-8px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
          <div style={{ fontSize: "3.5rem", marginBottom: "10px" }}>👤</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Profile</h2>
          <p style={{ color: "#cbd5e1" }}>Manage your account.</p>
        </div>
      </div>
    </div>
  );
}

// ⭐ THIS WAS MISSING IN YOUR CODE
function MyLibraryPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] p-4 bg-gray-900">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">📚 My Private Library</h2>

      <div className="flex justify-center items-center">
        <Shelf3D />
      </div>

      <button
        onClick={() => navigate("/book-selection")}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 text-3xl shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-50"
      >
        +
      </button>
    </div>
  );
}

function LookupPage() {
  return (
    <div className="p-8 text-center bg-black min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-white mb-4">🌍 Explore the Earth</h2>
      <p className="text-gray-300 mb-6">Drag to rotate — scroll to zoom.</p>
      <Earth />
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="p-8 text-center min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 text-white">
      <h2 className="text-2xl">{title} (Coming Soon!)</h2>
    </div>
  );
}

/* ------------------------------------------------------
   MAIN APP
------------------------------------------------------ */
export default function App() {
  TailwindConfig();

  const hideNavbar =
    window.location.pathname === "/login" ||
    window.location.pathname === "/signup";

  return (
    <div className="min-h-screen bg-gray-900">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => { localStorage.setItem("isLoggedIn", "true"); window.location.href = "/"; }} onGoToSignup={() => (window.location.href = "/signup")} />} />
        <Route path="/signup" element={<SignupPage onSignup={() => (window.location.href = "/login")} onGoToLogin={() => (window.location.href = "/login")} />} />
        
        {/* PROTECTED ROUTES */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><MyLibraryPage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
        <Route path="/lookup" element={<ProtectedRoute><LookupPage /></ProtectedRoute>} />
        <Route path="/public" element={<ProtectedRoute><PublicFeeds /></ProtectedRoute>} />
        <Route path="/private" element={<ProtectedRoute><ComingSoon title="Private" /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage onLogout={() => { localStorage.removeItem("isLoggedIn"); window.location.href = "/login"; }} /></ProtectedRoute>} />
        <Route path="/book-selection" element={<ProtectedRoute><BookSelection /></ProtectedRoute>} />
        <Route path="/book/:id" element={<ProtectedRoute><BookEditor /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}