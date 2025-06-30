import React, { useEffect, useState } from "react";

const baseUrl = "https://eduplusbackend.onrender.com";

export default function Evidencija() {
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [polaznikId, setPolaznikId] = useState("");
  const [radionicaId, setRadionicaId] = useState("");
  const [status, setStatus] = useState("PRISUTAN");

  useEffect(() => {
    fetch(`${baseUrl}/api/polaznici`).then((res) => res.json()).then(setPolaznici);
    fetch(`${baseUrl}/api/radionice`).then((res) => res.json()).then(setRadionice);
  }, []);

  const evidentiraj = () => {
    const params = new URLSearchParams({ polaznikId, radionicaId, status });
    fetch(`${baseUrl}/api/prisustva/evidentiraj?${params.toString()}`, { method: "POST" })
      .then(() => alert("Prisustvo evidentirano!"));
  };

  return (
    <div>
      <h2>Evidentiranje prisustva</h2>
      <select value={polaznikId} onChange={(e) => setPolaznikId(e.target.value)}>
        <option value="">-- odaberi polaznika --</option>
        {polaznici.map((p) => (
          <option key={p.id} value={p.id}>{p.ime} {p.prezime}</option>
        ))}
      </select>

      <select value={radionicaId} onChange={(e) => setRadionicaId(e.target.value)}>
        <option value="">-- odaberi radionicu --</option>
        {radionice.map((r) => (
          <option key={r.id} value={r.id}>{r.naziv}</option>
        ))}
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="PRISUTAN">PRISUTAN</option>
        <option value="OPRAVDANO">OPRAVDANO</option>
        <option value="NEOPRAVDANO">NEOPRAVDANO</option>
      </select>

      <button onClick={evidentiraj}>Evidentiraj</button>
    </div>
  );
}
