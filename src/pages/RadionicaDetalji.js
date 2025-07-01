import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../pages/App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function RadionicaDetalji() {
  const { id } = useParams();
  const [radionica, setRadionica] = useState(null);
  const [prisustva, setPrisustva] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [radionicaRes, prisustvaRes] = await Promise.all([
          fetch(`${baseUrl}/api/radionice/${id}`),
          fetch(`${baseUrl}/api/prisustva/view`)
        ]);

        const radionicaData = await radionicaRes.json();
        const prisustvaData = await prisustvaRes.json();

        setRadionica(radionicaData);
        const filtrirana = prisustvaData.filter(p => p.radionicaId === parseInt(id));
        setPrisustva(filtrirana);
      } catch (err) {
        console.error(err);
        setError("Greška kod dohvaćanja podataka o radionici.");
      }
    };

    fetchData();
  }, [id]);

  const brojPoStatusu = (status) =>
    prisustva.filter(p => p.status === status).length;

  return (
    <div className="container">
      <Link to="/" style={{ display: 'block', marginBottom: '1rem' }}>← Natrag na popis radionica</Link>

      {error && <p className="error">{error}</p>}

      {radionica ? (
        <>
          <h2>{radionica.naziv}</h2>
          <p><strong>ID radionice:</strong> {radionica.id}</p>
          <p><strong>Datum održavanja:</strong> {radionica.datum}</p>

          <div className="stat-box">
            <p><strong>Ukupno prijavljenih:</strong> {prisustva.length}</p>
            <p>Prisutni: {brojPoStatusu("PRISUTAN")}</p>
            <p>Izostali: {brojPoStatusu("IZOSTAO")}</p>
            <p>Odustali: {brojPoStatusu("ODUSTAO")}</p>
          </div>

          <hr />

          <h3>Polaznici</h3>
          {prisustva.length === 0 ? (
            <p>Nema prijavljenih polaznika za ovu radionicu.</p>
          ) : (
            <ul>
              {prisustva.map((p, index) => (
                <li key={index}>
                  {p.polaznikImePrezime} – <strong>{p.status}</strong>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>Učitavanje...</p>
      )}
    </div>
  );
}

export default RadionicaDetalji;
