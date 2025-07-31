import React, { useEffect, useState } from 'react';
import './App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState({});
  const [selectedRadionica, setSelectedRadionica] = useState(null);

  useEffect(() => {
    // Fetch workshops and participants on mount
    fetch(`${baseUrl}/api/radionice`).then(r => r.json()).then(setRadionice).catch(() => {});
    fetch(`${baseUrl}/api/polaznici`).then(r => r.json()).then(setPolaznici).catch(() => {});
  }, []);

  const statusCycle = {
    UNKNOWN: 'PRESENT',
    PRESENT: 'ABSENT',
    ABSENT: 'UNKNOWN'
  };

  const handleSelectRadionica = (rad) => {
    setSelectedRadionica(rad);
  };

  const handleToggleStatus = (polaznikId) => {
    if (!selectedRadionica) return;
    const radId = selectedRadionica.id;
    setPrisustva(prev => {
      const current = prev[radId]?.[polaznikId] || 'UNKNOWN';
      const next = statusCycle[current];
      return {
        ...prev,
        [radId]: {
          ...prev[radId],
          [polaznikId]: next
        }
      };
    });
  };

  const getColor = (status) => {
    if (status === 'PRESENT') return '#d4f7d4';
    if (status === 'ABSENT') return '#f8d7da';
    return '#ffffff';
  };

  const polazniciList = selectedRadionica ? polaznici.map(p => {
    const status = prisustva[selectedRadionica.id]?.[p.id] || 'UNKNOWN';
    return (
      <li
        key={p.id}
        onClick={() => handleToggleStatus(p.id)}
        style={{ backgroundColor: getColor(status), cursor: 'pointer' }}
      >
        {p.ime} {p.prezime}
      </li>
    );
  }) : <p>Odaberite radionicu za evidenciju.</p>;

  return (
    <div className="container">
      <h2>Evidencija prisustva</h2>
      <div className="flex-row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <ul>
            {radionice.map(r => (
              <li
                key={r.id}
                onClick={() => handleSelectRadionica(r)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedRadionica && selectedRadionica.id === r.id ? '#e8f1fb' : '#fff'
                }}
              >
                {r.naziv}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <ul>
            {selectedRadionica ? polazniciList : <li>Odaberite radionicu</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
