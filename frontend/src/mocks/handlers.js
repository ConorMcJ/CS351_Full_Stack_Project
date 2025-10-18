import { http, HttpResponse } from 'msw';

let round = {
    id: 'r_001',
    imageUrl: '/images/event1.jpg',
    hint: 'Annual culture festival hosted at the Quad.',
    guessesAllowed: 3,
};
let remaining = round.guessesAllowed;

export const handlers = [
    // Auth
    http.post('/api/v1/auth/login', async ({ request }) => {
        const { email, password } = await request.json();

        const ok = email === 'test@uic.edu' && password === 'pass1234';

        if (!ok) {
            return HttpResponse.json(
                { error: { message: 'Invalid email or password' } },
                { status: 401 }
            );
        }

        return HttpResponse.json({ ok: true, user: { id: 'u_123', username: 'demo' } });
    }),
    
    http.post('/api/v1/auth/logout', async () => {
        return HttpResponse.json({ ok: true});
    }),

    // Leaderboard
    http.get('/api/v1/leaderboard', async ({ request }) => {
        const url = new URL(request.url);
        const range = url.searchParams.get('range') || 'week';
        const items =
            range === 'week'
                ? [
                    { rank: 1, username: 'alice', score: 120 },
                    { rank: 2, username: 'bob', score: 95 },
                ]
                :[
                    { rank: 1, username: 'zoe', score: 900 },
                    { rank: 2, username: 'mike', score: 850 },
                ];
        return HttpResponse.json({ ok: true, items });
    }),

    // Round
    http.get('/api/v1/round', async () => {
        remaining = round.guessesAllowed;
        return HttpResponse.json({ ok: true, ...round });
    }),

    // Guess
    http.post('/api/v1/guess', async ({ request }) => {
        const {id, guess } = await request.json();
        const correct = id === round.id && (guess || '').toLowerCase().includes('festival');
        remaining = Math.max(0, remaining - 1);

        if (correct) {
            return HttpResponse.json({
                ok: true,
                correct: true,
                remaining,
                scoreDelta: 100,
                final: true,
                finalScore: 320,
            });
        }

        if (remaining === 0) {
            return HttpResponse.json({
                ok: true,
                correct: false,
                remaining,
                scoreDelta: 0,
                final: true,
                finalScore: 200,
            });
        }

        return HttpResponse.json({
            ok: true,
            correct: false,
            remaining,
            scoreDelta: 0,
        });
    }),
];