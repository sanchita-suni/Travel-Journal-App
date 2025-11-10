import React from "react";
import { useNavigate } from "react-router-dom";

export default function BookSelection() {
  const navigate = useNavigate();

  // 📘 Example book list — update cover paths or add more books if needed
  const books = [
    {
      id: 1,
      title: "Adventure",
      cover: "/covers/adventure.jpg",
      desc: "A story of mountains, rivers, and endless skies.",
    },
    {
      id: 2,
      title: "Memories of Mountains",
      cover: "/covers/mountains.jpg",
      desc: "Capturing serene peaks and travel moments.",
    },
    {
      id: 3,
      title: "Ocean Journal",
      cover: "/covers/ocean.jpg",
      desc: "Waves, beaches, and peace in motion.",
    },
    {
      id: 4,
      title: "Desert Diaries",
      cover: "/covers/desert.jpg",
      desc: "Golden sands and whispers of ancient dunes.",
    },
    {
      id: 5,
      title: "City Wanderer",
      cover: "/covers/city.jpg",
      desc: "Lights, streets, and stories untold.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-start p-8">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/library")}
        className="self-start mb-6 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
      >
        ← Back
      </button>

      {/* 🏷️ Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
        Choose My Book
      </h1>

      {/* 📚 Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-center">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() =>
              // include cover/title in both location.state and query string so BookEditor
              // can read it from state (immediate) or query (refresh / direct link)
              navigate(
                `/book/${book.id}?cover=${encodeURIComponent(book.cover)}&title=${encodeURIComponent(book.title)}`,
                { state: { cover: book.cover, title: book.title } }
              )
            }
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-200"
          >
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-52 object-cover"
            />
            <div className="p-3 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {book.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
