import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyLibrary() {
  const navigate = useNavigate();

  const books = [
    { id: 1, title: "My First Journal", desc: "Personal reflections and memories" },
    { id: 2, title: "Travel Diary", desc: "Trips and adventures across the globe" },
    { id: 3, title: "Adventure Notes", desc: "Highlights from outdoor expeditions" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-8 flex flex-col items-center">
      {/* Page Header */}
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center drop-shadow-md">
        📚 My Library
      </h1>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => navigate(`/book/${book.id}`)}
            className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-200">
              📖
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {book.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {book.desc}
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-3 font-medium">
              Tap to open →
            </p>
          </div>
        ))}
      </div>

      {/* Floating Add (+) Button */}
      <button
        onClick={() => navigate("/book-selection")}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 text-4xl flex items-center justify-center shadow-lg transition-all duration-300"
        title="Create New Journal"
      >
        +
      </button>
    </div>
  );
}
