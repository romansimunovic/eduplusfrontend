// src/api.js

// BAZNI URL iz .env (REACT_APP_API_BASE), npr.
// REACT_APP_API_BASE=https://eduplusbackend.onrender.com
// Fallback: http://localhost:8080
const ENV_BASE = process.env.REACT_APP_API_BASE;
const DEFAULT_BASE = "http://localhost:8080";
const baseUrl = (ENV_BASE && ENV_BASE.trim()) || DEFAULT_BASE;

/** Spoji base + path bez duplih kosih crta, dozvoli i apsolutne URL-ove */
function joinUrl(base, path) {
  if (!path) return base;
  // apsolutni URL (http/https)
  if (/^https?:\/\//i.test(path)) return path;
  const a = base.replace(/\/+$/, "");
  const b = path.replace(/^\/+/, "");
  return `${a}/${b}`;
}

/** Sigurno dohvati JSON (i kad server ne postavi content-type, ili vrati prazno tijelo) */
async function safeJson(res) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // nije JSON -> vrati raw tekst (može dobro doći za poruke greške)
    return text;
  }
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Jedinstveni handler za sve odgovore */
async function handle(res) {
  // 401 -> odjava i redirect na /login
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // hard redirect kako bi RequireAuth i guardovi sigurno presjekli
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  // 403 -> nema ovlasti (često kod /api/dev/seed u prod profilu)
  if (res.status === 403) {
    const body = await safeJson(res);
    const msg =
      typeof body === "string" && body
        ? body
        : "Zabranjeno (403) – nemate ovlasti za ovu radnju.";
    throw new Error(msg);
  }

  if (!res.ok) {
    const body = await safeJson(res);
    const fallback = `HTTP ${res.status}`;
    if (typeof body === "string" && body.trim()) throw new Error(body.trim());
    if (body && typeof body === "object" && (body.message || body.error)) {
      throw new Error(body.message || body.error || fallback);
    }
    throw new Error(fallback);
  }

  // 204 No Content
  if (res.status === 204) return null;

  // Pokušaj JSON bez obzira na header (neki servisi ga ne šalju)
  return safeJson(res);
}

/** Niska razina: generičan fetch wrapper */
function request(method, path, body, extraHeaders) {
  const url = joinUrl(baseUrl, path);
  const headers = {
    ...(body != null ? { "Content-Type": "application/json" } : {}),
    ...authHeaders(),
    ...(extraHeaders || {}),
  };

  return fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  }).then(handle);
}

/** Javni API helperi */
export const api = {
  baseUrl,

  get: (path, headers) => request("GET", path, undefined, headers),

  post: (path, body, headers) => request("POST", path, body, headers),

  put: (path, body, headers) => request("PUT", path, body, headers),

  del: (path, headers) => request("DELETE", path, undefined, headers),

  // korisno: “ping” koji neće puknuti ako nije JSON
  ping: () =>
    fetch(joinUrl(baseUrl, "/api/ping"), { headers: { ...authHeaders() } })
      .then((r) => (r.ok ? true : false))
      .catch(() => false),
};

export default api;