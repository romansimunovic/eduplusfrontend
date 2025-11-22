import React, { useEffect, useState, useRef, useContext } from 'react';
import { api } from '../api';
import { AuthContext } from '../AuthContext'; 

export default function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
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
      const [r, p, pr] = await Promise.all([
        api.get('/api/radionice'), api.get('/api/polaznici'), api.get('/api/prisustva'),
      ]);
      setRadionice(Array.isArray(r) ? r : []);
      setPolaznici(Array.isArray(p) ? p : []);
      setPrisustva(Array.isArray(pr) ? pr : []);
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
      {/* Nemoj koristiti largeFont ako ga nema u AuthContext! */}
      <h2>Pregled radionica i polaznika</h2>
      <button onClick={refreshAll} disabled={loading}>
        {loading ? 'Učitavam...' : 'Osvježi'}
      </button>
      {statusMsg && <div className="alert">{statusMsg}</div>}
      <section>
        <h3>Radionice ({radionice.length})</h3>
        <ul>
          {radionice.map(r => (
            <li key={r.id}><strong>{r.naziv}</strong> ({r.datum})</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Polaznici ({polaznici.length})</h3>
        <ul>
          {polaznici.map(p => (
            <li key={p.id}>{p.prezime} {p.ime} ({p.email})</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
