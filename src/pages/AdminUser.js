// src/pages/AdminUsers.js
import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/api/users')
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setErr('Greška pri učitavanju korisnika.'));
  }, []);

  if (err) return <div style={{ padding: 16, background: '#f8d7da' }}>{err}</div>;

  return (
    <div>
      <h3>Registrirani korisnici</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr><th>ID</th><th>Email</th><th>Uloga</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
