// TemplatesPage.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Props:
 * - templateMeta: { id, title, color }
 * - onBookOpen() → called when "Book" is clicked (plays animation + opens BookEditor)
 * - onBack() → go back to library
 */
export default function TemplatesPage({ templateMeta, onBookOpen, onBack }) {
  const canvasRef = useRef();

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f25);
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.8, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Materials
    const coverMat = new THREE.MeshStandardMaterial({
      color: (templateMeta && templateMeta.color) || 0x9b5de5,
      roughness: 0.6,
      metalness: 0.3,
    });
    const pageMat = new THREE.MeshStandardMaterial({
      color: 0xf8f4e3,
      roughness: 0.9,
    });
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
    });

    // Book parts
    const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.02), pageMat);
    const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.02), pageMat);
    const leftCover = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.22, 0.04), coverMat);
    const rightCover = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.22, 0.04), coverMat);
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.22, 0.06), spineMat);

    leftPage.position.set(-0.46, 0, 0.01);
    rightPage.position.set(0.46, 0, 0.01);
    leftCover.position.set(-0.46, 0, 0.03);
    rightCover.position.set(0.46, 0, 0.03);
    spine.position.set(0, 0, 0.04);

    // Adjust pivot points
    leftCover.geometry.translate(0.46, 0, 0);
    rightCover.geometry.translate(-0.46, 0, 0);

    const book = new THREE.Group();
    book.add(leftPage, rightPage, leftCover, rightCover, spine);
    scene.add(book);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      book.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Book opening animation
    const openBook = () => {
      gsap.to(leftCover.rotation, { y: Math.PI * 0.83, duration: 1.1, ease: "power2.out" });
      gsap.to(rightCover.rotation, { y: -Math.PI * 0.83, duration: 1.1, ease: "power2.out" });
      gsap.fromTo(book.rotation, { x: 0 }, { x: -0.06, duration: 0.8, yoyo: true, repeat: 1 });
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [templateMeta]);

  // Trigger animation + navigation
  const handleBookClick = () => {
    onBookOpen && onBookOpen();
  };

  return (
    <div className="relative min-h-screen bg-[#0a0f25] text-white p-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#1e2639] rounded-md border border-gray-500 hover:bg-[#2d3550] transition"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center flex-1">Design Your Journal Cover</h1>

        <button
          onClick={handleBookClick}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          📖 Book
        </button>
      </div>

      {/* 3D Book Canvas */}
      <div className="flex justify-center mt-12">
        <div
          ref={canvasRef}
          style={{ width: 420, height: 340, borderRadius: 12, overflow: "hidden" }}
        />
      </div>

      <div className="text-center mt-8 text-gray-300">
        <h3 className="text-xl">{templateMeta?.title || "Your New Journal"}</h3>
        <p className="opacity-70">Click the “Book” button to open this template as your journal.</p>
      </div>
    </div>
  );
}