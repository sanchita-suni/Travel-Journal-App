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

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    function handleResize() {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", handleResize);

    const loader = new THREE.TextureLoader();
    const textureTerrain = loader.load("/earth_terrain.jpg");
    const textureNight = loader.load("/earth_night.jpg");
    const textureStreet = loader.load("/earth_street.jpg");

    texturesRef.current = {
      terrain: textureTerrain,
      night: textureNight,
      street: textureStreet,
    };

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({ map: texturesRef.current[mapStyle] || textureTerrain, roughness: 0.9 })
    );
    earthRef.current = earth;
    scene.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x3399ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
      })
    );
    scene.add(atmosphere);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 🧭 Latitude/Longitude → 3D Vector
    const latLongToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // 🌍 Smooth Rotation Control
    let autoRotate = true;
    let rotateTimeout;

    controls.addEventListener("start", () => {
      autoRotate = false;
      clearTimeout(rotateTimeout);
    });

    controls.addEventListener("end", () => {
      rotateTimeout = setTimeout(() => (autoRotate = true), 3000);
    });

    // 🔄 Animation
    const animate = () => {
      requestAnimationFrame(animate);
      if (autoRotate) {
        earth.rotation.y += 0.002;
        atmosphere.rotation.y += 0.002;
      }
      stars.rotation.y += 0.0002;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const input = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const pinBtn = document.getElementById("pinBtn");
    const myLocationBtn = document.getElementById("myLocationBtn");
    const pins = [];

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
    myLocationBtn.addEventListener("click", pinMyLocation);

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
    <div
      style={{
        width: "100%",
        height: "85vh",
        backgroundColor: "black",
        position: "relative",
      }}
    >
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
        <button id="searchBtn" style={btnStyle("#007bff")}>🔍 Search</button>
        <button id="pinBtn" style={btnStyle("red")}>📍 Pin</button>
        <button id="myLocationBtn" style={btnStyle("green")}>📡 My Location</button>
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

      <div ref={mountRef} style={{
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}></div>

      {weather && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "15px",
            borderRadius: "12px",
            width: "200px",
            fontSize: "14px",
            lineHeight: "1.5",
            zIndex: 20,
          }}
        >
          <h4 style={{ margin: 0, color: "#4FC3F7" }}>{weather.name}</h4>
          <p style={{ margin: "5px 0" }}>
            🌡️ {weather.temp}°C <br />
            💧 Humidity: {weather.humidity}% <br />
            ☁️ {weather.desc}
          </p>
        </div>
      )}
    </div>
  );
}
