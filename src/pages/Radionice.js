const handleAddOrUpdate = () => {
  if (!naziv.trim() || !datum) {
    setError("Naziv i datum su obavezni.");
    return;
  }

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `${baseUrl}/api/radionice/${editId}` : `${baseUrl}/api/radionice`;

  const formattedDate = new Date(datum).toISOString().split('T')[0];

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ naziv: naziv.trim(), datum: formattedDate })
  })
    .then(res => {
      if (!res.ok) throw new Error("Greška kod spremanja radionice");
      return res.json();
    })
    .then(() => {
      fetchRadionice();
      setNaziv('');
      setDatum('');
      setEditId(null);
      setError(null);
    })
    .catch(err => {
      console.error(err);
      setError("Neuspješno spremanje radionice.");
    });
};
