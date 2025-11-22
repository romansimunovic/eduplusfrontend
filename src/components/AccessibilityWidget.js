// src/components/AccessibilityWidget.js
import React, { useState } from 'react';

export default function AccessibilityWidget({ setLargeFont, setHighContrast, setDarkMode, largeFont, highContrast, darkMode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accessibility-widget">
      <button
        aria-label="Pristupačnost"
        onClick={() => setOpen(o => !o)}
        style={{ fontSize: "2em", borderRadius: "50%", width: 52, height: 52, boxShadow: "0 2px 10px rgba(0,0,0,0.13)", background: "#ffe066", border: "none", cursor: "pointer" }}
      >🧑‍🦽</button>
      {open &&
        <div className="accessibility-controls">
          <label>
            <input type="checkbox" checked={largeFont} onChange={e => setLargeFont(e.target.checked)} />
            Veći font
          </label>
          <label>
            <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />
            Visoki kontrast
          </label>
          <label>
            <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            Tamni način
          </label>
        </div>
      }
    </div>
  );
}
