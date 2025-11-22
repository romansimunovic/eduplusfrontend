import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/api';

export default function RadionicaDetalji() {
  const { id } = useParams();
  const [radionica, setRadionica] = useState(null);
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dohvati podatke o radionici, polaznicima i prisustvima za tu radionicu
    api.get(`/radionice/${id}`)
      .then(res => setRadionica(res.data || null))
      .catch(() => setError('Greška pri dohvaćanju radionice.'));
    api.get(`/prisustva/radionica/${id}`)
      .then(res => setPrisustva(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Greška pri dohvaćanju prisustava.'));
    api.get("/polaznici")
      .then(res => setPolaznici(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Greška pri dohvaćanju polaznika.'));
  }, [id]);

  // Helper za prikaz imena i spola
  const getPolaznik = pid => {
    const p = polaznici.find(pp => pp.id === pid);
    return p ? `${p.ime} ${p.prezime}` : "—";
  };
  const getSpol = pid => {
    const p = polaznici.find(pp => pp.id === pid);
    return p ? p.spol : "";
  };

  // Rodno osjetljiv prikaz statusa polaznika
  const prikaziStatus = (status, spol) => {
    const zensko = (spol || '').toLowerCase().startsWith('ž');
    if (status === 'PRISUTAN') return zensko ? "Prisutna" : "Prisutan";
    if (status === 'IZOSTAO') return zensko ? "Izostala" : "Izostao";
    if (status === 'ODUSTAO') return zensko ? "Odustala" : "Odustao";
    return "Nepoznato";
  };

  if (!radionica) return <div className="container"><p>Učitavanje...</p></div>;

  return (
    <div className="container">
      <Link to="/radionice">← Natrag</Link>
      <h2>{radionica.naziv || 'Radionica'}</h2>
      <p><strong>ID:</strong> {radionica.id}</p>
      <p><strong>Datum:</strong> {radionica.datum}</p>
      <p><strong>Opis:</strong> {radionica.opis || "—"}</p>
      <p><strong>Organizator:</strong> {radionica.organizator || "—"}</p>
      <p><strong>Tip:</strong> {radionica.tip || "—"}</p>
      
      <h3>Prisustva</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ background: "#e3e5fd"}}>
            <th style={{padding:8}}>Polaznik</th>
            <th style={{padding:8}}>Status</th>
            <th style={{padding:8}}>Rodno osjetljivo</th>
          </tr>
        </thead>
        <tbody>
          {prisustva.map(p => {
            const polIme = getPolaznik(p.polaznikId);
            const spol = getSpol(p.polaznikId);
            return (
              <tr key={p.id} style={{ background: "#f9faff"}}>
                <td style={{padding:8}}>{polIme}</td>
                <td style={{padding:8}}>{p.status}</td>
                <td style={{padding:8}}>{prikaziStatus(p.status, spol)}</td>
              </tr>
            );
          })}
          {prisustva.length === 0 && (
            <tr>
              <td colSpan={3} style={{padding:8}}>Nema prisustava za ovu radionicu.</td>
            </tr>
          )}
        </tbody>
      </table>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
