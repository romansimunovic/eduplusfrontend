import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './App.css';
import { api } from '../api'; // <-- prilagodi putanju po strukturi projekta

function RadionicaDetalji() {
  const { id } = useParams();
  const [radionica, setRadionica] = useState(null);
  const [prisustva, setPrisustva] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const radionicaData = await api.get(`/api/radionice/${id}`);
        setRadionica(radionicaData || null);

        const prisustvaData = await api.get(`/api/prisustva/view/${id}`);
        setPrisustva(Array.isArray(prisustvaData) ? prisustvaData : []);
      } catch (e) {
        console.error(e);
        setError(`Greška pri dohvaćanju podataka. ${e?.message || ''}`.trim());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Učitavanje...</p>;

  const brojPoStatusu = (status) =>
    prisustva.filter(p => (p.status || '').toUpperCase() === status).length;

  const datumText =
    radionica?.datum
      ? new Date(radionica.datum).toLocaleDateString('hr-HR')
      : '-';

  return (
    <div className="container radionica-detalji-container">
      <Link to="/" className="back-link">← Natrag</Link>

      <h2>{radionica?.naziv || 'Radionica'}</h2>
      <p><strong>ID:</strong> {radionica?.id ?? '-'}</p>
      <p><strong>Datum:</strong> {datumText}</p>

      <div className="stat-box">
        <p><strong>Ukupno prijavljenih:</strong> {prisustva.length}</p>
        <p><strong>Prisutni:</strong> {brojPoStatusu('PRISUTAN')}</p>
        <p><strong>Izostali:</strong> {brojPoStatusu('IZOSTAO')}</p>
        <p><strong>Odustali:</strong> {brojPoStatusu('ODUSTAO')}</p>
      </div>

      <hr />
      <h3>Polaznici</h3>
      {prisustva.length === 0 ? (
        <p>Nema polaznika</p>
      ) : (
        <ul className="polaznici-lista">
          {prisustva.map(p => (
            <li key={p.id}>
              <strong>{p.polaznikImePrezime}</strong> — {p.rodnoOsjetljivTekst}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default RadionicaDetalji;
