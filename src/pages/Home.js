// src/pages/Home.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';

export default function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [lastSync, setLastSync] = useState(null);

  const msgTidRef = useRef(null);
  useEffect(() => () => msgTidRef.current && clearTimeout(msgTidRef.current), []);

  // prikaz gumba za seed: samo ADMIN + (dev build ili REACT_APP_ENABLE_SEED=true)
  const isAdmin = (localStorage.getItem('role') || '').toUpperCase() === 'ADMIN';
  const enableSeed =
    process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_SEED === 'true';

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO',
  };

  useEffect(() => {
    api.get('/api/ping').catch(() => {});
    refreshOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (msg, type = 'info') => {
    setStatusMsg(msg);
    setStatusType(type);
    if (msgTidRef.current) clearTimeout(msgTidRef.current);
    msgTidRef.current = setTimeout(() => {
      setStatusMsg('');
      setStatusType('info');
    }, 3000);
  };

  // samo povuci iz baze (ništa ne brišemo)
  const refreshOnly = async () => {
    setLoading(true);
    try {
      const [r, p, pr] = await Promise.all([
        api.get('/api/radionice'),
        api.get('/api/polaznici'),
        api.get('/api/prisustva'),
      ]);

      const rArr = Array.isArray(r) ? r : [];
      const pArr = Array.isArray(p) ? p : [];
      const prArr = Array.isArray(pr) ? pr : [];

      setRadionice(rArr);
      setPolaznici(pArr);
      setPrisustva(prArr);

      setSelectedRadionica(prev => {
        if (prev && rArr.find(x => x.id === prev.id)) return prev;
        const first = [...rArr].sort((a, b) =>
          (a.naziv || '').localeCompare(b.naziv || '', 'hr', { sensitivity: 'base' })
        )[0];
        return first || null;
      });

      setLastSync(new Date());
      showMessage('Podaci učitani.', 'success');
    } catch (err) {
      console.error('refreshOnly error:', err);
      showMessage(`Greška pri dohvaćanju podataka. ${err?.message || ''}`.trim(), 'error');
    } finally {
      setLoading(false);
    }
  };

  // admin/dev: regeneriraj u bazi pa ponovno učitaj
  const handleSeed = async () => {
    if (!isAdmin || !enableSeed) return;
    setLoading(true);
    showMessage('Generiram nove podatke…', 'info');
    try {
      await api.post('/api/dev/seed', {});
      await refreshOnly();
      showMessage('Novi podaci generirani!', 'success');
    } catch (err) {
      console.error('seed error:', err);
      showMessage(`Greška pri generiranju. ${err?.message || ''}`.trim(), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status, spol) => {
    const zensko = (spol || '').toUpperCase() === 'Ž';
    switch (status) {
      case 'PRISUTAN': return zensko ? 'Prisutna' : 'Prisutan';
      case 'IZOSTAO': return zensko ? 'Izostala' : 'Izostao';
      case 'ODUSTAO': return zensko ? 'Odustala' : 'Odustao';
      default: return 'Nepoznato';
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRISUTAN': return '#c8facc';
      case 'IZOSTAO': return '#ffcaca';
      case 'ODUSTAO': return '#f9f3b6';
      default: return '#ffffff';
    }
  };

  // klik na polaznika: promijeni status i spremi u DB
  const handleClick = async (polaznik) => {
    if (!selectedRadionica) return;

    const current = prisustva.find(
      p => p.polaznikId === polaznik.id && p.radionicaId === selectedRadionica.id
    );

    const currentStatus = current ? current.status : 'NEPOZNATO';
    const newStatus = statusCycle[currentStatus];
    const payload = { polaznikId: polaznik.id, radionicaId: selectedRadionica.id, status: newStatus };

    try {
      if (current) {
        await api.put(`/api/prisustva/${current.id}`, payload);
        setPrisustva(prev => prev.map(p => (p.id === current.id ? { ...p, status: newStatus } : p)));
      } else {
        const created = await api.post('/api/prisustva', payload);
        if (created && created.id) {
          setPrisustva(prev => [...prev, { ...payload, id: created.id }]);
        } else {
          const fresh = await api.get('/api/prisustva');
          setPrisustva(Array.isArray(fresh) ? fresh : []);
        }
      }
      showMessage('Status ažuriran.', 'success');
    } catch (err) {
      console.error('save status error:', err);
      showMessage(`Greška pri spremanju. ${err?.message || ''}`.trim(), 'error');
    }
  };

  const radioniceSorted = useMemo(
    () =>
      [...radionice].sort((a, b) =>
        (a.naziv || '').localeCompare(b.naziv || '', 'hr', { sensitivity: 'base' })
      ),
    [radionice]
  );

  const sudioniciSorted = useMemo(() => {
    if (!selectedRadionica) return [];
    const prForRad = prisustva.filter(pr => pr.radionicaId === selectedRadionica.id);

    const joined = prForRad
      .map(pr => {
        const pol = polaznici.find(p => p.id === pr.polaznikId);
        return pol ? { prisustvo: pr, polaznik: pol } : null;
      })
      .filter(Boolean);

    return joined.sort((a, b) => {
      const ap = a.polaznik.prezime || '';
      const bp = b.polaznik.prezime || '';
      const prezCmp = ap.localeCompare(bp, 'hr', { sensitivity: 'base' });
      if (prezCmp !== 0) return prezCmp;
      const ai = a.polaznik.ime || '';
      const bi = b.polaznik.ime || '';
      return ai.localeCompare(bi, 'hr', { sensitivity: 'base' });
    });
  }, [selectedRadionica, prisustva, polaznici]);

  return (
    <>
      <div style={{
        textAlign: 'center',
        marginBottom: '1rem',
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button className="btn btn-outline" onClick={refreshOnly} disabled={loading}>
          {loading ? 'Učitavam…' : 'Osvježi'}
        </button>

        {enableSeed && isAdmin && (
          <button className="btn btn-primary" onClick={handleSeed} disabled={loading}>
            {loading ? 'Molim pričekaj…' : 'Generiraj nove podatke'}
          </button>
        )}

        {lastSync && (
          <small style={{ opacity: 0.7 }}>
            zadnje ažuriranje: {lastSync.toLocaleTimeString()}
          </small>
        )}
      </div>

      {statusMsg && (
        <div
          className={`alert ${statusType === 'success' ? 'alert-success' : statusType === 'error' ? 'alert-error' : 'alert-info'}`}
          style={{ marginBottom: '1rem' }}
        >
          {statusMsg}
        </div>
      )}

      <div className="container" style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h3>Popis svih radionica</h3>
          <ul>
            {radioniceSorted.map(r => (
              <li
                key={r.id}
                onClick={() => setSelectedRadionica(r)}
                className={selectedRadionica?.id === r.id ? 'radionica-oznacena' : ''}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedRadionica?.id === r.id ? '#e0f0ff' : '#f6f9ff'
                }}
              >
                <strong>{r.naziv}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Popis sudionika</h3>
          {selectedRadionica ? (
            <ul>
              {sudioniciSorted.map(({ prisustvo: pr, polaznik: pol }) => (
                <li
                  key={`${selectedRadionica.id}-${pol.id}`}
                  onClick={() => handleClick(pol)}
                  style={{
                    backgroundColor: getColor(pr.status),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{pol.ime} {pol.prezime}</span>
                  <span className="status-pill" style={{ fontStyle: 'italic' }}>
                    {getStatusLabel(pr.status, pol.spol)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Odaberi radionicu za prikaz sudionika.</p>
          )}
        </div>
      </div>
    </>
  );
}
