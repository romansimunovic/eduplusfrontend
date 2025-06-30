import React, { useEffect, useState } from "react";

const baseUrl = "https://eduplusbackend.onrender.com/api/polaznici";

export default function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [godina, setGodina] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchPolaznici = () =>
    fetch(baseUrl)
      .then((res) => res.json())
      .then(setPolaznici);

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const handleSubmit = () => {
    const payload = { ime, prezime, email, godinaRodenja: godina };
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${baseUrl}/${editId}` : baseUrl;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      setIme("");
      setPrezime("");
      setEmail("");
      setGodina("");
      setEditId(null);
      fetchPolaznici();
    });
  };

  const handleDelete = (id) => {
    fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(fetchPolaznici);
  };

  const handleEdit = (polaznik) => {
    setIme(polaznik.ime);
    setPrezime(polaznik.prezime);
    setEmail(polaznik.email);
    setGodina(polaznik.godinaRodenja);
    setEditId(polaznik.id);
  };

  return (
    <div>
      <h2>Polaznici</h2>
      <ul>
        {polaznici.map((p) => (
          <li key={p.id}>
            {p.ime} {p.prezime} | {p.email} | {p.godinaRodenja}{" "}
            <button onClick={() => handleEdit(p)}>Uredi</button>{" "}
            <button onClick={() => handleDelete(p.id)}>Obriši</button>
          </li>
        ))}
      </ul>

      <h3>{editId ? "Uredi" : "Dodaj"} polaznika</h3>
      <input value={ime} onChange={(e) => setIme(e.target.value)} placeholder="Ime" />
      <input value={prezime} onChange={(e) => setPrezime(e.target.value)} placeholder="Prezime" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={godina} onChange={(e) => setGodina(e.target.value)} placeholder="Godina rođenja" />
      <button onClick={handleSubmit}>Spremi</button>
    </div>
  );
}
