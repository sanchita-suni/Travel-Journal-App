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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">My Profile</h1>

        {/* Name Field */}
        <div className="mb-6">
          <label className="block font-bold text-gray-400 text-sm mb-1">FULL NAME</label>
          <p className="text-xl font-semibold text-gray-800">{user.name}</p>
        </div>

        {/* Email Field (Replaces Phone) */}
        <div className="mb-6">
          <label className="block font-bold text-gray-400 text-sm mb-1">EMAIL ADDRESS</label>
          <p className="text-xl font-semibold text-gray-800">{user.email}</p>
        </div>

        {/* Password Placeholder */}
        <div className="mb-8">
          <label className="block font-bold text-gray-400 text-sm mb-1">PASSWORD</label>
          <div className="flex items-center gap-3">
            <p className="text-2xl tracking-widest text-gray-800">
              {showPw ? "secret123" : "🧸🧸🧸🧸🧸🧸"}
            </p>
            <button 
              onClick={() => setShowPw(!showPw)} 
              className="text-xl hover:scale-110 transition"
              title="Toggle Visibility"
            >
              {showPw ? "👁️" : "🔒"}
            </button>
          </div>
          <p className="text-xs text-blue-500 mt-2 cursor-pointer hover:underline">Change Password</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md transition transform active:scale-95"
            onClick={() => alert("Profile update feature coming soon!")}
          >
            Save Changes
          </button>

          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold shadow-md transition transform active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}