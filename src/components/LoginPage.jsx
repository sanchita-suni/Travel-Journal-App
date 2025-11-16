import React, { useState } from "react";

export default function LoginPage({ onLogin, onGoToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("travelUser"));

    if (!savedUser) {
      setError("No account found. Please create one.");
      return;
    }

    if (
      savedUser.username === username &&
      savedUser.password === password
    ) {
      localStorage.setItem("isLoggedIn", "true");
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-[350px] border border-white/30">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h2>

        {error && (
          <p className="text-red-300 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username */}
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* PASSWORD FIELD - FIXED */}
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* 👁️ or 🧸🧸🧸 mask */}
            <span
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-3 cursor-pointer text-white text-xl"
            >
              {showPw ? "👁️" : "🧸🧸🧸"}
            </span>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
          >
            Login
          </button>
        </form>

        {/* SIGNUP LINK */}
        <p className="text-center text-white mt-4">
          Don’t have an account?{" "}
          <button
            onClick={onGoToSignup}
            className="text-yellow-300 underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
