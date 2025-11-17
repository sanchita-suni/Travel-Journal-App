import React, { useState, useEffect } from "react";

export default function ProfilePage({ onLogout }) {
  const [user, setUser] = useState({
    username: "",
    phone: "",
    password: "",
  });

  const [editingUsername, setEditingUsername] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("travelUser"));
    if (savedUser) setUser(savedUser);
  }, []);

  function saveChanges() {
    localStorage.setItem("travelUser", JSON.stringify(user));
    setEditingUsername(false);
    setChangingPw(false);
    alert("Profile updated!");
  }

  const maskedPassword = "🧸".repeat(user.password.length);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

        {/* Username */}
        <div className="mb-6">
          <label className="font-semibold">Username</label>
          {editingUsername ? (
            <input
              value={user.username}
              onChange={(e) =>
                setUser((u) => ({ ...u, username: e.target.value }))
              }
              className="w-full p-2 border rounded-lg mt-1"
            />
          ) : (
            <p className="text-gray-700 mt-1">{user.username}</p>
          )}

          <button
            onClick={() => setEditingUsername(!editingUsername)}
            className="text-blue-600 text-sm mt-1 underline"
          >
            {editingUsername ? "Cancel" : "Edit Username"}
          </button>
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="font-semibold">Phone Number</label>
          <p className="text-gray-700 mt-1">{user.phone}</p>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="font-semibold">Password</label>

          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-700">
              {showPw ? user.password : maskedPassword}
            </p>

            <button onClick={() => setShowPw(!showPw)} className="text-xl">
              👁️
            </button>
          </div>

          <button
            onClick={() => setChangingPw(!changingPw)}
            className="text-blue-600 text-sm mt-1 underline"
          >
            Change Password
          </button>

          {changingPw && (
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 border rounded-lg mt-2"
              onChange={(e) =>
                setUser((u) => ({ ...u, password: e.target.value }))
              }
            />
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={saveChanges}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold"
        >
          Save Changes
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
