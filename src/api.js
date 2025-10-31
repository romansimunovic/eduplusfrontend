export const api = {
  get: (path) => {
    if (path.includes('polaznici')) return fetch('/polaznici.json').then(r => r.json());
    if (path.includes('radionice')) return fetch('/radionice.json').then(r => r.json());
    if (path.includes('prisustva')) return fetch('/prisustva.json').then(r => r.json());
    return Promise.resolve([]);
  },
  post: () => Promise.resolve({}),
  put: () => Promise.resolve({}),
  del: () => Promise.resolve({}),
};

export default api;
