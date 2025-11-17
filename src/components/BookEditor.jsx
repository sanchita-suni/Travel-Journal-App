import React, { useState, useRef, useMemo, Suspense, useCallback, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/* ✅ Right Page with strong folding animation */
function RightPage({ width, height, segX, segY, foldValue, texture }) {
  const meshRef = useRef();
  const geometryRef = useRef();
  const originalPositions = useRef(null);

  const geom = useMemo(
    () => new THREE.PlaneBufferGeometry(width, height, segX, segY),
    [width, height, segX, segY]
  );

  React.useEffect(() => {
    const pos = geom.attributes.position.array;
    originalPositions.current = new Float32Array(pos.length);
    originalPositions.current.set(pos);
    geometryRef.current = geom;
  }, [geom]);

  useFrame(() => {
    const mesh = meshRef.current;
    const geometry = geometryRef.current;
    const orig = originalPositions.current;
    if (!mesh || !geometry || !orig) return;

    const pos = geometry.attributes.position.array;
    const w = width;
    const h = height;
    const f = Math.max(0, Math.min(1, foldValue));

    const amplitude = 0.4 * w * f;
    const foldPower = 2.4;
    const rotationY = -f * Math.PI * 0.5;

    for (let i = 0; i < pos.length; i += 3) {
      const ox = orig[i];
      const oy = orig[i + 1];
      const xNorm = (ox + w / 2) / w;
      const foldFactor = Math.pow(xNorm, foldPower);
      const theta = Math.PI * xNorm;
      const z = -Math.sin(theta) * amplitude * foldFactor;
      const yNorm = (oy + h / 2) / h;
      const edgeFade = 1 - Math.abs(0.5 - yNorm) * 0.8;

      pos[i] = ox;
      pos[i + 1] = oy;
      pos[i + 2] = z * edgeFade;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    mesh.rotation.y = rotationY;
    mesh.rotation.x = 0.02 * f;
    mesh.position.z = 0.03 * f;
  });

  return (
    <mesh ref={meshRef} geometry={geom} position={[1.1, 0, 0]}>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ✅ TextureLoader component to handle cover texture updates */
function BookWithTextures({
  coverImg,
  opened,
  handleOpenCover,
  pageIndex,
  setPageIndex,
  totalPages,
  flipState,
  foldValue,
  setFoldValue,
}) {
  // useLoader will handle errors internally, but we can add fallback paths
  const pageTexture = useLoader(TextureLoader, "/books/page-texture.jpg", undefined, (error) => {
    console.error("Error loading page texture:", error);
  });
  const coverTexture = useLoader(TextureLoader, coverImg, undefined, (error) => {
    console.error("Error loading cover texture:", error);
  });

  return (
    <BookScene
      opened={opened}
      handleOpenCover={handleOpenCover}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      totalPages={totalPages}
      flipState={flipState}
      foldValue={foldValue}
      setFoldValue={setFoldValue}
      pageTexture={pageTexture}
      coverTexture={coverTexture}
    />
  );
}

/* ✅ BookScene: now contains useFrame for flipping animation */
function BookScene({
  opened,
  handleOpenCover,
  pageIndex,
  setPageIndex,
  totalPages,
  flipState,
  foldValue,
  setFoldValue,
  pageTexture,
  coverTexture,
}) {
  const coverWidth = 2.2;
  const coverHeight = 1.5;
  const coverDepth = 0.06;

  // Handle flipping animation INSIDE Canvas
  useFrame(() => {
    const state = flipState.current;
    if (!state.active) return;

    const now = performance.now();
    const t = (now - state.startTime) / state.duration;
    const clamped = Math.min(1, Math.max(0, t));
    let fold;
    if (clamped <= 0.5) fold = easeInOutQuad(clamped / 0.5);
    else fold = easeInOutQuad((1 - clamped) / 0.5);
    setFoldValue(fold);

    if (!state.midTriggered && clamped >= 0.5) {
      state.midTriggered = true;
      setPageIndex((p) => {
        const next = p + (state.direction === 1 ? 2 : -2);
        if (next < 0) return 0;
        if (next > totalPages - 2) return totalPages - 2;
        return next;
      });
    }

    if (clamped >= 1) {
      state.active = false;
      state.midTriggered = false;
      setFoldValue(0);
    }
  });

  return (
    <>
      {/* 🌫️ Ambient + directional lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 2, -4]} intensity={0.6} />
      <spotLight position={[0, 5, 5]} angle={0.5} penumbra={1} intensity={1.2} />

      {/* 💡 Rim light */}
      <directionalLight position={[0, 0, -5]} intensity={0.8} color="#ffffff" />

      {/* 🪵 Wooden desk */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.9, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial
          map={useLoader(TextureLoader, "/books/wood-texture.jpg")}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 📚 Spine */}
      <mesh position={[0, 0, -coverDepth / 2]}>
        <boxGeometry args={[0.06, coverHeight + 0.02, coverDepth + 0.04]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* 🧾 Left page */}
      {opened && (
        <mesh position={[-1.1, 0, 0]}>
          <planeGeometry args={[coverWidth, coverHeight]} />
          {/* show the selected cover on the left page so selection is obvious */}
          <meshStandardMaterial map={coverTexture} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 📕 Closed cover */}
      {!opened && (
        <mesh position={[0, 0, coverDepth / 2]} onClick={handleOpenCover}>
          <boxGeometry args={[coverWidth, coverHeight, coverDepth]} />
          <meshStandardMaterial map={coverTexture} />
        </mesh>
      )}

      {/* 📖 Right page with fold */}
      {opened && (
        <RightPage
          width={coverWidth}
          height={coverHeight}
          segX={80}
          segY={50}
          foldValue={foldValue}
          texture={pageTexture}
        />
      )}

      {/* ✨ Environment + shadows */}
      <Environment preset="city" />
      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.4}
        scale={8}
        blur={2}
        far={2}
      />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

export default function BookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Try location.state first (navigation), then fallback to query params so the
  // selected cover persists across refresh/direct links.
  const search = new URLSearchParams(location.search || "");
  const coverFromQuery = search.get("cover");
  const titleFromQuery = search.get("title");
  const coverImg = location.state?.cover || coverFromQuery || "/covers/adventure.jpg";
  const title = location.state?.title || titleFromQuery || `Book #${id}`;

  const totalPages = 10;

  // Auto-open the book if a cover was selected from BookSelection page
  const hasSelectedCover = location.state?.cover || coverFromQuery;
  const [opened, setOpened] = useState(hasSelectedCover ? true : false);
  const [pageIndex, setPageIndex] = useState(0);
  const [foldValue, setFoldValue] = useState(0);
  // Store content for each page (right page only, since left page shows cover on first page)
  const [pageContent, setPageContent] = useState({});
  const [error, setError] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(1);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);

  // Force open the book when a cover is selected
  useEffect(() => {
    if (hasSelectedCover && !opened) {
      setOpened(true);
    }
  }, [hasSelectedCover, opened]);

  const flipState = useRef({
    active: false,
    startTime: 0,
    duration: 800,
    direction: 1,
    midTriggered: false,
  });

  const flip = (dir = 1) => {
    if (isFlipping) return; // Prevent multiple flips at once
    
    if (dir === 1) {
      // Next page
      if (pageIndex < totalPages - 2) {
        setIsFlipping(true);
        setFlipDirection(1);
        // Start flip animation - change page at midpoint
        setTimeout(() => {
          setPageIndex(pageIndex + 2);
          // End flip animation
          setTimeout(() => {
            setIsFlipping(false);
          }, 300);
        }, 300);
      }
    } else {
      // Previous page
      if (pageIndex > 0) {
        setIsFlipping(true);
        setFlipDirection(-1);
        // Start flip animation - change page at midpoint
        setTimeout(() => {
          setPageIndex(pageIndex - 2);
          // End flip animation
          setTimeout(() => {
            setIsFlipping(false);
          }, 300);
        }, 300);
      } else {
        // If at first page, go back to library
        navigate("/library");
      }
    }
  };

  const handleOpenCover = () => setOpened(true);

  // Stable handler for page content updates
  const handlePageContentChange = useCallback((pageIdx, value) => {
    setPageContent(prev => {
      const newContent = { ...prev };
      newContent[pageIdx] = value;
      return newContent;
    });
  }, []);

  const handleInsertSticker = (pageIdx, stickerToken) => {
    setPageContent(prev => {
      const newContent = { ...prev };
      const existing = newContent[pageIdx] || "";
      newContent[pageIdx] = existing + (existing ? "\n" : "") + stickerToken;
      return newContent;
    });
  };

  // Error boundary fallback
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700 text-white">
        <h1 className="text-2xl font-bold mb-4">Error loading book</h1>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => navigate("/library")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          ← Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-row bg-gradient-to-b from-blue-900 to-blue-700 text-white overflow-hidden">
      {/* 🔙 Back */}
      <button
        onClick={() => navigate("/library")}
        className="absolute top-6 left-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md z-50"
      >
        ← Back
      </button>

      {/* 📖 Book area */}
      <div className="w-3/4 h-full flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">📚 {title}</h1>

        <div 
          className="w-[85%] h-[85%] bg-white rounded-lg shadow-2xl flex flex-row relative overflow-hidden"
          style={{
            perspective: '1500px',
          }}
        >
          {/* Left page - Cover on first page, previous page content otherwise */}
          <div 
            className={`w-1/2 h-full flex flex-col border-r-4 border-gray-300 relative ${
              pageIndex === 0 ? '' : 'p-6 bg-gradient-to-b from-amber-50 to-amber-100'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'right center',
              transform: isFlipping && flipDirection === -1 ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s ease-in-out',
            }}
          >
            {pageIndex === 0 ? (
              <img 
                src={coverImg} 
                alt={title}
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.src = "/covers/adventure.jpg";
                }}
              />
            ) : (
              <textarea
                value={pageContent[pageIndex - 1] || ''}
                onChange={(e) => handlePageContentChange(pageIndex - 1, e.target.value)}
                placeholder="Previous page content..."
                className="w-full h-full bg-transparent p-4 resize-none focus:outline-none font-serif leading-relaxed"
                style={{
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textDecoration: isUnderline ? 'underline' : 'none',
                }}
              />
            )}
          </div>
          {/* Right page - Current page with textarea */}
          <div 
            className="w-1/2 h-full flex flex-col p-6 bg-gradient-to-b from-amber-50 to-amber-100 relative"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center',
              transform: isFlipping && flipDirection === 1 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s ease-in-out',
            }}
          >
            <textarea
              value={pageContent[pageIndex] || ''}
              onChange={(e) => handlePageContentChange(pageIndex, e.target.value)}
              placeholder="Start writing your journal entry here..."
              className="w-full h-full bg-transparent p-4 resize-none focus:outline-none font-serif leading-relaxed"
              style={{
                color: textColor,
                fontSize: `${fontSize}px`,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isUnderline ? 'underline' : 'none',
              }}
              autoFocus={pageIndex === 0 && !isFlipping}
            />
          </div>
          
          {/* Back button overlay */}
          <button
            onClick={() => navigate("/library")}
            className="absolute right-4 bottom-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-lg z-20 transition-transform hover:scale-105"
          >
            ← Back to Library
          </button>
        </div>

        {opened && (
          <div className="flex justify-between w-3/4 mt-4">
            <button
              onClick={() => flip(-1)}
              disabled={pageIndex === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-md shadow"
            >
              ← Prev
            </button>
            <p className="text-lg">
              Page {pageIndex + 1} & {pageIndex + 2}
            </p>
            <button
              onClick={() => flip(1)}
              disabled={pageIndex >= totalPages - 2}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-md shadow"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* 🛠️ Tools Panel */}
      <div className="w-1/4 h-full bg-gradient-to-b from-blue-700 to-blue-800 flex flex-col p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">🛠️ Tools</h2>
        
        {/* Text Color */}
        <div className="mb-4">
          <label className="block text-white text-sm font-semibold mb-2">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-white text-gray-800"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-4">
          <label className="block text-white text-sm font-semibold mb-2">Font Size: {fontSize}px</label>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Text Formatting */}
        <div className="mb-4">
          <label className="block text-white text-sm font-semibold mb-2">Formatting</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`px-4 py-2 rounded ${isBold ? 'bg-blue-500' : 'bg-blue-600'} hover:bg-blue-500 text-white font-bold transition`}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`px-4 py-2 rounded ${isItalic ? 'bg-blue-500' : 'bg-blue-600'} hover:bg-blue-500 text-white italic transition`}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`px-4 py-2 rounded ${isUnderline ? 'bg-blue-500' : 'bg-blue-600'} hover:bg-blue-500 text-white transition`}
              title="Underline"
            >
              <u>U</u>
            </button>
          </div>
        </div>

        {/* Quick Colors */}
        <div className="mb-4">
          <label className="block text-white text-sm font-semibold mb-2">Quick Colors</label>
          <div className="flex gap-2 flex-wrap">
            {['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#FFC0CB'].map((color) => (
              <button
                key={color}
                onClick={() => setTextColor(color)}
                className="w-8 h-8 rounded border-2 border-white hover:scale-110 transition"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Stickers */}
        <div className="mb-4">
          <label className="block text-white text-sm font-semibold mb-2">Stickers</label>
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4,5,6,7,8,9,10,11].map((num) => {
              const src = `/src/assets/stickers/sticker${num}.png`;
              const token = `[sticker${num}]`;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setSelectedSticker(num);
                    handleInsertSticker(pageIndex, token);
                  }}
                  className={`w-12 h-12 rounded-md overflow-hidden border-2 ${selectedSticker === num ? 'border-yellow-300' : 'border-transparent'} bg-white flex items-center justify-center`}
                  title={`Sticker ${num}`}
                >
                  <img src={src} alt={`Sticker ${num}`} className="w-full h-full object-contain" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
