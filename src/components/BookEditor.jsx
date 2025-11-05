import React, { useEffect, useState } from "react";

/**
 * Props:
 * - templateMeta: { id, title, color }
 * - onBack()
 */
export default function BookEditor({ templateMeta, onBack }) {
  const [title, setTitle] = useState(templateMeta?.title || "Untitled Journal");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState([]);

  // 🧠 Load saved entries
  useEffect(() => {
    const key = `journal:${templateMeta?.id || "default"}`;
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    setEntries(saved);
  }, [templateMeta]);

  // 💾 Save new entry
  function saveEntry() {
    const key = `journal:${templateMeta?.id || "default"}`;
    const newEntry = {
      id: Date.now(),
      title,
      content,
      date: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setContent("");
  }

  // 🗑️ Delete entry
  function deleteEntry(id) {
    const key = `journal:${templateMeta?.id || "default"}`;
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  // ✨ Handle Book button click (for future 3D animation)
  function handleBookClick() {
    console.log("📘 Book button clicked — animation coming soon!");
    // In next step, we'll trigger the Three.js book opening animation here
  }

  return (
    <div style={{ padding: 20, minHeight: "100vh", backgroundColor: "#0f172a" }}>
      {/* --- HEADER BAR --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Design Your Journal Cover</h1>

        {/* 📘 Book Button */}
        <button
          onClick={handleBookClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-200"
        >
          Book
        </button>
      </div>

      {/* --- BACK + JOURNAL INFO --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={onBack}
          className="px-3 py-1 rounded-md border text-white border-gray-400"
        >
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              background: `#${templateMeta?.color?.toString(16) || "9b5de5"}`,
              borderRadius: 4,
            }}
          />
          <h2 style={{ margin: 0, color: "#e6eef8" }}>
            {templateMeta?.title || "Journal"}
          </h2>
        </div>
      </div>

      {/* --- MAIN SECTION --- */}
      <div style={{ marginTop: 18, display: "flex", gap: 20 }}>
        {/* Left Panel — Writing Area */}
        <div style={{ flex: 1 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-800 text-white"
            placeholder="Entry title"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your journal entry..."
            style={{
              marginTop: 10,
              width: "100%",
              minHeight: 220,
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#1e293b",
              color: "white",
            }}
          />
          <div style={{ marginTop: 10 }}>
            <button
              onClick={saveEntry}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Save Entry
            </button>
          </div>
        </div>

        {/* Right Panel — Saved Entries */}
        <div style={{ width: 340 }}>
          <h3 style={{ color: "#9fb4d9" }}>Saved Entries</h3>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {entries.length === 0 && (
              <div style={{ color: "#94a3b8" }}>No entries yet.</div>
            )}
            {entries.map((e) => (
              <div
                key={e.id}
                style={{
                  background: "#1e293b",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <strong style={{ color: "#e6eef8" }}>{e.title}</strong>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    className="text-sm px-2 py-1 rounded-md border border-gray-400 text-gray-300 hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
                <div
                  style={{
                    color: "#cbd5e1",
                    marginTop: 6,
                    fontSize: 13,
                  }}
                >
                  {new Date(e.date).toLocaleString()}
                </div>
                <p style={{ color: "#cbd5e1", marginTop: 6 }}>
                  {e.content.slice(0, 180)}
                  {e.content.length > 180 ? "…" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
