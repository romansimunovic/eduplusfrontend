import React, { useState } from 'react';
import { api } from '../api';

function DevData() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const generate = async () => {
    setLoading(true);
    setMsg('Generiram nove demo podatke...');
    try {
      await api.post('/api/dev/seed', {});
      setMsg('Gotovo! Otvori Home i klikni “Osvježi” da vidiš promjene.');
    } catch (e) {
      setMsg(e?.message || 'Greška pri generiranju.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
      <h2>Dev podaci</h2>
      <p>Ovaj gumb briše dev bazu i puni novu random kombinaciju radionica + polaznika.</p>
      <button onClick={generate} disabled={loading} style={{ padding: '10px 16px' }}>
        {loading ? 'Molim pričekaj…' : 'Generiraj nove podatke'}
      </button>

      {msg && (
        <div style={{
          marginTop: 16, padding: 10, borderRadius: 6,
          background: '#f3f7ff', border: '1px solid #cfe0ff'
        }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <a href="/">← Nazad na Home</a>
      </div>
    </div>
  );
}

export default DevData;
