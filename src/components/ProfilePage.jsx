import React, { useState, useEffect } from "react";

export default function ProfilePage({ onLogout }) {
  const [user, setUser] = useState({
    name: "Loading...",
    email: "Loading...",
  });

  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data) {
          setUser({
            name: data.name,
            email: data.email
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    // Matches the dark gray/slate of your App/Library (gray-900)
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-900 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-900 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>

      {/* Main Card - Dark Slate (gray-800) */}
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-white relative z-10">
        
        {/* Avatar Circle */}
        <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-gray-700">
                {user.name[0] || "👤"}
            </div>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center tracking-wide text-gray-100">
          {user.name}
        </h1>

        {/* Details Section */}
        <div className="space-y-5">
            {/* Email Field */}
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Email Address</label>
                <p className="text-lg font-medium text-gray-200">{user.email}</p>
            </div>

            {/* Password Field */}
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 flex justify-between items-center">
                <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Password</label>
                    <p className="text-xl tracking-widest font-medium text-gray-200">
                        {showPw ? "secret123" : "🧸🧸🧸🧸🧸"}
                    </p>
                </div>
                <button 
                    onClick={() => setShowPw(!showPw)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-600 transition text-gray-300"
                    title="Toggle Visibility"
                >
                    {showPw ? "👁️" : "🔒"}
                </button>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => alert("Edit Profile feature coming soon!")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95"
          >
            Edit Profile
          </button>

          <button
            onClick={onLogout}
            className="w-full bg-red-500/90 hover:bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95"
          >
            Log Out
          </button>
        </div>
        
      </div>
    </div>
  );
}