// src/pages/Home.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';

export default function Home() {
  // --- state ---
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [lastSync, setLastSync] = useState(null);

  // --- helpers ---
  const msgTidRef = useRef(null);
  useEffect(() => () => msgTidRef.current && clearTimeout(msgTidRef.current), []);

  // samo ADMIN vidi gumb za generiranje
  const isAdmin = (localStorage.getItem('role') || '').toUpperCase() === 'ADMIN';

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO',
  };

  const showMessage = (msg, type = 'info', ttlMs = 3000) => {
    setStatusMsg(msg);
    setStatusType(type);
    if (msgTidRef.current) clearTimeout(msgTidRef.current);
    msgTidRef.current = setTimeout(() => {
      setStatusMsg('');
      setStatusType('info');
    }, ttlMs);
  };

  // --- init ---
  useEffect(() => {
    // “warm up” backend i povuci podatke
    api.get('/api/ping').catch(() => {});
    refreshOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- data loading ---
  const refreshOnly = async () => {
    setLoading(true);
    try {
      const [r, p, pr] = await Promise.all([
        api.get('/api/radionice'),
        api.get('/api/polaznici'),
        api.get('/api/prisustva'),
      ]);

      const rArr = Array.isArray(r) ? r : (Array.isArray(r?.data) ? r.data : []);
      const pArr = Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []);
      const prArr = Array.isArray(pr) ? pr : (Array.isArray(pr?.data) ? pr.data : []);

      setRadionice(rArr);
      setPolaznici(pArr);
      setPrisustva(prArr);

      // zadrži prethodno odabranu radionicu ako i dalje postoji, inače prvu po nazivu
      setSelectedRadionica(prev => {
        if (prev && rArr.find(x => String(x.id) === String(prev.id))) return prev;
        const first = [...rArr].sort((a, b) =>
          (a.naziv || '').localeCompare(b.naziv || '', 'hr', { sensitivity: 'base' })
        )[0];
        return first || null;
      });

      setLastSync(new Date());
      showMessage('Podaci učitani.', 'success', 1500);
    } catch (err) {
      console.error('refreshOnly error:', err);
      showMessage(`Greška pri dohvaćanju podataka. ${err?.message || ''}`.trim(), 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- admin: generiraj nove podatke ---
  const handleSeed = async () => {
    if (!isAdmin) return;
    setLoading(true);
    showMessage('Generiram nove podatke…', 'info', 5000);
    try {
      await api.post('/api/admin/seed', {}); // backend reseed
      await refreshOnly(); // povuci friško iz baze
      showMessage('Novi podaci generirani!', 'success', 2000);
    } catch (err) {
      console.error('seed error:', err);
      showMessage(`Greška pri generiranju. ${err?.message || ''}`.trim(), 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- status label & boja ---
  const getStatusLabel = (status, spol) => {
    const zensko = (spol || '').toUpperCase() === 'Ž';
    switch (status) {
      case 'PRISUTAN': return zensko ? 'Prisutna' : 'Prisutan';
      case 'IZOSTAO':  return zensko ? 'Izostala' : 'Izostao';
      case 'ODUSTAO':  return zensko ? 'Odustala' : 'Odustao';
      default:         return 'Nepoznato';
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRISUTAN': return '#c8facc';
      case 'IZOSTAO':  return '#ffcaca';
      case 'ODUSTAO':  return '#f9f3b6';
      default:         return '#ffffff';
    }
  };

  // --- klik na polaznika: ciklično promijeni status i spremi ---
  const handleClick = async (polaznik) => {
    if (!selectedRadionica) return;

    const current = prisustva.find(
      p => String(p.polaznikId) === String(polaznik.id) && String(p.radionicaId) === String(selectedRadionica.id)
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
        const createdObj = created?.data && created.data.id ? created.data : created;
        if (createdObj && createdObj.id) {
          setPrisustva(prev => [...prev, { ...payload, id: createdObj.id }]);
        } else {
          // fallback – povuci svježe
          const fresh = await api.get('/api/prisustva');
          const freshArr = Array.isArray(fresh) ? fresh : (Array.isArray(fresh?.data) ? fresh.data : []);
          setPrisustva(freshArr);
        }
      }
      showMessage('Status ažuriran.', 'success', 1200);
    } catch (err) {
      console.error('save status error:', err);
      showMessage(`Greška pri spremanju. ${err?.message || ''}`.trim(), 'error');
    }
  };

  // --- memorirani prikazi ---
  const radioniceSorted = useMemo(
    () =>
      [...radionice].sort((a, b) =>
        (a.naziv || '').localeCompare(b.naziv || '', 'hr', { sensitivity: 'base' })
      ),
    [radionice]
  );

  const sudioniciSorted = useMemo(() => {
    if (!selectedRadionica) return [];
    const prForRad = prisustva.filter(pr => String(pr.radionicaId) === String(selectedRadionica.id));

    const joined = prForRad
      .map(pr => {
        const pol = polaznici.find(p => String(p.id) === String(pr.polaznikId));
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

  // --- UI ---
  return (
    <>
      <div
        style={{
          textAlign: 'center',
          marginBottom: '1rem',
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <button className="btn btn-outline" onClick={refreshOnly} disabled={loading}>
          {loading ? 'Učitavam…' : 'Osvježi'}
        </button>

        {isAdmin && (
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
          className={`alert ${
            statusType === 'success'
              ? 'alert-success'
              : statusType === 'error'
              ? 'alert-error'
              : 'alert-info'
          }`}
          style={{ marginBottom: '1rem' }}
        >
          {statusMsg}
        </div>
      )}

      <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3>Popis svih radionica {radioniceSorted.length ? `(${radioniceSorted.length})` : ''}</h3>
          {radioniceSorted.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              {radioniceSorted.map(r => (
                <li
                  key={r.id}
                  onClick={() => setSelectedRadionica(r)}
                  className={selectedRadionica?.id === r.id ? 'radionica-oznacena' : ''}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    backgroundColor: selectedRadionica?.id === r.id ? '#e0f0ff' : '#f6f9ff'
                  }}
                  title={r.naziv}
                >
                  <strong>{r.naziv}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nema dostupnih radionica.</p>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 320 }}>
          <h3>
            Popis sudionika
            {selectedRadionica ? ` — ${selectedRadionica.naziv}` : ''}
            {selectedRadionica ? ` (${sudioniciSorted.length})` : ''}
          </h3>

          {selectedRadionica ? (
            sudioniciSorted.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                {sudioniciSorted.map(({ prisustvo: pr, polaznik: pol }) => (
                  <li
                    key={`${selectedRadionica.id}-${pol.id}`}
                    onClick={() => handleClick(pol)}
                    style={{
                      backgroundColor: getColor(pr.status),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      padding: '10px 12px'
                    }}
                    title="Klikni za promjenu statusa"
                  >
                    <span>{pol.ime} {pol.prezime}</span>
                    <span className="status-pill" style={{ fontStyle: 'italic' }}>
                      {getStatusLabel(pr.status, pol.spol)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Za ovu radionicu trenutno nema evidentiranih prisustava.</p>
            )
          ) : (
            <p>Odaberi radionicu za prikaz sudionika.</p>
          )}
        </div>
      </div>
    </>
  );
}
