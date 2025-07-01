import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);

  const baseUrl = "https://eduplusbackend.onrender.com";

  useEffect(() => {
    fetch(`${baseUrl}/api/radionice`).then(res => res.json()).then(setRadionice);
    fetch(`${baseUrl}/api/polaznici`).then(res => res.json()).then(setPolaznici);
    fetch(`${baseUrl}/api/prisustva`).then(res => res.json()).then(setPrisustva);
  }, []);

  return (
    <div className="container">
      <h2>📊 Pregled trenutnog stanja u sustavu</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#555' }}>
        Broj aktivnih radionica, registriranih polaznika i evidentiranih prisustava.
      </p>
      <div className="flex-row" style={{ justifyContent: 'center' }}>
        <div className="stat-box"><strong>Radionice:</strong> {radionice.length}</div>
        <div className="stat-box"><strong>Polaznici:</strong> {polaznici.length}</div>
        <div className="stat-box"><strong>Prisustva:</strong> {prisustva.length}</div>
      </div>
    </div>
  );
}

export default Dashboard;
