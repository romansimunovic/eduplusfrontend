import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Dashboard() {
  const [brojRadionica, setBrojRadionica] = useState(0);
  const [brojPolaznika, setBrojPolaznika] = useState(0);
  const [brojPrisustava, setBrojPrisustava] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [radRes, polRes, priRes] = await Promise.all([
        fetch(`${baseUrl}/api/radionice`),
        fetch(`${baseUrl}/api/polaznici`),
        fetch(`${baseUrl}/api/prisustva/view`)
      ]);
      const radionice = await radRes.json();
      const polaznici = await polRes.json();
      const prisustva = await priRes.json();

      setBrojRadionica(radionice.length);
      setBrojPolaznika(polaznici.length);
      setBrojPrisustava(prisustva.length);
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div className="flex-row">
        <div className="stat-box"><strong>Radionice:</strong> {brojRadionica}</div>
        <div className="stat-box"><strong>Polaznici:</strong> {brojPolaznika}</div>
        <div className="stat-box"><strong>Prisustva:</strong> {brojPrisustava}</div>
      </div>
    </div>
  );
}

export default Dashboard;
