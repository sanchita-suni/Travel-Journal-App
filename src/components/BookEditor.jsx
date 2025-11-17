import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// --- STICKERS ---
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
  const fonts = ["Georgia", "Serif", "Sans-serif", "Monospace", "Dancing Script", "Pacifico", "Great Vibes", "Parisienne", "Satisfy", "Cookie", "Caveat", "Shadows Into Light", "Lobster", "Amatic SC", "Patrick Hand", "Gloria Hallelujah", "Playfair Display"];
  return (
    <div className="relative w-full">
      <button onClick={() => setOpen(!open)} className="w-full bg-white text-black px-3 py-2 rounded shadow flex justify-between items-center" style={{ fontFamily: currentFont }}>
        {currentFont} <span>▼</span>
      </button>
      {open && (
        <div className="absolute bg-white shadow w-full max-h-60 overflow-y-auto rounded z-50 text-black">
          {fonts.map((font) => (
            <div key={font} onClick={() => { onSelect(font); setOpen(false); }} className="px-3 py-2 hover:bg-gray-200 cursor-pointer" style={{ fontFamily: font }}>{font}</div>
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
  const q = new URLSearchParams(location.search);

  // --- STATE ---
  const isOwner = id === 'new' || location.state?.mode === 'edit';
  const [showInfo, setShowInfo] = useState(!isOwner);

  const [coverImg, setCoverImg] = useState(location.state?.cover || q.get("cover") || "");
  const [title, setTitle] = useState(location.state?.title || q.get("title") || `Untitled Journal`);
  const [description, setDescription] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  const [pageIndex, setPageIndex] = useState(0);
  const [pageContent, setPageContent] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // ⭐ STYLE PERSISTENCE
  const [pageStyles, setPageStyles] = useState({}); 
  const [activePage, setActivePage] = useState(0); // Tracks which page (left/right) we are editing

  const [stickers, setStickers] = useState([]);
  const [showStickers, setShowStickers] = useState(false);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [movingStickerId, setMovingStickerId] = useState(null);
  const [resizingStickerId, setResizingStickerId] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  
  const stickerList = [sticker1, sticker2, sticker3, sticker4, sticker5, sticker6, sticker7, sticker8, sticker9, sticker10, sticker11];
  
  // UI CONTROLS (These reflect the active page)
  const [currentFont, setCurrentFont] = useState("Georgia");
  const [fontSize, setFontSize] = useState(18);
  const [textColor, setTextColor] = useState("#000000");
  
  const leftEditorRef = useRef(null);
  const rightEditorRef = useRef(null);
  const pageRef = useRef(null);
  const totalPages = 10;

  // Mapping for CSS fonts
  const fontFamilyMap = {
    Poppins: "'Poppins', sans-serif", Inter: "'Inter', sans-serif", "Times New Roman": "'Times New Roman', serif",
    Georgia: "Georgia, serif", Arial: "Arial, sans-serif", "Courier New": "'Courier New', monospace", "Snell Roundhand": "'Snell Roundhand', cursive",
  };

  // Load Google Fonts
  useEffect(() => {
      const href = "https://fonts.googleapis.com/css2?family=Dancing+Script&family=Pacifico&family=Great+Vibes&family=Parisienne&family=Satisfy&family=Cookie&family=Caveat:wght@400;700&family=Shadows+Into+Light&family=Playfair+Display:wght@400;600&family=Lobster&family=Amatic+SC:wght@400;700&family=Patrick+Hand&family=Gloria+Hallelujah&display=swap";
      if (!document.querySelector(`link[href="${href}"]`)) { const link = document.createElement("link"); link.href = href; link.rel = "stylesheet"; document.head.appendChild(link); }
  }, []);

  // --- LOAD DATA ---
  useEffect(() => {
    if (!id || id === 'new') return;
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/${id}`);
        const data = await res.json();
        if(data) {
            setTitle(data.title || ""); 
            setDescription(data.description || ""); 
            setPlaceName(data.placeName || ""); 
            setIsPublic(data.isPublic); 
            setTags(data.tags ? data.tags.join(",") : "");
            
            let loadedCover = "";
            if (data.imageUrl) loadedCover = `http://localhost:5000${data.imageUrl}`;
            else if (data.bookData?.cover) loadedCover = data.bookData.cover;
            setCoverImg(loadedCover);

            if(data.bookData) {
                if(data.bookData.pages) setPageContent(data.bookData.pages);
                if(data.bookData.stickers) setStickers(data.bookData.stickers);
                // ⭐ Load Styles
                if(data.bookData.styles) setPageStyles(data.bookData.styles);
            }
        }
      } catch(e) { console.error(e); }
    };
    fetchBook();
  }, [id]);

  // --- SYNC TOOLBAR WHEN PAGE FLIPS OR CLICKED ---
  useEffect(() => {
      // Get style of whichever page is "active" (focused)
      // Default to right page (pageIndex) if nothing focused yet
      const targetIndex = activePage !== null ? activePage : pageIndex;
      const style = pageStyles[targetIndex] || {};
      
      setCurrentFont(style.font || "Georgia");
      setFontSize(style.size || 18);
      setTextColor(style.color || "#000000");
  }, [activePage, pageIndex, pageStyles]);

  // --- STYLE HELPERS ---
  const updatePageStyle = (idx, newStyle) => {
      setPageStyles(prev => ({
          ...prev,
          [idx]: { ...prev[idx], ...newStyle }
      }));
  };

  // Handlers for Toolbar
  const handleFontChange = (val) => {
      setCurrentFont(val);
      updatePageStyle(activePage, { font: val });
  };
  const handleSizeChange = (val) => {
      setFontSize(val);
      updatePageStyle(activePage, { size: val });
  };
  const handleColorChange = (val) => {
      setTextColor(val);
      updatePageStyle(activePage, { color: val });
  };

  // Helper to get style object for <textarea>
  const getStyleForPage = (idx) => {
      const style = pageStyles[idx] || {};
      return {
          fontFamily: fontFamilyMap[style.font || "Georgia"] || style.font,
          fontSize: (style.size || 18) + "px",
          color: style.color || "#000000",
      };
  };

  // --- ACTIONS ---
  const flip = (dir) => { 
      if(dir === 1 && pageIndex < totalPages - 2) {
          const next = pageIndex + 2;
          setPageIndex(next); 
          setActivePage(next); // Auto-focus right page
      }
      else if(dir === -1 && pageIndex > 0) {
          const prev = pageIndex - 2;
          setPageIndex(prev);
          setActivePage(prev); // Auto-focus right page
      }
      else if(dir === -1 && pageIndex===0) navigate(isOwner ? "/library" : "/public"); 
  };

  const handlePageContentChange = (idx, value) => {
      setPageContent(prev => ({ ...prev, [idx]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { alert("Please log in."); setIsSaving(false); return; }
      const formData = new FormData();
      formData.append("title", title); formData.append("description", description); formData.append("placeName", placeName); formData.append("isPublic", isPublic); formData.append("tags", tags);
      if(imageFile) formData.append("image", imageFile);
      
      // Save everything including styles
      formData.append("bookData", JSON.stringify({ 
          pages: pageContent, 
          stickers, 
          cover: coverImg,
          styles: pageStyles // ⭐ Saved!
      }));

      const url = (id && id !== 'new') ? `http://localhost:5000/api/posts/${id}` : "http://localhost:5000/api/posts";
      const method = (id && id !== 'new') ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Authorization": `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if(data.success) alert("Saved!"); else alert(data.message);
    } catch(e) { alert(e.message); } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
      if(!window.confirm("Delete this journal?")) return;
      try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/posts/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
          const data = await res.json();
          if(data.success) { alert("Deleted"); navigate("/library"); } else { alert(data.message); }
      } catch(e) { alert(e.message); }
  };

  // --- STICKERS ---
  const addSticker = (src) => { if(!isOwner) return; setStickers((prev) => [...prev, { id: Date.now(), src, x: 50, y: 50, scale: 1, rotation: 0 }]); };
  const moveSticker = useCallback((e) => { if (!isOwner || (!movingStickerId && !resizingStickerId)) return; if (!pageRef.current) return; const dx = e.clientX - lastMouse.current.x; const dy = e.clientY - lastMouse.current.y; lastMouse.current = { x: e.clientX, y: e.clientY }; setStickers((prev) => prev.map((s) => { if (s.id === movingStickerId) return { ...s, x: s.x + (dx / pageRef.current.clientWidth) * 100, y: s.y + (dy / pageRef.current.clientHeight) * 100 }; if (s.id === resizingStickerId) { if (resizeHandle !== "rotate") return { ...s, scale: Math.max(0.2, s.scale + dx * 0.01) }; return { ...s, rotation: s.rotation + dx * 0.5 }; } return s; })); }, [movingStickerId, resizingStickerId, resizeHandle, isOwner]);
  useEffect(() => { document.addEventListener("mousemove", moveSticker); document.addEventListener("mouseup", () => { setMovingStickerId(null); setResizingStickerId(null); }); return () => document.removeEventListener("mousemove", moveSticker); }, [moveSticker]);


  return (
    <div className="w-full h-screen flex bg-blue-900 text-white overflow-hidden relative">
       <button onClick={() => navigate(isOwner ? "/library" : "/public")} className="absolute top-6 left-6 bg-blue-600 px-4 py-2 rounded shadow z-50 hover:bg-blue-500">← Back</button>
       <button onClick={() => setShowInfo(!showInfo)} className="absolute top-6 right-6 z-50 text-2xl bg-white/20 hover:bg-white/40 w-10 h-10 rounded-full flex items-center justify-center">ℹ️</button>

       <div className={`${isOwner ? "w-3/4" : "w-full"} h-full flex flex-col items-center justify-center transition-all duration-300`}>
          <h1 className="text-3xl font-bold mb-4">{isOwner ? "✏️ " : "📖 "} {title}</h1>
          
          <div ref={pageRef} className="w-[85%] h-[85%] bg-white rounded-lg shadow-xl flex relative overflow-hidden" onMouseDown={() => setActiveStickerId(null)}>
             
             {/* LEFT PAGE */}
             <div className="w-1/2 border-r-4 border-gray-300 bg-amber-50 p-6 overflow-hidden relative">
                {pageIndex === 0 ? 
                   (coverImg ? <img src={coverImg} className="w-full h-full object-cover" alt="cover" /> : <div className="flex items-center justify-center h-full text-gray-400">No Cover</div>)
                   : 
                   <textarea
                      dir="ltr"
                      className={`w-full h-full bg-transparent p-3 outline-none resize-none ${activePage === pageIndex - 1 ? "ring-2 ring-blue-200" : ""}`}
                      style={getStyleForPage(pageIndex - 1)}
                      value={pageContent[pageIndex - 1] || ""}
                      onChange={(e) => handlePageContentChange(pageIndex - 1, e.target.value)}
                      readOnly={!isOwner}
                      placeholder={isOwner ? "Dear Diary..." : ""}
                      onFocus={() => setActivePage(pageIndex - 1)}
                   />
                }
             </div>
             
             {/* RIGHT PAGE */}
             <div className="w-1/2 bg-amber-50 p-6 relative overflow-hidden">
                <textarea
                   dir="ltr"
                   className={`w-full h-full bg-transparent p-3 outline-none resize-none ${activePage === pageIndex ? "ring-2 ring-blue-200" : ""}`}
                   style={getStyleForPage(pageIndex)}
                   value={pageContent[pageIndex] || ""}
                   onChange={(e) => handlePageContentChange(pageIndex, e.target.value)}
                   readOnly={!isOwner}
                   placeholder={isOwner ? "Start typing..." : ""}
                   onFocus={() => setActivePage(pageIndex)}
                />
                {stickers.map(s => (
                    <div key={s.id} style={{position:'absolute', top:`${s.y}%`, left:`${s.x}%`, transform:`translate(-50%, -50%) scale(${s.scale}) rotate(${s.rotation}deg)`, cursor: isOwner ? 'grab' : 'default'}} onMouseDown={(e)=>{ if(!isOwner) return; e.stopPropagation(); setActiveStickerId(s.id); setMovingStickerId(s.id); lastMouse.current={x:e.clientX, y:e.clientY}}}>
                        <img src={s.src} draggable={false} style={{width:90, height:90}}/>
                         {isOwner && s.id === activeStickerId && <div style={{position:'absolute', border:'2px dashed blue', width:'100%', height:'100%', top:0, left:0}}><div onMouseDown={(e)=>{e.stopPropagation(); setActiveStickerId(s.id); setResizingStickerId(s.id); setResizeHandle('se'); lastMouse.current={x:e.clientX, y:e.clientY}}} style={{position:'absolute', bottom:-5, right:-5, width:15, height:15, background:'blue'}}/></div>}
                    </div>
                ))}
             </div>
          </div>

          <div className="flex justify-between w-3/4 mt-5">
              <button onClick={()=>flip(-1)} className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50" disabled={pageIndex===0}>Prev</button>
              <p>Page {pageIndex + 1} & {pageIndex + 2}</p>
              <button onClick={()=>flip(1)} className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50" disabled={pageIndex >= totalPages-2}>Next</button>
          </div>
       </div>

       {isOwner && (
           <div className="w-1/4 h-full bg-blue-800 p-5 overflow-y-auto space-y-5 border-l border-blue-700 z-40">
              <div className="flex gap-2"><button onClick={handleSave} disabled={isSaving} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded font-bold shadow">{isSaving ? "Saving..." : "SAVE"}</button>{id && id !== 'new' && <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 rounded font-bold shadow">🗑</button>}</div>
              <div className="bg-blue-900/50 p-4 rounded-lg space-y-3">
                  <h3 className="font-bold text-yellow-300">Details</h3>
                  <input className="w-full text-black p-1 rounded" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"/>
                  <textarea className="w-full text-black p-1 rounded" rows="3" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description"/>
                  <input className="w-full text-black p-1 rounded" value={placeName} onChange={e=>setPlaceName(e.target.value)} placeholder="Location"/>
                  <div className="flex gap-2"><input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)}/><label>Public</label></div>
                  <div className="text-xs text-gray-300 mt-2">Cover:</div>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-xs text-gray-300" />
              </div>
              
              <div><p>Font</p><FontDropdown currentFont={currentFont} onSelect={handleFontChange}/></div>
              
              <div>
                  <p>Size</p>
                  <input type="range" min="10" max="50" value={fontSize} onChange={e=>handleSizeChange(Number(e.target.value))}/>
              </div>

              <div>
                  <p className="mb-1">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {["#000000", "#FFFFFF", "#800080", "#FF0000", "#FFD700", "#0066FF"].map((c) => (
                      <button key={c} onClick={() => handleColorChange(c)} className="w-6 h-6 rounded-full border border-white" style={{background:c}} />
                    ))}
                    <input type="color" value={textColor} onChange={e=>handleColorChange(e.target.value)} className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden"/>
                  </div>
              </div>

              <button onClick={()=>setShowStickers(true)} className="w-full bg-yellow-500 py-2 rounded text-black font-bold">Add Sticker</button>
           </div>
       )}

       {showInfo && (
         <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40" onClick={() => setShowInfo(false)}>
            <div className="bg-white text-black p-8 rounded-xl max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
               <button className="absolute top-4 right-4 text-2xl hover:text-red-500" onClick={() => setShowInfo(false)}>×</button>
               <h2 className="text-2xl font-bold mb-2">{title}</h2>
               {placeName && <p className="text-blue-600 font-semibold mb-4">📍 {placeName}</p>}
               <p className="text-gray-700 leading-relaxed mb-4">{description || "No description provided."}</p>
               {tags && <div className="flex flex-wrap gap-2">{tags.split(',').map(t => t.trim() && <span key={t} className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-600">#{t}</span>)}</div>}
            </div>
         </div>
       )}

       {showStickers && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-5 rounded max-w-md grid grid-cols-4 gap-4"><button className="absolute top-2 right-2 text-black" onClick={()=>setShowStickers(false)}>X</button>{stickerList.map((s,i)=><img key={i} src={s} onClick={()=>{addSticker(s); setShowStickers(false)}} className="w-12 h-12 cursor-pointer hover:scale-110"/>)}</div></div>}
    </div>
  );
}