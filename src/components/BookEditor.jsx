// BookEditor.jsx — PART 1 of 3 (BACKWARD TYPING FIX INCLUDED)
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import stickerIcon from "../assets/stickers/stickers-icon.png";
import sticker1 from "../assets/stickers/sticker1.png";
import sticker2 from "../assets/stickers/sticker2.png";
import sticker3 from "../assets/stickers/sticker3.png";
import sticker4 from "../assets/stickers/sticker4.png";
import sticker5 from "../assets/stickers/sticker5.png";
import sticker6 from "../assets/stickers/sticker6.png";
import sticker7 from "../assets/stickers/sticker7.png";
import sticker8 from "../assets/stickers/sticker8.png";
import sticker9 from "../assets/stickers/sticker9.png";
import sticker10 from "../assets/stickers/sticker10.png";
import sticker11 from "../assets/stickers/sticker11.png";

function FontDropdown({ currentFont, onSelect }) {
  const [open, setOpen] = useState(false);

  const fonts = [
    "Georgia", "Serif", "Sans-serif", "Monospace",
    "Dancing Script", "Pacifico", "Great Vibes", "Parisienne",
    "Satisfy", "Cookie", "Caveat", "Shadows Into Light",
    "Lobster", "Amatic SC", "Patrick Hand", "Gloria Hallelujah",
    "Playfair Display"
  ];

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white text-black px-3 py-2 rounded shadow flex justify-between"
        style={{ fontFamily: currentFont }}
      >
        {currentFont}
        <span>▼</span>
      </button>

      {open && (
        <div className="absolute w-full bg-white rounded shadow max-h-60 overflow-y-auto z-50">
          {fonts.map((font) => (
            <div
              key={font}
              onClick={() => {
                onSelect(font);
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
              style={{ fontFamily: font, color: "black" }}
            >
              {font}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const coverImg = location.state?.cover || query.get("cover");
  const title = location.state?.title || query.get("title") || `Book #${id}`;

  const totalPages = 10;
  const [pageIndex, setPageIndex] = useState(0);
  const [pageContent, setPageContent] = useState({});

  const leftEditorRef = useRef(null);
  const rightEditorRef = useRef(null);
  const pageRef = useRef(null);

  const [currentFont, setCurrentFont] = useState("Georgia");
  const [fontSize, setFontSize] = useState(18);
  const [textColor, setTextColor] = useState("#000");

  const stickerList = [
    sticker1, sticker2, sticker3, sticker4, sticker5, sticker6,
    sticker7, sticker8, sticker9, sticker10, sticker11
  ];

  const [stickers, setStickers] = useState([]);
  const [showStickers, setShowStickers] = useState(false);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [movingStickerId, setMovingStickerId] = useState(null);
  const [resizingStickerId, setResizingStickerId] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);

  const lastMouse = useRef({ x: 0, y: 0 });

  /* ----------------------------------------------
     LOAD GOOGLE FONTS
  ---------------------------------------------- */
  useEffect(() => {
    const href =
      "https://fonts.googleapis.com/css2?family=Dancing+Script&family=Pacifico&family=Great+Vibes&family=Parisienne&family=Satisfy&family=Cookie&family=Caveat:wght@400;700&family=Shadows+Into+Light&family=Playfair+Display:wght@400;600&family=Lobster&family=Amatic+SC:wght@400;700&family=Patrick+Hand&family=Gloria+Hallelujah&display=swap";

    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }

    try {
      document.execCommand("styleWithCSS", false, true);
    } catch (_) {}
  }, []);

  /* ----------------------------------------------
     HARD BACKWARD-TYPING FIX (🔥 ALWAYS LTR)
  ---------------------------------------------- */
  useEffect(() => {
    const enforceDeepLTR = () => {
      const eds = [leftEditorRef.current, rightEditorRef.current];

      eds.forEach((ed) => {
        if (!ed) return;

        ed.style.direction = "ltr";
        ed.style.unicodeBidi = "plaintext";
        ed.setAttribute("dir", "ltr");

        ed.querySelectorAll("*").forEach((el) => {
          el.style.direction = "ltr";
          el.style.unicodeBidi = "plaintext";
          el.setAttribute("dir", "ltr");
        });
      });
    };

    document.addEventListener("input", enforceDeepLTR);
    return () => document.removeEventListener("input", enforceDeepLTR);
  }, []);

  /* ----------------------------------------------
     EDITOR HELPERS
  ---------------------------------------------- */
  const getActiveEditor = () => {
    if (document.activeElement === rightEditorRef.current) return rightEditorRef.current;
    if (document.activeElement === leftEditorRef.current) return leftEditorRef.current;
    return rightEditorRef.current;
  };

  const updateContent = () => {
    const ed = getActiveEditor();
    if (!ed) return;
    const idx = Number(ed.dataset.pageidx);
    setPageContent((p) => ({ ...p, [idx]: ed.innerHTML }));
  };
// BookEditor.jsx — PART 2 of 3

  /* ----------------------------------------------
     TEXT FORMAT FUNCTIONS
  ---------------------------------------------- */
  const applyFont = (font) => {
    setCurrentFont(font);
    document.execCommand("fontName", false, font);
    updateContent();
  };

  const applyColor = (color) => {
    setTextColor(color);
    document.execCommand("foreColor", false, color);
    updateContent();
  };

  const applyFontSizeToSelection = () => {
    document.execCommand("fontSize", false, 7);
    const ed = getActiveEditor();
    if (ed) {
      ed.querySelectorAll("font").forEach((f) => {
        f.style.fontSize = fontSize + "px";
      });
      updateContent();
    }
  };

  /* ----------------------------------------------
     PAGE FLIP
  ---------------------------------------------- */
  const flip = (dir) => {
    if (dir === 1 && pageIndex < totalPages - 2) setPageIndex((p) => p + 2);
    else if (dir === -1 && pageIndex > 0) setPageIndex((p) => p - 2);
    else if (dir === -1 && pageIndex === 0) navigate("/library");
  };

  /* ----------------------------------------------
     SYNC EDITORS ON PAGE CHANGE
  ---------------------------------------------- */
  useEffect(() => {
    if (leftEditorRef.current) {
      const el = leftEditorRef.current;
      el.dataset.pageidx = pageIndex - 1;
      el.innerHTML = pageContent[pageIndex - 1] || "";
      el.style.fontFamily = currentFont;
      el.style.direction = "ltr";
      el.style.unicodeBidi = "plaintext";
    }

    if (rightEditorRef.current) {
      const el = rightEditorRef.current;
      el.dataset.pageidx = pageIndex;
      el.innerHTML = pageContent[pageIndex] || "";
      el.style.fontFamily = currentFont;
      el.style.direction = "ltr";
      el.style.unicodeBidi = "plaintext";
    }
  }, [pageIndex, pageContent, currentFont]);

  /* ----------------------------------------------
     ADD STICKER
  ---------------------------------------------- */
  const addSticker = (src) => {
    setStickers((prev) => [
      ...prev,
      { id: Date.now(), src, x: 50, y: 50, scale: 1, rotation: 0 }
    ]);
  };

  /* ----------------------------------------------
     STICKER DRAG/RESIZE/ROTATE
  ---------------------------------------------- */
  const startDrag = (id, e) => {
    e.stopPropagation();
    setActiveStickerId(id);
    setMovingStickerId(id);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const startResize = (id, handle, e) => {
    e.stopPropagation();
    setActiveStickerId(id);
    setResizingStickerId(id);
    setResizeHandle(handle);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const startRotate = (id, e) => {
    e.stopPropagation();
    setActiveStickerId(id);
    setResizingStickerId(id);
    setResizeHandle("rotate");
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const moveSticker = useCallback(
    (e) => {
      if (!movingStickerId && !resizingStickerId) return;
      if (!pageRef.current) return;

      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      setStickers((prev) =>
        prev.map((s) => {
          if (s.id === movingStickerId) {
            return {
              ...s,
              x: s.x + (dx / pageRef.current.clientWidth) * 100,
              y: s.y + (dy / pageRef.current.clientHeight) * 100
            };
          }

          if (s.id === resizingStickerId) {
            if (resizeHandle !== "rotate") {
              return {
                ...s,
                scale: Math.max(0.2, s.scale + dx * 0.01)
              };
            }
            return { ...s, rotation: s.rotation + dx * 0.5 };
          }

          return s;
        })
      );
    },
    [movingStickerId, resizingStickerId, resizeHandle]
  );

  const stopTransform = useCallback(() => {
    setMovingStickerId(null);
    setResizingStickerId(null);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", moveSticker);
    document.addEventListener("mouseup", stopTransform);
    return () => {
      document.removeEventListener("mousemove", moveSticker);
      document.removeEventListener("mouseup", stopTransform);
    };
  }, [moveSticker, stopTransform]);

  const handlePageClick = (e) => {
    if (e.target.dataset.sticker) return;
    setActiveStickerId(null);
  };

  const handleStyle = (x, y) => ({
    position: "absolute",
    width: "14px",
    height: "14px",
    background: "white",
    border: "2px solid blue",
    borderRadius: "4px",
    transform: `translate(${x}%, ${y}%)`,
    cursor: "nwse-resize"
  });

  const rotateStyle = (x, y) => ({
    position: "absolute",
    width: "20px",
    height: "20px",
    background: "#FFB800",
    border: "2px solid white",
    borderRadius: "50%",
    transform: `translate(${x}%, ${y}%)`,
    cursor: "grab"
  });

  const renderSticker = (s) => {
    const active = s.id === activeStickerId;
    return (
      <div
        key={s.id}
        data-sticker="1"
        style={{
          position: "absolute",
          top: `${s.y}%`,
          left: `${s.x}%`,
          transform: `translate(-50%, -50%) scale(${s.scale}) rotate(${s.rotation}deg)`,
          transformOrigin: "center",
          cursor: "pointer"
        }}
        onDoubleClick={() => setActiveStickerId(s.id)}
      >
        <img
          src={s.src}
          data-sticker="1"
          draggable={false}
          onMouseDown={(e) => startDrag(s.id, e)}
          style={{ width: "90px", height: "90px", userSelect: "none" }}
        />

        {active && (
          <>
            <div data-sticker="1" onMouseDown={(e) => startResize(s.id, "nw", e)} style={handleStyle(-50, -50)} />
            <div data-sticker="1" onMouseDown={(e) => startResize(s.id, "ne", e)} style={handleStyle(50, -50)} />
            <div data-sticker="1" onMouseDown={(e) => startResize(s.id, "sw", e)} style={handleStyle(-50, 50)} />
            <div data-sticker="1" onMouseDown={(e) => startResize(s.id, "se", e)} style={handleStyle(50, 50)} />
            <div data-sticker="1" onMouseDown={(e) => startRotate(s.id, e)} style={rotateStyle(0, -80)} />
          </>
        )}
      </div>
    );
  };
// BookEditor.jsx — PART 3 of 3 (END OF FILE)

  return (
    <div
      className="w-full h-screen flex bg-blue-900 text-white overflow-hidden"
      style={{ direction: "ltr" }}
    >

      <button
        onClick={() => navigate("/library")}
        className="absolute top-6 left-6 bg-blue-600 px-4 py-2 rounded shadow z-50"
      >
        ← Back
      </button>

      <div className="w-3/4 h-full flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">📘 {title}</h1>

        <div
          ref={pageRef}
          className="w-[85%] h-[85%] bg-white rounded-lg shadow-xl flex relative overflow-hidden"
          onMouseDown={handlePageClick}
        >

          {/* LEFT PAGE */}
          <div className="w-1/2 border-r-4 border-gray-300 bg-amber-50 p-6">
            {pageIndex === 0 ? (
              <img src={coverImg} className="w-full h-full object-cover" />
            ) : (
              <div
                ref={leftEditorRef}
                contentEditable
                suppressContentEditableWarning
                data-pageidx={pageIndex - 1}
                onInput={updateContent}
                className="w-full h-full p-3 text-black leading-relaxed"
                style={{
  
                  fontFamily: currentFont,
  
                  fontSize,
  
                  color: textColor,
  
                  direction: "ltr",
  
                  unicodeBidi: "plaintext",
  
                  textAlign: "left",

  
                  whiteSpace: "pre-wrap",
  
                  overflowWrap: "normal",
  
                  WebkitLineBreak: "auto",

                }}

              />
            )}
          </div>

          {/* RIGHT PAGE */}
          <div className="w-1/2 bg-amber-50 p-6 relative">
            <div
              ref={rightEditorRef}
              contentEditable
              suppressContentEditableWarning
              data-pageidx={pageIndex}
              onInput={updateContent}
              className="w-full h-full p-3 text-black leading-relaxed"
              style={{
                fontFamily: currentFont,
                fontSize,
                color: textColor,
                direction: "ltr",
                unicodeBidi: "plaintext",
                textAlign: "left",

                whiteSpace: "pre-wrap",
                overflowWrap: "normal",
                WebkitLineBreak: "auto",
              }}

            />

            {stickers.map((s) => renderSticker(s))}
          </div>
        </div>

        <div className="flex justify-between w-3/4 mt-5">
          <button
            onClick={() => flip(-1)}
            disabled={pageIndex === 0}
            className="bg-blue-600 px-4 py-2 rounded disabled:bg-gray-600"
          >
            ← Prev
          </button>

          <p>Page {pageIndex + 1} & {pageIndex + 2}</p>

          <button
            onClick={() => flip(1)}
            disabled={pageIndex >= totalPages - 2}
            className="bg-blue-600 px-4 py-2 rounded disabled:bg-gray-600"
          >
            Next →
          </button>
        </div>
      </div>

      {/* TOOLS PANEL */}
      <div className="w-1/4 h-full bg-blue-800 p-5 space-y-5 overflow-y-auto">

        <div>
          <p className="font-semibold mb-1">Font</p>
          <FontDropdown currentFont={currentFont} onSelect={applyFont} />
        </div>

        <div>
          <p className="font-semibold mb-1">Font Size: {fontSize}px</p>
          <div className="flex gap-3 items-center">
            <input
              type="range"
              min="12"
              max="50"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={applyFontSizeToSelection}
              className="bg-green-500 px-3 py-2 rounded"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-1">Text Color</p>
          <div className="flex gap-3">
            <input
              type="color"
              value={textColor}
              onChange={(e) => applyColor(e.target.value)}
              className="w-12 h-12 rounded"
            />

            <div className="grid grid-cols-4 gap-2">
              {[
                "#000000", "#FF0000", "#0000FF", "#008000",
                "#FFA500", "#800080", "#FFC0CB", "#FFFFFF"
              ].map((c) => (
                <button
                  key={c}
                  className="w-8 h-8 rounded border border-white"
                  style={{ background: c }}
                  onClick={() => applyColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            document.execCommand("removeFormat");
            updateContent();
          }}
          className="bg-red-500 px-3 py-2 rounded"
        >
          Clear
        </button>

        <div className="pt-4 border-t border-blue-700">
          <p className="font-semibold text-center mb-2">Stickers</p>
          <button
            onClick={() => setShowStickers(true)}
            className="w-16 h-16 bg-yellow-500 rounded-full mx-auto flex items-center justify-center"
          >
            <img src={stickerIcon} className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* STICKER POPUP */}
      {showStickers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl relative w-[90%] max-w-md">
            <button
              className="absolute top-3 right-3 text-3xl"
              onClick={() => setShowStickers(false)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-center mb-4 text-black">Stickers</h2>

            <div className="grid grid-cols-3 gap-4">
              {stickerList.map((img, i) => (
                <div
                  key={i}
                  onClick={() => {
                    addSticker(img);
                    setShowStickers(false);
                  }}
                  className="bg-gray-200 p-3 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105"
                >
                  <img src={img} className="w-16 h-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
