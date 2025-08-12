
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info');

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO',
  };

  useEffect(() => {
    // "Ping" backend (možda ne vraća JSON — api.get to tolerira)
    api.get('/api/ping').catch(() => {});
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [r, p, pr] = await Promise.all([
        api.get('/api/radionice'),
        api.get('/api/polaznici'),
        api.get('/api/prisustva'),
      ]);

      const radioniceArr = Array.isArray(r) ? r : [];
      setRadionice(radioniceArr);
      setPolaznici(Array.isArray(p) ? p : []);
      setPrisustva(Array.isArray(pr) ? pr : []);

      // ako ništa nije odabrano, uzmi prvu po nazivu
      if (!selectedRadionica && radioniceArr.length > 0) {
        const first = [...radioniceArr].sort((a, b) =>
          (a.naziv || '').localeCompare(b.naziv || '', 'hr', { sensitivity: 'base' })
        )[0];
        setSelectedRadionica(first);
      }
      showMessage('Podaci učitani.', 'success');
    } catch (err) {
      showMessage(`Greška pri dohvaćanju podataka. ${err?.message || ''}`.trim(), 'error');
    }
  };

  const showMessage = (msg, type = 'info') => {
    setStatusMsg(msg);
    setStatusType(type);
    if (showMessage._timeoutId) clearTimeout(showMessage._timeoutId);
    showMessage._timeoutId = setTimeout(() => {
      setStatusMsg('');
      setStatusType('info');
    }, 3000);
  };

  const getStatusLabel = (status, spol) => {
    const zensko = (spol || '').toUpperCase() === 'Ž';
    switch (status) {
      case 'PRISUTAN':
        return zensko ? 'Prisutna' : 'Prisutan';
      case 'IZOSTAO':
        return zensko ? 'Izostala' : 'Izostao';
      case 'ODUSTAO':
        return zensko ? 'Odustala' : 'Odustao';
      default:
        return 'Nepoznato';
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRISUTAN':
        return '#c8facc';
      case 'IZOSTAO':
        return '#ffcaca';
      case 'ODUSTAO':
        return '#f9f3b6';
      default:
        return '#ffffff';
    }
  };

  const handleClick = async (polaznik) => {
    if (!selectedRadionica) return;

    const current = prisustva.find(
      (p) => p.polaznikId === polaznik.id && p.radionicaId === selectedRadionica.id
    );

    const currentStatus = current ? current.status : 'NEPOZNATO';
    const newStatus = statusCycle[currentStatus];

    const payload = {
      polaznikId: polaznik.id,
      radionicaId: selectedRadionica.id,
      status: newStatus,
    };

    try {
      if (current) {
        await api.put(`/api/prisustva/${current.id}`, payload);
        // lokalno ažuriraj
        setPrisustva((prev) =>
          prev.map((p) => (p.id === current.id ? { ...p, status: newStatus } : p))
        );
      } else {
        const created = await api.post('/api/prisustva', payload);
        if (created && created.id) {
          setPrisustva((prev) => [...prev, { ...payload, id: created.id }]);
        } else {
          // ako backend vrati 204 bez tijela, povuci svježe
          const fresh = await api.get('/api/prisustva');
          setPrisustva(Array.isArray(fresh) ? fresh : []);
        }
      }

      showMessage('Status ažuriran.', 'success');
    } catch (err) {
      showMessage(`Greška pri spremanju. ${err?.message || ''}`.trim(), 'error');
    }
  };

  const handleGenerateData = async () => {
    setLoading(true);
    showMessage('Generiram nove podatke...', 'info');
    try {
      await api.post('/api/dev/seed', {});
      await fetchAll();
      showMessage('Podaci uspješno generirani!', 'success');
    } catch (err) {
      showMessage(`Greška pri generiranju. ${err?.message || ''}`.trim(), 'error');
    } finally {
      setLoading(false);
    }
  };

  // radionice sortirane po nazivu
  const radioniceSorted = useMemo(
    () =>
      [...radionice].sort((a, b) =>
        (a.naziv || '').localeCompare(b.naziv || '', 'hr', { sensitivity: 'base' })
      ),
    [radionice]
  );

  // sudionici za odabranu radionicu, sortirani po PREZIMENU
  const sudioniciSorted = useMemo(() => {
    if (!selectedRadionica) return [];
    // skupi prisustva za radionicu
    const prForRad = prisustva.filter((pr) => pr.radionicaId === selectedRadionica.id);

    // join na polaznike
    const withPolaznik = prForRad
      .map((pr) => {
        const pol = polaznici.find((p) => p.id === pr.polaznikId);
        if (!pol) return null;
        return { prisustvo: pr, polaznik: pol };
      })
      .filter(Boolean);

    // sort po prezimenu (fallback na ime)
    return withPolaznik.sort((a, b) => {
      const aPrez = a.polaznik.prezime || '';
      const bPrez = b.polaznik.prezime || '';
      const prezCmp = aPrez.localeCompare(bPrez, 'hr', { sensitivity: 'base' });
      if (prezCmp !== 0) return prezCmp;
      const aIme = a.polaznik.ime || '';
      const bIme = b.polaznik.ime || '';
      return aIme.localeCompare(bIme, 'hr', { sensitivity: 'base' });
    });
  }, [selectedRadionica, prisustva, polaznici]);

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button onClick={handleGenerateData} disabled={loading}>
          {loading ? 'Molim pričekaj...' : 'Generiraj nove podatke'}
        </button>
      </div>

      {statusMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '10px',
            backgroundColor:
              statusType === 'success'
                ? '#d4edda'
                : statusType === 'error'
                ? '#f8d7da'
                : '#d1ecf1',
            color:
              statusType === 'success'
                ? '#155724'
                : statusType === 'error'
                ? '#721c24'
                : '#0c5460',
            border: '1px solid',
            borderColor:
              statusType === 'success'
                ? '#c3e6cb'
                : statusType === 'error'
                ? '#f5c6cb'
                : '#bee5eb',
            borderRadius: '5px',
          }}
        >
          {statusMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Lijevi stupac — radionice (sortirano po nazivu) */}
        <div style={{ flex: 1 }}>
          <h3>Popis svih radionica</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {radioniceSorted.map((r) => (
              <li
                key={r.id}
                onClick={() => setSelectedRadionica(r)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedRadionica?.id === r.id ? '#d4ebff' : '#f3f3f3',
                  padding: '10px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                }}
              >
                <strong>{r.naziv}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Desni stupac — sudionici (sortirano po prezimenu) */}
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
                    cursor: 'pointer',
                  }}
                >
                  <span>
                    {pol.ime} {pol.prezime}
                  </span>
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
