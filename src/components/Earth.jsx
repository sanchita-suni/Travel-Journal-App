import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

export default function Earth() {
  const mountRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const popup = popupRef.current;
    const WEATHER_API_KEY = "d680487912ad4df95a77093148650871";

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3.5); // Zoomed out slightly

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const textures = {
      day: loader.load("/earth_day.jpg"),
      night: loader.load("/earth_night.jpg"),
      terrain: loader.load("/earth_terrain.jpg"),
    };

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({ map: textures.day, roughness: 0.5, metalness: 0.1 })
    );
    earthGroup.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x2f6fb8, transparent: true, opacity: 0.15, side: THREE.BackSide })
    );
    scene.add(atmosphere);

    try {
      const cloudTex = loader.load("/clouds.png");
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.02, 64, 64),
        new THREE.MeshPhongMaterial({ map: cloudTex, transparent: true, opacity: 0.4 })
      );
      earth.add(clouds);
    } catch {}

    const starGeom = new THREE.BufferGeometry();
    const starVerts = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000 * 3; i++) starVerts[i] = (Math.random() - 0.5) * 2000;
    starGeom.setAttribute("position", new THREE.BufferAttribute(starVerts, 3));
    const stars = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 }));
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    let autoRotate = true;
    // ⭐ The "pinnedFlags" array stores both Manual Pins AND Database Pins
    const pinnedFlags = []; 

    controls.addEventListener("start", () => (autoRotate = false));
    controls.addEventListener("end", () => (autoRotate = true));
    renderer.domElement.addEventListener("dblclick", () => { autoRotate = !autoRotate; });

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
    fetch("/countries.geojson").then((r) => r.json()).then((geo) => {
        geo.features.forEach((f) => {
          const drawPolygon = (polygon) => {
            polygon.forEach((ring) => {
              const verts = [];
              ring.forEach(([lon, lat]) => { const v = latLongToVector3(lat, lon, 1.001); verts.push(v.x, v.y, v.z); });
              const geom = new THREE.BufferGeometry();
              geom.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
              const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x00ffff }));
              borderGroup.add(line);
            });
          };
          if (f.geometry.type === "Polygon") drawPolygon(f.geometry.coordinates);
          if (f.geometry.type === "MultiPolygon") f.geometry.coordinates.forEach((p) => drawPolygon(p));
        });
    });

    /* --------------------------------------------------------------------------
       ⭐ 1. FETCH DATABASE PINS (With Flag Logic)
    -------------------------------------------------------------------------- */
    const fetchUserPins = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5000/api/posts/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const posts = await res.json();

        if (Array.isArray(posts)) {
          for (const post of posts) {
            if (post.location && post.location.coordinates && 
               (post.location.coordinates[0] !== 0 || post.location.coordinates[1] !== 0)) {
              
              const [lon, lat] = post.location.coordinates;
              
              // Get Country Code for Flag
              let countryCode = "un"; 
              try {
                  const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                  const geoData = await geoRes.json();
                  if (geoData.address && geoData.address.country_code) {
                      countryCode = geoData.address.country_code.toLowerCase();
                  }
              } catch (e) {}

              const coords = latLongToVector3(lat, lon, 1);
              
              // CREATE FLAG MESH
              const flagTex = loader.load(`https://flagcdn.com/w80/${countryCode}.png`);
              const flag = new THREE.Mesh(
                new THREE.PlaneGeometry(0.05, 0.033),
                new THREE.MeshBasicMaterial({ map: flagTex, transparent: true, side: THREE.DoubleSide })
              );
              flag.position.copy(coords.clone().multiplyScalar(1.02));
              flag.lookAt(new THREE.Vector3(0,0,0)); // Look at center (adjusts rotation)
              earth.add(flag);

              // Add to array so Raycaster can click it
              pinnedFlags.push({
                flag,
                name: post.title,
                weather: null,
                description: post.placeName,
                isJournal: true
              });
            }
          }
        }
      } catch (e) { console.error(e); }
    };
    fetchUserPins();


    /* --------------------------------------------------------------------------
       ⭐ 2. UI LOGIC (Using addEventListener as requested)
    -------------------------------------------------------------------------- */
    const input = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const pinBtn = document.getElementById("pinBtn");
    const mapSelect = document.getElementById("mapStyleSelect");
    const full = document.getElementById("fullScreenBtn");

    // Map style
    mapSelect.addEventListener("change", (e) => {
      const mode = e.target.value;
      earth.material.map = textures[mode];
      earth.material.needsUpdate = true;
    });

    // Fullscreen
    full.onclick = () => !document.fullscreenElement ? mount.requestFullscreen() : document.exitFullscreen();

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
    }

    // Manual Pin
    async function pinPlace() {
      if (!camera.userData.lastCoords) return alert("Search first!");
      const { lat, lon, display_name } = camera.userData.lastCoords;
      const coords = latLongToVector3(lat, lon, 1);
      const reverse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const info = await reverse.json();
      const code = info.address?.country_code?.toLowerCase() || "un";

      let weatherData = null;
      try {
        const w = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
        weatherData = await w.json();
      } catch {}

      const flagTex = loader.load(`https://flagcdn.com/w80/${code}.png`);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.05, 0.033),
        new THREE.MeshBasicMaterial({ map: flagTex, transparent: true, side: THREE.DoubleSide })
      );
      flag.position.copy(coords.clone().multiplyScalar(1.02));
      flag.lookAt(camera.position);
      earth.add(flag);

      pinnedFlags.push({ flag, name: display_name.split(",")[0], weather: weatherData, isJournal: false });
      gsap.from(flag.scale, { x: 0, y: 0, duration: 0.5 });
      setTimeout(() => (autoRotate = true), 1000);
    }

    searchBtn.addEventListener("click", searchPlace);
    pinBtn.addEventListener("click", pinPlace);

    // Click Handler
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
          let content = "";
          if (hit.isJournal) {
               // Journal Pin Content
               content = `<b>📖 ${hit.name}</b><br/><span>📍 ${hit.description}</span>`;
          } else {
               // Weather Pin Content
               const weather = hit.weather ? `${Math.round(hit.weather.main.temp)}°C, ${hit.weather.weather[0].description}` : "No data";
               content = `<b>${hit.name}</b><br/><span>🌡 ${weather}</span>`;
          }

          popup.style.display = "block";
          popup.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex-direction:column;">
              ${content}
              <button id="removeFlag" style="background:#e33;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-weight:bold;">×</button>
            </div>
          `;
          popup.style.left = `${event.clientX + 10}px`;
          popup.style.top = `${event.clientY - 10}px`;
          document.getElementById("removeFlag").onclick = () => {
             if (!hit.isJournal) { // Only remove temp pins
                earth.remove(hit.flag);
                const i = pinnedFlags.indexOf(hit);
                if (i !== -1) pinnedFlags.splice(i, 1);
             }
             popup.style.display = "none";
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
      const now = new Date();
      const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const angle = (hours / 24) * Math.PI * 2;
      sun.position.set(Math.sin(angle) * 6, 0, Math.cos(angle) * 6);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });

    return () => {
      mount.removeChild(renderer.domElement);
      searchBtn.removeEventListener("click", searchPlace);
      pinBtn.removeEventListener("click", pinPlace);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "85vh", position: "relative", background: "black" }}>
      <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12, zIndex: 20 }}>
        <input id="searchInput" placeholder="Search place..." style={{ width: 320, padding: 12, borderRadius: 10, border: "none", outline: "none", background: "rgba(255,255,255,0.07)", color: "white" }} />
        <button id="searchBtn" style={{ background: "#0b79ff", color: "#fff", padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer" }}>🔍 Search</button>
        <button id="pinBtn" style={{ background: "#e33", color: "#fff", padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer" }}>📍 Pin</button>
      </div>
      <select id="mapStyleSelect" style={{ position: "absolute", top: 80, left: 20, zIndex: 20, padding: 8, borderRadius: 8 }}>
        <option value="day">🌞 Day</option>
        <option value="night">🌙 Night</option>
        <option value="terrain">⛰ Terrain</option>
      </select>
      <button id="fullScreenBtn" style={{ position: "absolute", right: 20, top: 80, zIndex: 20, padding: 8, borderRadius: 8, cursor: "pointer" }}>🖥</button>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <div ref={popupRef} style={{ position: "absolute", background: "rgba(0,0,0,0.8)", color: "white", padding: "8px 12px", borderRadius: 8, fontSize: 14, display: "none", zIndex: 50, pointerEvents: "auto" }} />
    </div>
  );
}