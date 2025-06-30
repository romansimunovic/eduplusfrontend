import React, { useEffect, useState } from "react";

const baseUrl = "https://eduplusbackend.onrender.com/api/radionice";

export default function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchRadionice = () =>
    fetch(baseUrl)
      .then((res) => res.json())
      .then(setRadionice);

  useEffect(() => {
    fetchRadionice();
  }, []);

  const handleSubmit = () => {
    const payload = { naziv, opis };
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${baseUrl}/${editId}` : baseUrl;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      setNaziv("");
      setOpis("");
      setEditId(null);
      fetchRadionice();
    });
  };

  const handleDelete = (id) => {
    fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(fetchRadionice);
  };

  const handleEdit = (r) => {
    setNaziv(r.naziv);
    setOpis(r.opis);
    setEditId(r.id);
  };

  return (
    <div>
      <h2>Radionice</h2>
      <ul>
        {radionice.map((r) => (
          <li key={r.id}>
            {r.naziv} - {r.opis}{" "}
            <button onClick={() => handleEdit(r)}>Uredi</button>{" "}
            <button onClick={() => handleDelete(r.id)}>Obriši</button>
          </li>
        ))}
      </ul>

      <h3>{editId ? "Uredi" : "Dodaj"} radionicu</h3>
      <input value={naziv} onChange={(e) => setNaziv(e.target.value)} placeholder="Naziv" />
      <input value={opis} onChange={(e) => setOpis(e.target.value)} placeholder="Opis" />
      <button onClick={handleSubmit}>Spremi</button>
    </div>
  );
}
