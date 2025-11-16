import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Earth from "./components/Earth.jsx";
import TripPlanner from "./components/TripPlanner.jsx";
import Shelf3D from "./components/Shelf3D.jsx";
import BookSelection from "./components/BookSelection.jsx";
import BookEditor from "./components/BookEditor.jsx";

import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";

import "./App.css";

/* ------------------------------------------------------
   Tailwind Loader
------------------------------------------------------ */
function TailwindConfig() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);

    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    document.documentElement.classList.add("font-inter");
  }, []);

  return null;
}

/* ------------------------------------------------------
   Navbar — Hidden on login/signup pages
------------------------------------------------------ */
function Navbar() {
  const navigate = useNavigate();

  const navFeatures = [
    { name: "Home", path: "/" },
    { name: "My Library", path: "/library" },
    { name: "Trip Planner", path: "/planner" },
    { name: "Look Up", path: "/lookup" },
    { name: "Public", path: "/public" },
    { name: "Private", path: "/private" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            🌎 Travel Journal App
          </button>

          <div className="hidden sm:flex sm:space-x-4 lg:space-x-8">
            {navFeatures.map((feature) => (
              <button
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {feature.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------
   Protected Route (blocks pages if not logged in)
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

  return (
    <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
        Welcome to Your Digital Journal!
      </h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
        Capture every memory, plan every trip, and share your adventures.
      </p>

      <section className="mt-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer"
          onClick={() => navigate("/library")}
        >
          <div className="text-blue-500 text-4xl mb-3">📚</div>
          <h2 className="text-xl font-semibold">My Library</h2>
        </div>

        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer"
          onClick={() => navigate("/planner")}
        >
          <div className="text-green-500 text-4xl mb-3">🗺️</div>
          <h2 className="text-xl font-semibold">Trip Planner</h2>
        </div>

        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div className="text-purple-500 text-4xl mb-3">👤</div>
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
      </section>
    </div>
  );
}

function MyLibraryPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] p-4 bg-gray-200 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6">📚 My Private Library</h2>

      <div className="flex justify-center items-center">
        <Shelf3D />
      </div>

      <button
        onClick={() => navigate("/book-selection")}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 text-3xl"
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
    <div className="p-8 text-center min-h-[calc(100vh-64px)] flex items-center justify-center">
      <h2 className="text-gray-900 dark:text-white">{title} (Coming Soon!)</h2>
    </div>
  );
}

/* ------------------------------------------------------
   MAIN APP with Authentication Integration
------------------------------------------------------ */
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  TailwindConfig();

  useEffect(() => {
    const root = document.documentElement;
    isDarkMode ? root.classList.add("dark") : root.classList.remove("dark");
  }, [isDarkMode]);

  const hideNavbar =
    window.location.pathname === "/login" ||
    window.location.pathname === "/signup";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Hide navbar on login/signup */}
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* LOGIN PAGE */}
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={() => {
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "/";
              }}
              onGoToSignup={() => (window.location.href = "/signup")}
            />
          }
        />

        {/* SIGNUP PAGE */}
        <Route
          path="/signup"
          element={
            <SignupPage
              onSignup={() => (window.location.href = "/login")}
              onGoToLogin={() => (window.location.href = "/login")}
            />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <MyLibraryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <TripPlanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lookup"
          element={
            <ProtectedRoute>
              <LookupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/public"
          element={
            <ProtectedRoute>
              <ComingSoon title="Public Journals" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <ComingSoon title="Private Journals" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage
                onLogout={() => {
                  localStorage.removeItem("isLoggedIn");
                  window.location.href = "/login";
                }}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-selection"
          element={
            <ProtectedRoute>
              <BookSelection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
