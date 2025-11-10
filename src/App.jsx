import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Earth from "./components/Earth.jsx";
import TripPlanner from "./components/TripPlanner.jsx";
import Shelf3D from "./components/Shelf3D.jsx";
import BookSelection from "./components/BookSelection.jsx";
import BookEditor from "./components/BookEditor.jsx"; // ✅ Book view page
import "./App.css";

// --- Tailwind Config Loader ---
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

// --- Navbar ---
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
            className="text-xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition"
          >
            🌎 Travel Journal App
          </button>

          <div className="hidden sm:flex sm:space-x-4 lg:space-x-8">
            {navFeatures.map((feature) => (
              <button
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition"
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

// --- Pages ---
function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
        Welcome to Your Digital Journal!
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
        Capture every memory, plan every trip, and share your adventures with the
        world (or keep them private).
      </p>

      <section className="mt-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer"
          onClick={() => navigate("/library")}
        >
          <div className="text-blue-500 text-4xl mb-3">📚</div>
          <h2 className="text-xl font-semibold mb-2">My Library</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Design new journals and access all your saved trips.
          </p>
        </div>

        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer"
          onClick={() => navigate("/planner")}
        >
          <div className="text-green-500 text-4xl mb-3">🗺️</div>
          <h2 className="text-xl font-semibold mb-2">Trip Planner</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Visualize your next adventure and organize logistics.
          </p>
        </div>

        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div className="text-purple-500 text-4xl mb-3">👤</div>
          <h2 className="text-xl font-semibold mb-2">Profile & Settings</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage your account details and theme preferences.
          </p>
        </div>
      </section>
    </div>
  );
}

function MyLibraryPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] p-4 md:p-8 bg-gray-200 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        📚 My Private Library
      </h2>

      <div className="flex justify-center items-center">
        <Shelf3D />
      </div>

      <button
        onClick={() => navigate("/book-selection")}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 text-3xl"
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
    <div className="p-8 text-center text-gray-900 dark:text-white min-h-[calc(100vh-64px)] flex items-center justify-center">
      <h2>{title} (Coming Soon!)</h2>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  TailwindConfig();

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<MyLibraryPage />} />
        <Route path="/planner" element={<TripPlanner />} />
        <Route path="/lookup" element={<LookupPage />} />
        <Route path="/public" element={<ComingSoon title="Public Journals" />} />
        <Route path="/private" element={<ComingSoon title="Private Journals" />} />
        <Route path="/profile" element={<ComingSoon title="Profile Page" />} />
        <Route path="/book-selection" element={<BookSelection />} />
        <Route path="/book/:id" element={<BookEditor />} /> {/* ✅ New route */}
      </Routes>
    </div>
  );
}
