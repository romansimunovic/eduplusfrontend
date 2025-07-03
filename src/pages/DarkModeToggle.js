import React, { useEffect, useState } from 'react';

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 1000,
      cursor: 'pointer',
      fontSize: '1.5rem'
    }} onClick={toggleMode} title="Promijeni temu">
      {darkMode ? '🌙' : '☀️'}
    </div>
  );
}

export default DarkModeToggle;
