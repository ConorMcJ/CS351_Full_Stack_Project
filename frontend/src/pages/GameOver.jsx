import {useLocation, useNavigate } from "react-router-dom";

export default function GameOver() {
    const { state } = useLocation();
    const nav = useNavigate();
    const finalScore = state?.finalScore ?? 0;
    const timeElapsed = state?.timeElapsed ?? 0;

    return (
        <main style={{ maxWidth: 720, margin: "80px auto", textAlign: "center" }}>
            <div style={{ marginBottom: 16 }}>⏱ Time Elapsed: {timeElapsed}s</div>
            <h1>Results</h1>
            <h2 style={{ margin: 0}}>{finalScore}</h2>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24}}>
                <button onClick={() => nav("/play")}>New Game</button>
                <button onClick={() => nav("/menu")}>Return</button>
            </div>
        </main>
    );
}