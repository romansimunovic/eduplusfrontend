// API konfiguracija: koristi .env ako postoji, inače default
const ENV_BASE = process.env.REACT_APP_API_BASE;
const DEFAULT_BASE = "http://localhost:8080";
const baseUrl = (ENV_BASE && ENV_BASE.trim()) || DEFAULT_BASE;

// Lokalne fallback datoteke (kad backend nije dostupan)
const staticData = {
  polaznici: "/polaznici.json",
  radionice: "/radionice.json",
  prisustva: "/prisustva.json",
};

/** Spoji base + path bez duplih kosih crta, dozvoli i apsolutne URL-ove */
function joinUrl(base, path) {
  if (!path) return base;
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
    return text;
  }
}

/** Jedinstveni handler za sve odgovore */
async function handle(res, path) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (res.status === 403) {
    const body = await safeJson(res);
    const msg =
      typeof body === "string" && body
        ? body
        : "Zabranjeno (403) – nemate ovlasti za ovu radnju.";
    throw new Error(msg);
  }

  // Ako backend ne radi -> koristi lokalne JSON datoteke
  if (!res.ok && res.status >= 500) {
    console.warn(`Backend nedostupan, koristi lokalni JSON za: ${path}`);
    if (path.includes("polaznici")) return fetch(staticData.polaznici).then(r => r.json());
    if (path.includes("radionice")) return fetch(staticData.radionice).then(r => r.json());
    if (path.includes("prisustva")) return fetch(staticData.prisustva).then(r => r.json());
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

  if (res.status === 204) return null;
  return safeJson(res);
}

/** Generičan fetch wrapper */
function request(method, path, body, extraHeaders) {
  const url = joinUrl(baseUrl, path);
  const headers = {
    ...(body != null ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders || {}),
  };

  return fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })
    .then((res) => handle(res, path))
    .catch(async (err) => {
      console.warn("Greška konekcije:", err.message);
      // Ako backend ne radi, koristi lokalne datoteke
      if (path.includes("polaznici"))
        return fetch(staticData.polaznici).then((r) => r.json());
      if (path.includes("radionice"))
        return fetch(staticData.radionice).then((r) => r.json());
      if (path.includes("prisustva"))
        return fetch(staticData.prisustva).then((r) => r.json());
      throw err;
    });
}

/** Javni API helperi */
export const api = {
  baseUrl,

  get: (path, headers) => request("GET", path, undefined, headers),
  post: (path, body, headers) => request("POST", path, body, headers),
  put: (path, body, headers) => request("PUT", path, body, headers),
  del: (path, headers) => request("DELETE", path, undefined, headers),

  getPolaznici: () => request("GET", "/api/polaznici"),
  getRadionice: () => request("GET", "/api/radionice"),
  getPrisustva: () => request("GET", "/api/prisustva"),

  ping: () =>
    fetch(joinUrl(baseUrl, "/api/ping"))
      .then((r) => r.ok)
      .catch(() => false),
};

export default api;
