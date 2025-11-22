import React, { useState } from "react";

const personIcon = (
  // SVG prikaz male figure (čovjek)
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    style={{ display: "block", margin: "auto" }}
  >
    <circle cx="12" cy="5" r="3" fill="#333" />
    <rect x="10" y="8" width="4" height="7" rx="2" fill="#333" />
    <rect x="6" y="16" width="3" height="6" rx="1.5" fill="#333" />
    <rect x="15" y="16" width="3" height="6" rx="1.5" fill="#333" />
    <rect x="8" y="11" width="2" height="5" rx="1" fill="#333" />
    <rect x="14" y="11" width="2" height="5" rx="1" fill="#333" />
  </svg>
);

export default function AccessibilityWidget({
  setLargeFont,
  setHighContrast,
  setDarkMode,
  largeFont,
  highContrast,
  darkMode,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accessibility-widget-floating" aria-live="polite">
      <button
        aria-label="Pristupačnost"
        onClick={() => setOpen((o) => !o)}
        style={{
          fontSize: "1.5em",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          background: "#ffe066",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {personIcon}
      </button>
      {open && (
        <div className="accessibility-controls" style={{
          marginTop: 14,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.11)",
          padding: 18,
          minWidth: 155,
        }}>
          <label>
  <input type="checkbox" checked={largeFont} onChange={e => setLargeFont(e.target.checked)} />
  <span>Veći font</span>
</label>
<label>
  <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />
  <span>Visoki kontrast</span>
</label>
<label>
  <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
  <span>Tamni način</span>
</label>
        </div>
      )}
      {/* Inline stil, može i u CSS datoteku */}
      <style>
        {`
          .accessibility-widget-floating {
            position: fixed;
            bottom: 32px;
            right: 32px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
        `}
      </style>
    </div>
  );
}
