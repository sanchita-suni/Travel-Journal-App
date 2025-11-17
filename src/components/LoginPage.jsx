import React, { useState } from "react";

export default function LoginPage({ onLogin, onGoToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Ensure port is 5000
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save data properly
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
      }

      onLogin(); // Redirect
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80')" }}>
      <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-[350px] border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Welcome Back 👋</h2>
        {error && <div className="bg-red-500/80 text-white p-2 rounded text-sm text-center mb-4">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" className="w-full p-3 rounded-lg bg-white/40 placeholder-gray-200 text-white outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-white mt-4">Don’t have an account? <button onClick={onGoToSignup} className="text-yellow-300 underline">Create one</button></p>
      </div>
    </div>
  );
}