import React, { useState } from "react";

console.log("✅ Active MyLibrary file loaded!");

const MyLibrary = () => {
  const [mode, setMode] = useState("library");

  if (mode === "create") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative">
        {/* 🔙 Back Arrow Button */}
        <button
          onClick={() => setMode("library")}
          className="fixed top-6 left-6 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold z-[9999] shadow-lg hover:bg-blue-700 transition"
        >
          ←
        </button>

        <h1 className="text-4xl font-semibold text-gray-800">Welcome :)</h1>
      </div>
    );
  }

  // 📚 Library Page
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center relative">
      <h2 className="text-2xl mb-6">📚 My Library Page</h2>
      <button
        onClick={() => setMode("create")}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 text-4xl flex items-center justify-center shadow-lg"
      >
        +
      </button>
    </div>
  );
};

export default MyLibrary;
