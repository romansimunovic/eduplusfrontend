import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
function RadionicaDetalji() {
  const { id } = useParams();
  const [radionica, setRadionica] = useState(null);
  const [prisustva, setPrisustva] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    api.get(`/radionice/${id}`).then(r => setRadionica(r || null)).catch(() => setError('Greška'));
    api.get(`/prisustva/view/${id}`).then(pr => setPrisustva(Array.isArray(pr) ? pr : [])).catch(() => setError('Greška'));
  }, [id]);
  if (!radionica) return <p>Učitavanje...</p>;
  return (
    <div className="container">
      <Link to="/">← Natrag</Link>
      <h2>{radionica.naziv || 'Radionica'}</h2>
      <p><strong>ID:</strong> {radionica.id}</p>
      <p><strong>Datum:</strong> {radionica.datum}</p>
      <ul>
        {prisustva.map(p => (
          <li key={p.id}>{p.polaznikImePrezime} — {p.rodnoOsjetljivTekst}</li>
        ))}
      </ul>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
export default RadionicaDetalji;
