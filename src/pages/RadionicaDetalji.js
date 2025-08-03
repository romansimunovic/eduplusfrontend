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
        if (!radionicaRes.ok) throw new Error("Neuspješno dohvaćanje radionice");
        const radionicaData = await radionicaRes.json();
        setRadionica(radionicaData);

        const prisustvaRes = await fetch(`${baseUrl}/api/prisustva/view`);
        if (!prisustvaRes.ok) throw new Error("Neuspješno dohvaćanje prisustava");
        const prisustvaData = await prisustvaRes.json();

        const filtrirana = prisustvaData.filter(
          p => p.radionicaNaziv === radionicaData.naziv
        );

        setPrisustva(filtrirana);
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

  const formatirajDatum = (datum) => {
    if (!datum) return '';
    const d = new Date(datum);
    return d.toLocaleDateString("hr-HR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const prikaziStatus = (status, spol) => {
    const zensko = spol && spol.toLowerCase().startsWith("ž");
    switch (status) {
      case "PRISUTAN": return zensko ? "Prisutna" : "Prisutan";
      case "IZOSTAO": return zensko ? "Izostala" : "Izostao";
      case "ODUSTAO": return zensko ? "Odustala" : "Odustao";
      default: return "Nepoznato";
    }
  };

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
                  <strong>{p.polaznikImePrezime}</strong> — {prikaziStatus(p.status, p.polaznikSpol)}
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
