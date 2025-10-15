import { useNavigate } from "react-router-dom";
import {useState, useEffect } from "react";

export default function GameScreen() {
    const nav = useNavigate();
    const [guess, setGuess] = useState("");
    const [remaining, setRemaining] = useState(3);
    const [score, setScore] = useState(0);

    // placeholder timer
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    function submitGuess(e) {
        e.preventDefault();
        // placeholder -> 2 wrong guesses leads to "final"
        if (remaining > 1) setRemaining((r) => r - 1);
        else nav("/over", { state: { finalScore: score } });
        setGuess("");
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
                    />
                    <button>Submit</button>
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