import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api/api';

export default function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const msgTidRef = useRef(null);

  useEffect(() => {
    refreshAll();
    return () => msgTidRef.current && clearTimeout(msgTidRef.current);
  }, []);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        api.get('/radionice'),
        api.get('/polaznici')
      ]);
      setRadionice(Array.isArray(r.data) ? r.data : []);
      setPolaznici(Array.isArray(p.data) ? p.data : []);
      setStatusMsg('Podaci učitani.');
      msgTidRef.current = setTimeout(() => setStatusMsg(''), 2000);
    } catch {
      setStatusMsg('Greška pri dohvatu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Pregled radionica i polaznika</h2>
      <button onClick={refreshAll} disabled={loading}>
        {loading ? 'Učitavam...' : 'Osvježi'}
      </button>
      {statusMsg && <div className="alert">{statusMsg}</div>}
      
      <section>
        <h3>Radionice ({radionice.length})</h3>
        <table style={{ width: "100%", marginBottom: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{background:"#f2f4fa"}}>
              <th style={{padding:8}}>Naziv</th>
              <th style={{padding:8}}>Datum</th>
              <th style={{padding:8}}>Tip</th>
              <th style={{padding:8}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {radionice.map(r => (
              <tr key={r.id}>
                <td style={{padding:8}}>{r.naziv}</td>
                <td style={{padding:8}}>{r.datum}</td>
                <td style={{padding:8}}>{r.tip || "—"}</td>
                <td style={{padding:8}}>
                  {r.aktivna ? <span style={{color: "#148814"}}>Aktivna</span> : <span style={{color: "#b90020"}}>Neaktivna</span>}
                </td>
              </tr>
            ))}
            {radionice.length === 0 && (
              <tr><td colSpan={4} style={{padding:8}}>Nema rezultata.</td></tr>
            )}
          </tbody>
        </table>
      </section>
      <section>
        <h3>Polaznici ({polaznici.length})</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{background:"#f2f4fa"}}>
              <th style={{padding:8}}>Ime i prezime</th>
              <th style={{padding:8}}>Email</th>
              <th style={{padding:8}}>Grad</th>
              <th style={{padding:8}}>Godina rođenja</th>
            </tr>
          </thead>
          <tbody>
            {polaznici.map(p => (
              <tr key={p.id}>
                <td style={{padding:8}}>{p.prezime} {p.ime}</td>
                <td style={{padding:8}}>{p.email}</td>
                <td style={{padding:8}}>{p.grad || "—"}</td>
                <td style={{padding:8}}>{p.godinaRodenja || "—"}</td>
              </tr>
            ))}
            {polaznici.length === 0 && (
              <tr><td colSpan={4} style={{padding:8}}>Nema rezultata.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
