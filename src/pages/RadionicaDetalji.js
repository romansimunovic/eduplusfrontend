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

  const formatirajDatum = (datumString) => {
    try {
      return new Date(datumString).toLocaleDateString("hr-HR", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return datumString;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [radionicaRes, prisustvaRes] = await Promise.all([
          fetch(`${baseUrl}/api/radionice/${id}`),
          fetch(`${baseUrl}/api/prisustva/view`)
        ]);

        if (!radionicaRes.ok || !prisustvaRes.ok) {
          throw new Error("Neuspješno dohvaćanje podataka");
        }

        const radionicaData = await radionicaRes.json();
        const prisustvaData = await prisustvaRes.json();

        setRadionica(radionicaData);
        setPrisustva(prisustvaData.filter(p => p.radionicaId === parseInt(id)));
      } catch (err) {
        console.error(err);
        setError("Greška kod dohvaćanja podataka o radionici.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const brojPoStatusu = (status) =>
    prisustva.filter(p => p.status === status).length;

  if (loading) return <p>Učitavanje...</p>;

  return (
    <div className="container">
      <Link to="/" className="back-link">← Natrag na popis radionica</Link>

      {error && <p className="error">{error}</p>}

      {radionica ? (
        <>
          <h2>{radionica.naziv}</h2>
          <p><strong>ID radionice:</strong> {radionica.id}</p>
          <p><strong>Datum održavanja:</strong> {formatirajDatum(radionica.datum)}</p>

          <div className="stat-box">
            <p><strong>Ukupno prijavljenih:</strong> {prisustva.length}</p>
            <p><strong>Prisutni:</strong> {brojPoStatusu("PRISUTAN")}</p>
            <p><strong>Izostali:</strong> {brojPoStatusu("IZOSTAO")}</p>
            <p><strong>Odustali:</strong> {brojPoStatusu("ODUSTAO")}</p>
          </div>

          <hr />

          <h3>Popis polaznika</h3>
          {prisustva.length === 0 ? (
            <p>Nema prijavljenih polaznika za ovu radionicu.</p>
          ) : (
            <ul>
              {prisustva.map((p, index) => (
                <li key={index}>
                  <strong>{p.polaznikImePrezime}</strong> — <span>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>Radionica nije pronađena.</p>
      )}
    </div>
  );
}

export default RadionicaDetalji;
