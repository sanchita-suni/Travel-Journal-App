import React from "react";

export default function Shelf3D() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "40px",
        width: "100%",
      }}
    >
      {/* Shelf Tier 1 */}
      <div
        style={{
          width: "80%",
          height: "120px",
          backgroundColor: "#1e293b",
          border: "5px solid #92400e",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          fontWeight: "500",
        }}
      >
        Shelf Tier 1 - Your Journals Go Here
      </div>

      {/* Shelf Tier 2 */}
      <div
        style={{
          width: "80%",
          height: "120px",
          backgroundColor: "#1e293b",
          border: "5px solid #92400e",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          fontWeight: "500",
        }}
      >
        Shelf Tier 2 - Your Journals Go Here
      </div>

      {/* Shelf Tier 3 */}
      <div
        style={{
          width: "80%",
          height: "120px",
          backgroundColor: "#1e293b",
          border: "5px solid #92400e",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          fontWeight: "500",
        }}
      >
        Shelf Tier 3 - Your Journals Go Here
      </div>

      {/* ✅ Removed the floating buttons */}
    </div>
  );
}
