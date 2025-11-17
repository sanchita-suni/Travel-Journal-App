import React, { useState } from "react";

export default function SignupPage({ onSignup, onGoToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      alert("Account created! Please log in.");
      onSignup(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

        {error && (
          <div className="bg-red-500/80 text-white p-2 rounded text-sm text-center mb-4 border border-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none border border-transparent focus:border-yellow-300 transition placeholder:text-gray-100"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none border border-transparent focus:border-yellow-300 transition placeholder:text-gray-100"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none border border-transparent focus:border-yellow-300 transition placeholder:text-gray-100"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-3 cursor-pointer text-white text-xl select-none hover:scale-110 transition"
            >
              {showPw ? "👁️" : "🧸"}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 rounded-lg transition transform active:scale-95 shadow-lg"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-white mt-4 text-sm">
          Already have an account?{" "}
          <button
            onClick={onGoToLogin}
            className="text-yellow-300 underline hover:text-yellow-400 font-semibold"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}