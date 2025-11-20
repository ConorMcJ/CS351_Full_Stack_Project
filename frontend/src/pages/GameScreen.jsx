import { useNavigate } from "react-router-dom";
import {useState, useEffect } from "react";
import { getRound, postGuess } from '../api/client';

export default function GameScreen() {
    const nav = useNavigate();
    const [guess, setGuess] = useState("");
    const [remaining, setRemaining] = useState(3);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(null);
    const [seconds, setSeconds] = useState(0);

    // figma stuff
    useEffect(() => {
        const fetchDesignData = async () => {
            try {
                const response = await axios.get(`https://api.figma.com/v1/files/${process.env.REACT_APP_FIGMA_FILE_KEY}`, {
                    headers: { 'X-Figma-Token': process.env.REACT_APP_FIGMA_API_KEY }
                });
                

                const styles = { // have to fill
                };
                setButtonStyles(styles);
            } catch (error) {
                console.error("Error fetching Figma data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDesignData();
    }, []);
    // Fetch new round data
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await getRound();
                if (!alive) return;
                setRound(r || null);
                setRemaining(r?.guessesAllowed ?? 3);
            } catch {
                if (!alive) return;
                setRound(null);
                setRemaining(0);
            }
        })();
        return () => {alive = false; };
    }, []);

    // Start timer
    useEffect(() => {
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // Reset timer
    useEffect(() => {
        if (round?.id) setSeconds(0);
    }, [round?.id]);

    async function submitGuess(e) {
        e.preventDefault();
        if (!round || !guess.trim()) return;
        try {
            const res = await postGuess(round.id, guess.trim());
            setRemaining(res.remaining);
            if(res.scoreDelta) setScore(s => s + res.scoreDelta);
            if(res.final) nav('/over', { state: { finalScore: res.finalScore ?? 0, timeElapsed: seconds} });
        } catch (err) {
            console.error(err);
        } finally {
            setGuess('');
        }
    }

    return (
        <main style={{ maxWidth: 1100, margin: "24px auto", display: "grid", gridTemplateColumns: "320px 1fr 360px", gap: 24}}>
            {/*Left column: timer + score + quit */}
            <aside>
                <div>⏱ Time: {seconds}s</div>
                <div style= {{marginTop: 12 }}>Score: {score}</div>
                <button style={{ marginTop: 12 }} onClick={() => nav("/menu")}>Return to Menu</button>
            </aside>

            {/*Center: image + input*/}
            <section>
                <div style={{ width: "100%", height: 240, background: "#eee", display: "grid", placeItems: "center" }}>
                    <span>[ Event Image ]</span>
                </div>

                <div style={{ marginTop: 16 }}>Guesses remaining: {remaining}</div>
                <form onSubmit={submitGuess} style={{ display: "flex", gap: 8, marginTop: 8}}>
                    <input
                    placeholder="Type your guess"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    style={{ flex: 1}}
                    disabled={remaining === 0}
                    />
                    <button disabled={!round || !guess.trim() || remaining === 0}>Submit</button>
                </form>
            </section>

            {/*Right column: hint */}
            <aside>
                <h3>Hint</h3>
                <p>Brief sentence(s) describing the cultural event featured.</p>
            </aside>
        </main>
    );
}