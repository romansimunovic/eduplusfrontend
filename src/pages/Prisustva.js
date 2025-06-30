import React, { useEffect, useState } from "react";

const baseUrl = "https://eduplusbackend.onrender.com/api/prisustva";

export default function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);

  useEffect(() => {
    fetch(baseUrl)
      .then((res) => res.json())
      .then(setPrisustva);
  }, []);

  return (
    <div>
      <h2>Prisustva</h2>
      <ul>
        {prisustva.map((p) => (
          <li key={p.id}>
            Polaznik ID: {p.polaznikId}, Radionica ID: {p.radionicaId}, Status: {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
