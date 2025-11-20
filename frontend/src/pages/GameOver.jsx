import {useLocation, useNavigate } from "react-router-dom";

export default function GameOver() {
    const { state } = useLocation();
    const nav = useNavigate();

    const finalScore = state?.finalScore ?? 0;
    const timeElapsed = state?.timeElapsed ?? 0;
    const accuracy = state?.accuracy ?? null;
    const reason = state?.reason ?? null;

    let reasonText = "";
    if (reason === "time_up") {
        reasonText = "Time's up!";
    } else if (reason === "no_lives") {
        reasonText = "You ran out of lives.";
    } else if (reason === "completed_all") {
        reasonText = "You completed all events!";
    }

    const accuracyText = typeof accuracy === "number" ? `${(accuracy).toFixed(1)}%` : null;

    return (
        <main style={{ maxWidth: 720, margin: "80px auto", textAlign: "center", fontFamily: "system-ui, sans-serif", }}>
            <div style={{ marginBottom: 8 }}>⏱ Time Elapsed: {timeElapsed}s</div>

            {reasonText && (
                <div style={{ marginBottom: 16, fontSize: "1rem" }}>
                    {reasonText}
                </div>
            )}

            <h1>Results</h1>
            <h2 style={{ margin: 0 }}>Score: {finalScore}</h2>

            {accuracyText && (
                <p style={{ marginTop: 8 }}>Accuracy: {accuracyText}</p>
            )}

            <div
                style ={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    marginTop: 24,
                }}
            >
                <button onClick={() => nav("/play")}>New Game</button>
                <button onClick={() => nav("/menu")}>Return</button>
            </div>
        </main>
    );
}