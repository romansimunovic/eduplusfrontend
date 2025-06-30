import React, { useEffect, useState } from "react";

function App() {
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [polaznikId, setPolaznikId] = useState("");
  const [radionicaId, setRadionicaId] = useState("");
  const [status, setStatus] = useState("PRISUTAN");

  const baseUrl = "https://eduplusbackend.onrender.com";

  useEffect(() => {
    fetch(`${baseUrl}/api/polaznici`)
      .then((res) => res.json())
      .then(setPolaznici);

    fetch(`${baseUrl}/api/radionice`)
      .then((res) => res.json())
      .then(setRadionice);
  }, []);

  const evidentirajPrisustvo = () => {
    const params = new URLSearchParams({
      polaznikId,
      radionicaId,
      status,
    });

    fetch(`${baseUrl}/api/prisustva/evidentiraj?${params.toString()}`, {
      method: "POST",
    }).then(() => alert("Prisustvo evidentirano!"));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>EdukatorPlus</h1>

      <div>
        <label>Polaznik: </label>
        <select onChange={(e) => setPolaznikId(e.target.value)} value={polaznikId}>
          <option value="">-- odaberi --</option>
          {polaznici.map((p) => (
            <option key={p.id} value={p.id}>
              {p.ime} {p.prezime}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Radionica: </label>
        <select onChange={(e) => setRadionicaId(e.target.value)} value={radionicaId}>
          <option value="">-- odaberi --</option>
          {radionice.map((r) => (
            <option key={r.id} value={r.id}>
              {r.naziv}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Status: </label>
        <select onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="PRISUTAN">PRISUTAN</option>
          <option value="OPRAVDANO">OPRAVDANO</option>
          <option value="NEOPRAVDANO">NEOPRAVDANO</option>
        </select>
      </div>

      <button onClick={evidentirajPrisustvo} style={{ marginTop: "1rem" }}>
        Evidentiraj
      </button>
    </div>
  );
}

export default App;
