import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

export default function Earth() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    // 🌍 Earth with texture
    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load("/earth_texture.jpg");
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.9,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // 🌫️ Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // ✨ Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
    }
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 💡 Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0xffffff, 1.5);
    point.position.set(5, 3, 5);
    scene.add(point);

    // 🎮 Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.5;

    // 🧭 Helper: Convert Lat/Lon → 3D point
    const latLongToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 🌍 Rotation animation
    const animate = () => {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.002;
      atmosphere.rotation.y += 0.002;
      stars.rotation.y += 0.0002;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 🧭 Resize
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 🗺️ Search & Pin logic
    const input = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const pinBtn = document.getElementById("pinBtn");
    const pins = [];

    async function searchPlace() {
      const place = input.value.trim();
      if (!place) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      );
      const data = await res.json();
      if (!data.length) {
        alert("Place not found");
        return;
      }

      const { lat, lon, display_name } = data[0];
      const coords = latLongToVector3(parseFloat(lat), parseFloat(lon), 1.5);

      gsap.to(camera.position, {
        x: coords.x * 1.5,
        y: coords.y * 1.5,
        z: coords.z * 1.5,
        duration: 2,
        onUpdate: () => camera.lookAt(0, 0, 0),
        ease: "power2.out",
      });

      camera.userData.lastCoords = { lat, lon };
      camera.userData.lastPlace = display_name;
    }

    function pinPlace() {
      if (!camera.userData.lastCoords) {
        alert("Search a place first!");
        return;
      }

      const { lat, lon, lastPlace } = camera.userData.lastCoords
        ? { ...camera.userData, lastPlace: camera.userData.lastPlace }
        : {};
      const coords = latLongToVector3(parseFloat(lat), parseFloat(lon), 1.02);

      const pinGeom = new THREE.ConeGeometry(0.015, 0.05, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const pin = new THREE.Mesh(pinGeom, pinMat);

      pin.position.copy(coords);
      pin.lookAt(new THREE.Vector3(0, 0, 0));
      pin.rotateX(Math.PI); // make it face outward
      earth.add(pin); // <== key fix: attach to Earth mesh!

      pins.push(pin);
    }

    searchBtn.addEventListener("click", searchPlace);
    pinBtn.addEventListener("click", pinPlace);

    // Cleanup
    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "85vh",
        backgroundColor: "black",
        position: "relative",
      }}
    >
      {/* 🔍 Search UI */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          zIndex: 10,
        }}
      >
        <input
          id="searchInput"
          type="text"
          placeholder="Search a place..."
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            width: "250px",
            outline: "none",
          }}
        />
        <button
          id="searchBtn"
          style={{
            background: "#007bff",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔍 Search
        </button>
        <button
          id="pinBtn"
          style={{
            background: "red",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📍 Pin
        </button>
      </div>

      {/* 🌎 Earth Canvas */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      ></div>
    </div>
  );
}
