import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Shelf3D() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/posts/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setBooks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  const BookSpine = ({ book, index }) => (
    <div
      // ⭐ KEY CHANGE: Pass mode: 'edit' in state
      onClick={() => navigate(`/book/${book._id}`, { state: { mode: 'edit' } })}
      className="cursor-pointer hover:-translate-y-2 transition-transform duration-200"
      style={{
        width: "40px",
        height: "100px",
        backgroundColor: getBookColor(index),
        borderRadius: "3px",
        margin: "0 5px",
        boxShadow: "inset 2px 0 5px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        writingMode: "vertical-rl",
        textOrientation: "mixed",
        color: "white",
        fontSize: "0.75rem",
        fontWeight: "bold",
        borderLeft: "1px solid rgba(255,255,255,0.2)",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
      title={book.title}
    >
      <span className="rotate-180 py-1">{book.title.substring(0, 15)}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "40px", width: "100%", paddingBottom: "80px" }}>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">My Private Library</h2>

      {/* Shelf Tier 1 */}
      <div style={{ width: "80%", height: "120px", backgroundColor: "#1e293b", border: "5px solid #92400e", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px", color: "#e2e8f0", fontWeight: "500" }}>
        {books.length === 0 ? <span className="opacity-50">Empty Shelf</span> : books.slice(0, 8).map((book, i) => <BookSpine key={book._id} book={book} index={i} />)}
      </div>

      {/* Shelf Tier 2 */}
      <div style={{ width: "80%", height: "120px", backgroundColor: "#1e293b", border: "5px solid #92400e", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px", color: "#e2e8f0", fontWeight: "500" }}>
        {books.slice(8, 16).map((book, i) => <BookSpine key={book._id} book={book} index={i + 8} />)}
      </div>

      {/* Shelf Tier 3 */}
      <div style={{ width: "80%", height: "120px", backgroundColor: "#1e293b", border: "5px solid #92400e", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px", color: "#e2e8f0", fontWeight: "500" }}>
        {books.slice(16, 24).map((book, i) => <BookSpine key={book._id} book={book} index={i + 16} />)}
      </div>

      <button onClick={() => navigate("/book-selection")} className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold z-50 transition-transform hover:scale-110">+</button>
    </div>
  );
}

function getBookColor(i) {
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
  return colors[i % colors.length];
}