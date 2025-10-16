// 1. Base URL comes from .env -> set later to http://localhost:8000 for Django
const BASE = (import.meta.env.VITE_API_BASE_URL || '') + '/api/v1';

// 2. Helper to call JSON endpoints
async function request(path, { method = 'GET', body, headers = {}, credentials } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers},
        body: body ? JSON.stringify(body) : undefined,
        credentials: credentials || 'same-origin',
    });
    
    let data;
    try { data = await res.json(); } catch {/* ignore parse errors*/}
    if (!res.ok) {
        const err = new Error(data?.error?.message || `HTTP ${res.status}`);
        err.status = res.status;
        err.payload = data;
        throw err;
    }
    return data;
}

// 3. Export API calls
export function login(email, password) {
    return request(`/auth/login`, { method: 'POST', body: { email, password } });
}

export function logout() {
    return request('/auth/logout', { method: 'POST' });
}

export function getLeaderboard(range = 'week', limit = 10) {
    const q = new URLSearchParams({ range, limit: String(limit) }).toString();
    return request(`/leaderboard?${q}`);
}

export function getRound() {
    return request('/round');
}

export function postGuess(id, guess) {
    return request('/guess', { method: 'POST', body: { id, guess } });
}