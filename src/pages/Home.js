// src/pages/Home.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';

function Home() {
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

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO',
  };

  useEffect(() => {
    // ping (može vratiti plain text; api.get to tolerira)
    api.get('/api/ping').catch(() => {});
    refreshOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Ručni refresh iz baze */
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

      // Ako odabrana više ne postoji ili ništa nije odabrano -> uzmi prvu po nazivu
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

  const showMessage = (msg, type = 'info') => {
    setStatusMsg(msg);
    setStatusType(type);
    if (msgTidRef.current) clearTimeout(msgTidRef.current);
    msgTidRef.current = setTimeout(() => {
      setStatusMsg('');
      setStatusType('info');
    }, 3000);
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

  /** Klik na polaznika: ciklički mijenja status i sprema u DB */
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
          // fallback: refetch
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

  // Radionice sortirane po nazivu
  const radioniceSorted = useMemo(
    () =>
      [...radionice].sort((a, b) =>
        (a.naziv || '').localeCompare(b.naziv || '', 'hr', { sensitivity: 'base' })
      ),
    [radionice]
  );

  // Sudionici za odabranu radionicu (join) — sortirani po prezimenu pa imenu
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
      {/* Akcije na vrhu */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1rem',
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button onClick={refreshOnly} disabled={loading}>
          {loading ? 'Učitavam…' : 'Osvježi'}
        </button>
        {lastSync && (
          <small style={{ opacity: 0.7 }}>
            zadnje ažuriranje: {lastSync.toLocaleTimeString()}
          </small>
        )}
      </div>

      {/* Status traka */}
      {statusMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '10px',
            backgroundColor:
              statusType === 'success' ? '#d4edda'
              : statusType === 'error' ? '#f8d7da'
              : '#d1ecf1',
            color:
              statusType === 'success' ? '#155724'
              : statusType === 'error' ? '#721c24'
              : '#0c5460',
            border: '1px solid',
            borderColor:
              statusType === 'success' ? '#c3e6cb'
              : statusType === 'error' ? '#f5c6cb'
              : '#bee5eb',
            borderRadius: '5px'
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Dvostupčani prikaz */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Lijevo — radionice (abecedno) */}
        <div style={{ flex: 1 }}>
          <h3>Popis svih radionica</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {radioniceSorted.map(r => (
              <li
                key={r.id}
                onClick={() => setSelectedRadionica(r)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedRadionica?.id === r.id ? '#d4ebff' : '#f3f3f3',
                  padding: '10px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc'
                }}
              >
                <strong>{r.naziv}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Desno — sudionici (abecedno po prezimenu) */}
        <div style={{ flex: 1 }}>
          <h3>Popis sudionika</h3>
          {selectedRadionica ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sudioniciSorted.map(({ prisustvo: pr, polaznik: pol }) => (
                <li
                  key={`${selectedRadionica.id}-${pol.id}`}
                  onClick={() => handleClick(pol)}
                  style={{
                    backgroundColor: getColor(pr.status),
                    padding: '10px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{pol.ime} {pol.prezime}</span>
                  <span style={{ fontStyle: 'italic' }}>
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

export default Home;
