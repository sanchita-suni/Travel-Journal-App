import React, { useState } from "react";

export default function SignupPage({ onSignup, onGoToLogin }) {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function handleSignup(e) {
    e.preventDefault();

    const newUser = { username, phone, password };

    localStorage.setItem("travelUser", JSON.stringify(newUser));
    alert("Account created! Please log in.");
    onSignup();
  }

  const maskedPassword = "🧸".repeat(password.length);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1478810810369-07072c5f2512?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-[350px] border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Account ✨
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none"
            placeholder="Choose Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="tel"
            className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-3 cursor-pointer text-white"
            >
              {showPw ? "👁️" : maskedPassword}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Already have an account?{" "}
          <button onClick={onGoToLogin} className="text-yellow-300 underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
