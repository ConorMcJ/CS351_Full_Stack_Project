// 1. Base URL comes from .env -> set later to http://localhost:8000 for Django
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api';

// 2. CSRF Helper
function getCookie(name) {
    const cookieStr = document.cookie || '';
    const cookies = cookieStr.split(';').map(c => c.trim());

    for (const c of cookies) {
        if (c.startsWith(name + '=')) return decodeURIComponent(c.slice(name.length + 1));
    }

    return null;
}

// 3. Helper to call JSON endpoints
async function apiCall(endpoint, method = 'GET', body = null ) {
    const isUnsafe = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
    const headers = { 'Content-Type': 'application/json' };

    if (isUnsafe) {
        const csrf = getCookie('csrftoken');
        if (csrf) headers['X-CSRFToken'] = csrf;
    }
    
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
    });
    
    let data;
    const text = await res.text()

    if (text) {
        try { data = JSON.parse(text); } catch {}
    }

    if (!res.ok) {
        const msg = (data && (data.error || data.detail)) || `API request failed (${res.status})`;
        const err = new Error(msg)
        err.status = res.status;
        err.payload = data;
        throw err;
    }

    return data;
}

/*
========================================
Auth endpoints
========================================
*/
export const authAPI = {
    register: (email, password) =>
        apiCall('/accounts/register/', 'POST', {
            email,
            password,
            password_confirm: password,
        }),
    
    login: (email, password) =>
        apiCall('/accounts/login/', 'POST', { email, password }),

    logout: () =>
        apiCall('/accounts/logout/', 'POST'),

    getProfile: () =>
        apiCall('/accounts/profile/', 'GET'),
    
    updateProfile: (data) =>
        apiCall('/accounts/profile/update/', 'PUT', data),
};
/*
========================================
Game endpoints
========================================
*/
export const gameAPI = {
    getEvents: () =>
        apiCall('/games/events/', 'GET'),
    
    startGame: () =>
        apiCall('/games/start/', 'POST'),
    
    submitGuess: (gameRoundId, uicEventId, answer, timeTaken) =>
        apiCall('/games/guess/', 'POST', {
            game_round_id: gameRoundId,
            uic_event_id: uicEventId,
            answer,
            time_taken: timeTaken,
        }),

    completeGame: (gameRoundId) =>
        apiCall('/games/complete/', 'POST', { game_round_id: gameRoundId }),
};

/*
========================================
Leaderboard endpoints
========================================
*/
export const leaderboardAPI = {
    getTopScores: (limit = 10) =>
        apiCall(`/leaderboards/top/?limit=${limit}`, 'GET'),

    getWeeklyScores: (limit = 10) =>
        apiCall(`/leaderboards/weekly/?limit=${limit}`, 'GET'),
    
    getUserStats: () =>
        apiCall('/leaderboards/me/', 'GET'),
};