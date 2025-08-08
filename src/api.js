// src/api.js
const baseUrl = "https://eduplusbackend.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (res.status === 401) {
    // token istekao / nevažeći -> odjavi korisnika
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // tvrdi reload da se pokaže Login
    window.location.reload();
    return Promise.reject(new Error("Unauthorized"));
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  // neki endpointi vraćaju 204
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

export const api = {
  baseUrl,
  get: (path) =>
    fetch(`${baseUrl}${path}`, {
      headers: { ...authHeaders() },
    }).then(handle),

  post: (path, body) =>
    fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handle),

  put: (path, body) =>
    fetch(`${baseUrl}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handle),

  del: (path) =>
    fetch(`${baseUrl}${path}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    }).then(handle),
};
