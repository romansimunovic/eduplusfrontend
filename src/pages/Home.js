import React, { useEffect, useState } from 'react';
import { api } from '../api';

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('');

  // cikliranje statusa klikom
  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO',
  };

  useEffect(() => {
    // ping (može vratiti non-JSON; api.get to tolerira)
    api.get('/api/ping').catch(() => {});
    fetchAll();
  }, []);

  const hrCmp = (a = '', b = '') =>
    String(a).localeCompare(String(b), 'hr', { sensitivity: 'base' });

  const fetchAll = async () => {
    try {
      const [radioniceData, polazniciData, prisustvaData] = await Promise.all([
        api.get('/api/radionice'),
        api.get('/api/polaznici'),
        api.get('/api/prisustva'),
      ]);

      const r = Array.isArray(radioniceData) ? radioniceData : [];
      const p = Array.isArray(polazniciData) ? polazniciData : [];
      const pr = Array.isArray(prisustvaData) ? prisustvaData : [];

      // sort radionice po nazivu
      const rSorted = [...r].sort((a, b) => hrCmp(a?.naziv, b?.naziv));
      setRadionice(rSorted);
      // polaznike ne moramo globalno sortirati jer u prikazu sortiramo prema prisustvima,
      // ali spremamo kakvi jesu
      setPolaznici(p);
      setPrisustva(pr);
      setSelectedRadionica(rSorted[0] || null);
    } catch (err) {
      showMessage(`Greška pri dohvaćanju podataka. ${err?.message || ''}`.trim(), 'error');
    }
  };

  const showMessage = (msg, type = 'info') => {
    setStatusMsg(msg);
    setStatusType(type);
    window.clearTimeout((showMessage as any)?.__t);
    (showMessage as any).__t = window.setTimeout(() => {
      setStatusMsg('');
      setStatusType('');
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

    const path = current ? `/api/prisustva/${current.id}` : `/api/prisustva`;

    try {
      if (current) {
        await api.put(path, payload);
        // lokalno ažuriranje
        setPrisustva((prev) =>
          prev.map((p) => (p.id === current.id ? { ...p, status: newStatus } : p))
        );
      } else {
        const created = await api.post(path, payload);
        if (created?.id) {
          setPrisustva((prev) => [...prev, { ...payload, id: created.id }]);
        } else {
          // fallback: povuci svježa prisustva
          const fresh = await api.get('/api/prisustva');
          if (Array.isArray(fresh)) setPrisustva(fresh);
        }
      }
      showMessage('Status ažuriran', 'success');
    } catch (err) {
      showMessage(`Greška pri spremanju prisustva. ${err?.message || ''}`.trim(), 'error');
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
      showMessage(`Greška pri generiranju podataka. ${err?.message || ''}`.trim(), 'error');
    } finally {
      setLoading(false);
    }
  };

  // helper: dohvat polaznika po id
  const byId = (id) => polaznici.find((p) => p.id === id);

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
        {/* Lijevo: Radionice (sortirane po nazivu) */}
        <div style={{ flex: 1 }}>
          <h3>Popis svih radionica</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {radionice.map((r) => (
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

        {/* Desno: Polaznici prisutni na odabranoj radionici (sort po prezime → ime) */}
        <div style={{ flex: 1 }}>
          <h3>Popis sudionika</h3>
          {selectedRadionica ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {prisustva
                .filter((pr) => pr.radionicaId === selectedRadionica.id)
                .sort((a, b) => {
                  const pa = byId(a.polaznikId);
                  const pb = byId(b.polaznikId);
                  if (!pa || !pb) return 0;
                  const prezCmp = hrCmp(pa.prezime, pb.prezime);
                  return prezCmp !== 0 ? prezCmp : hrCmp(pa.ime, pb.ime);
                })
                .map((pr) => {
                  const polaznik = byId(pr.polaznikId);
                  if (!polaznik) return null;

                  return (
                    <li
                      key={`${selectedRadionica.id}-${polaznik.id}`}
                      onClick={() => handleClick(polaznik)}
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
                        {polaznik.ime} {polaznik.prezime}
                      </span>
                      <span style={{ fontStyle: 'italic' }}>
                        {getStatusLabel(pr.status, polaznik.spol)}
                      </span>
                    </li>
                  );
                })}
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
