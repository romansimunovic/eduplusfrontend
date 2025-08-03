import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../pages/App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function RadionicaDetalji() {
  const { id } = useParams();
  const [radionica, setRadionica] = useState(null);
  const [prisustva, setPrisustva] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const radionicaRes = await fetch(`${baseUrl}/api/radionice/${id}`);
        if (!radionicaRes.ok) throw new Error();
        setRadionica(await radionicaRes.json());

        const prisRes = await fetch(`${baseUrl}/api/prisustva/view/${id}`);
        if (!prisRes.ok) throw new Error();
        setPrisustva(await prisRes.json());
      } catch (e) {
        console.error(e);
        setError("Greška pri dohvaćanju podataka");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p>Učitavanje...</p>;

  const brojPoStatusu = status =>
    prisustva.filter(p => p.status?.toUpperCase() === status).length;

  const prikaziStatus = (status, spol) => {
    const zensko = (spol || '').toUpperCase() === 'Ž';
    if (!status) return "Nepoznato";
    switch (status.toUpperCase()) {
      case 'PRISUTAN': return zensko ? 'Prisutna' : 'Prisutan';
      case 'IZOSTAO': return zensko ? 'Izostala' : 'Izostao';
      case 'ODUSTAO': return zensko ? 'Odustala' : 'Odustao';
      default: return 'Nepoznato';
    }
  };

  return (
    <div className="container radionica-detalji-container">
      <Link to="/" className="back-link">← Natrag</Link>
      <h2>{radionica?.naziv}</h2>
      <p><strong>ID:</strong> {radionica?.id}</p>
      <p><strong>Datum:</strong> {new Date(radionica?.datum).toLocaleDateString('hr-HR')}</p>

      <div className="stat-box">
        <p><strong>Ukupno prijavljenih:</strong> {prisustva.length}</p>
        <p><strong>Prisutni:</strong> {brojPoStatusu("PRISUTAN")}</p>
        <p><strong>Izostali:</strong> {brojPoStatusu("IZOSTAO")}</p>
        <p><strong>Odustali:</strong> {brojPoStatusu("ODUSTAO")}</p>
      </div>

      <hr/>
      <h3>Polaznici</h3>
      {prisustva.length === 0 && <p>Nema polaznika</p>}
      <ul className="polaznici-lista">
        {prisustva.map(p => (
          <li key={p.id}>
            <strong>{p.polaznikImePrezime}</strong> — {prikaziStatus(p.status, p.polaznikSpol)}
          </li>
        ))}
      </ul>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default RadionicaDetalji;
