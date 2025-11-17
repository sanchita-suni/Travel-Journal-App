import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

export default function Earth() {
  const mountRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [mapStyle, setMapStyle] = useState("terrain");
  const earthRef = useRef(null);
  const texturesRef = useRef({});
  const labelRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const label = labelRef.current;
    const popup = popupRef.current;

    // 🌤️ Add your OpenWeatherMap API key
    const WEATHER_API_KEY = "d680487912ad4df95a77093148650871";

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    // Texture loader
    const loader = new THREE.TextureLoader();
const textureLoader = new THREE.TextureLoader(); // Assuming 'loader' in HEAD refers to this
    
    // Load all necessary textures, combining both branches
    const textureTerrain = textureLoader.load("/earth_terrain.jpg");
    const textureNight = textureLoader.load("/earth_night.jpg");
    const textureStreet = textureLoader.load("/earth_street.jpg");
    const textureDay = textureLoader.load("/earth_day.jpg");

    // Store them in the dedicated ref (from the HEAD)
    texturesRef.current = {
      terrain: textureTerrain,
      night: textureNight,
      street: textureStreet,
      day: textureDay, // Added from remote
    };

    // Earth Mesh Initialization
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({ 
        // Use the mapStyle variable to select the texture, defaulting to terrain
        map: texturesRef.current[mapStyle] || textureTerrain,
        roughness: 0.9,
        metalness: 0.05, // Added from remote
      })
    );
    earthRef.current = earth;
    scene.add(earth);

    // Atmosphere
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.03, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x2f6fb8,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      })
    );
    scene.add(atmosphere);

    // Clouds
    try {
      const cloudTex = loader.load("/clouds.png");
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.02, 64, 64),
        new THREE.MeshPhongMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.5,
        })
      );
      earth.add(clouds);
    } catch {}

    // Stars
    const starGeom = new THREE.BufferGeometry();
    const starVerts = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000 * 3; i++) starVerts[i] = (Math.random() - 0.5) * 2000;
    starGeom.setAttribute("position", new THREE.BufferAttribute(starVerts, 3));
    const stars = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 }));
    scene.add(stars);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    scene.add(sun);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    let autoRotate = true;
    const pinnedFlags = [];

    // 🎯 Stop rotation only while user interacts (drag/zoom)
    controls.addEventListener("start", () => (autoRotate = false));
    controls.addEventListener("end", () => (autoRotate = true));

    // 🖱️ Optional manual toggle: double-click to stop/start rotation
    renderer.domElement.addEventListener("dblclick", () => {
      autoRotate = !autoRotate;
    });

    // Lat/Lon → Vector3
    const latLongToVector3 = (lat, lon, r = 1) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon + 180);
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Borders
    const borderGroup = new THREE.Group();
    earth.add(borderGroup);
    fetch("/countries.geojson")
      .then((r) => r.json())
      .then((geo) => {
        geo.features.forEach((f) => {
          const drawPolygon = (polygon) => {
            polygon.forEach((ring) => {
              const verts = [];
              ring.forEach(([lon, lat]) => {
                const v = latLongToVector3(lat, lon, 1.001);
                verts.push(v.x, v.y, v.z);
              });
              const geom = new THREE.BufferGeometry();
              geom.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
              const line = new THREE.Line(
                geom,
                new THREE.LineBasicMaterial({
                  color: 0x00ffff,
                  transparent: false,
                  opacity: 1.0,
                })
              );
              borderGroup.add(line);
            });
          };
          if (f.geometry.type === "Polygon") drawPolygon(f.geometry.coordinates);
          if (f.geometry.type === "MultiPolygon")
            f.geometry.coordinates.forEach((poly) => drawPolygon(poly));
        });
      });

    // UI Elements
    const input = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const pinBtn = document.getElementById("pinBtn");
    const myLocationBtn = document.getElementById("myLocationBtn");
    const full = document.getElementById("fullScreenBtn");

    // Fullscreen
    full.onclick = () =>
      !document.fullscreenElement ? mount.requestFullscreen() : document.exitFullscreen();

    // Search
    async function searchPlace() {
      const q = input.value.trim();
      if (!q) return;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!data.length) return alert("Place not found");

      const { lat, lon, display_name } = data[0];
      camera.userData.lastCoords = { lat: +lat, lon: +lon, display_name };
      autoRotate = false;
      const point = latLongToVector3(+lat, +lon, 1);
      const newPos = point.clone().normalize().multiplyScalar(-2.2);
      gsap.to(camera.position, { x: newPos.x, y: newPos.y, z: newPos.z, duration: 1.5, onUpdate: () => camera.lookAt(0, 0, 0) });
      label.textContent = display_name.split(",")[0];
      label.style.display = "block";
      label.userData = { point };
    }

    // 📍 Pin & fetch weather
    async function pinPlace() {
      if (!camera.userData.lastCoords) return alert("Search first!");
      const { lat, lon, display_name } = camera.userData.lastCoords;
      const coords = latLongToVector3(lat, lon, 1);

      const reverse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const info = await reverse.json();
      const code = info.address?.country_code?.toLowerCase() || "un";

      // 🌤️ Fetch weather
      let weatherData = null;
      try {
        const w = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
        weatherData = await w.json();
      } catch {
        weatherData = null;
      }

      const flagTex = loader.load(`https://flagcdn.com/w80/${code}.png`);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.05, 0.033),
        new THREE.MeshBasicMaterial({
          map: flagTex,
          transparent: true,
          side: THREE.DoubleSide,
        })
      );
      flag.position.copy(coords.clone().multiplyScalar(1.02));
      flag.lookAt(camera.position);
      earth.add(flag);

      pinnedFlags.push({
        flag,
        name: display_name.split(",")[0],
        weather: weatherData,
      });

      gsap.from(flag.scale, { x: 0, y: 0, duration: 0.5 });
      setTimeout(() => (autoRotate = true), 1000);
    }

    searchBtn.addEventListener("click", searchPlace);
    pinBtn.addEventListener("click", pinPlace);

    // Flag click popup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(pinnedFlags.map((p) => p.flag));
      if (intersects.length > 0) {
        const hit = pinnedFlags.find((p) => p.flag === intersects[0].object);
        if (hit) {
          const weather = hit.weather
            ? `${Math.round(hit.weather.main.temp)}°C, ${hit.weather.weather[0].description}`
            : "Weather data unavailable";

          popup.style.display = "block";
          popup.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex-direction:column;">
              <b>${hit.name}</b>
              <span>🌡️ ${weather}</span>
              <button id="removeFlag" style="background:#e33;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-weight:bold;">×</button>
            </div>
          `;
          popup.style.left = `${event.clientX + 10}px`;
          popup.style.top = `${event.clientY - 10}px`;

          document.getElementById("removeFlag").onclick = () => {
            earth.remove(hit.flag);
            popup.style.display = "none";
            const i = pinnedFlags.indexOf(hit);
            if (i !== -1) pinnedFlags.splice(i, 1);
          };
        }
      } else {
        popup.style.display = "none";
      }
    }
    renderer.domElement.addEventListener("click", onClick);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      if (autoRotate) earth.rotation.y += 0.0018;

      // Sunlight
      const now = new Date();
      const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const angle = (hours / 24) * Math.PI * 2;
      sun.position.set(Math.sin(angle) * 6, 0, Math.cos(angle) * 6);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    const getWeather = async (lat, lon) => {
      try {
        const apiKey = "d680487912ad4df95a77093148650871";
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        if (data && data.main) {
          setWeather({
            name: data.name,
            temp: data.main.temp,
            humidity: data.main.humidity,
            desc: data.weather[0].description,
          });
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
      }
    };

    async function searchPlace() {
      const place = input.value.trim();
      if (!place) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      );
      const data = await res.json();
      if (!data.length) return alert("Place not found");

      const { lat, lon, display_name } = data[0];
      const coords = latLongToVector3(parseFloat(lat), parseFloat(lon), 1.5);

      controls.enabled = false;
      gsap.to(camera.position, {
        x: coords.x * 1.5,
        y: coords.y * 1.5,
        z: coords.z * 1.5,
        duration: 2,
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => (controls.enabled = true),
        ease: "power2.out",
      });

      camera.userData.lastCoords = { lat, lon };
      camera.userData.lastPlace = display_name;

      getWeather(lat, lon);
    }

    const pins = [];

    function pinPlace() {
      if (!camera.userData.lastCoords) return alert("Search a place first!");
      const { lat, lon } = camera.userData.lastCoords;
      const coords = latLongToVector3(parseFloat(lat), parseFloat(lon), 1.02);

      const pinGeom = new THREE.ConeGeometry(0.015, 0.05, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(coords);
      pin.lookAt(new THREE.Vector3(0, 0, 0));
      pin.rotateX(Math.PI);
      earth.add(pin);
      pins.push(pin);
    }

    function pinMyLocation() {
      if (!navigator.geolocation) return alert("Geolocation not supported");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const coords = latLongToVector3(latitude, longitude, 1.02);

          const pinGeom = new THREE.ConeGeometry(0.015, 0.05, 8);
          const pinMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
          const pin = new THREE.Mesh(pinGeom, pinMat);
          pin.position.copy(coords);
          pin.lookAt(new THREE.Vector3(0, 0, 0));
          pin.rotateX(Math.PI);
          earth.add(pin);
          pins.push(pin);

          gsap.to(camera.position, {
            x: coords.x * 1.5,
            y: coords.y * 1.5,
            z: coords.z * 1.5,
            duration: 2,
            onUpdate: () => camera.lookAt(0, 0, 0),
            ease: "power2.out",
          });

          getWeather(latitude, longitude);
        },
        () => alert("Unable to get your location")
      );
    }

    searchBtn.addEventListener("click", searchPlace);
    pinBtn.addEventListener("click", pinPlace);
    myLocationBtn && myLocationBtn.addEventListener("click", pinMyLocation);

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, [mapStyle]);

  useEffect(() => {
    const earth = earthRef.current;
    const textures = texturesRef.current;
    if (earth && textures && textures[mapStyle]) {
      earth.material.map = textures[mapStyle];
      earth.material.needsUpdate = true;
    }
  }, [mapStyle]);

  const btnStyle = (color, isActive = false) => ({
    background: color,
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    opacity: isActive ? 1 : 0.7,
    boxShadow: isActive ? "0 0 10px rgba(255,255,255,0.4)" : "none",
  });
  return (
    <div style={{ width: "100%", height: "85vh", position: "relative", background: "black" }}>
      {/* Search */}
      <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12, zIndex: 20 }}>
        <input id="searchInput" placeholder="Search place..." style={{ width: 320, padding: 12, borderRadius: 10, border: "none", outline: "none", background: "rgba(255,255,255,0.07)", color: "white" }} />
        <button id="searchBtn" style={{ background: "#0b79ff", color: "#fff", padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer" }}>🔍 Search</button>
        <button id="pinBtn" style={{ background: "#e33", color: "#fff", padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer" }}>📍 Pin</button>
        <button id="myLocationBtn" style={{ background: "#10b981", color: "#fff", padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer" }}>📡 My Location</button>
      </div>

<div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          zIndex: 10,
          background: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: "12px",
        }}
      >
        <button
          onClick={() => setMapStyle("terrain")}
          style={btnStyle("#1D4ED8", mapStyle === "terrain")}
        >
          🗺️ Terrain
        </button>
        <button
          onClick={() => setMapStyle("street")}
          style={btnStyle("#059669", mapStyle === "street")}
        >
          🏙️ Street
        </button>
        <button
          onClick={() => setMapStyle("night")}
          style={btnStyle("#4B5563", mapStyle === "night")}
        >
          🌌 Night
        </button>
      </div>

      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {/* Fullscreen */}
      <button id="fullScreenBtn" style={{ position: "absolute", right: 20, top: 80, zIndex: 20, padding: 8, borderRadius: 8, cursor: "pointer" }}>🖥️</button>

      {/* Popup */}
      <div ref={popupRef} style={{
        position: "absolute",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 14,
        display: "none",
        zIndex: 50,
        pointerEvents: "auto",
      }} />
    </div>
  );
}
