import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { gameAPI } from '../api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function GameScreen() {
    const nav = useNavigate();

    const [guess, setGuess] = useState("");
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);

    const [roundId, setRoundId] = useState(null);
    const [events, setEvents] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const[secondsLeft, setSecondsLeft] = useState(60);
    const [totalSeconds, setTotalSeconds] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [gameEnded, setGameEnded] = useState(false);

    // Fetch new round data
    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setError("");
            setFeedback("");
            setLives(3);
            setScore(0);
            setTotalSeconds(0);
            setSecondsLeft(60);
            setCurrentIndex(0);

            try {
                const res = await gameAPI.startGame();
                if (!alive) return;

                const id = res.game_round_id ?? res.id ?? null;
                const qs = res.questions ?? [];

                setRoundId(id);
                setEvents(qs);
            } catch (err) {
                if (!alive) return;
                console.error("Failed to start game:", err);
                setError("Failed to start game.");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    // Game timer
    useEffect(() => {
        if (!roundId || gameEnded) return;

        const t = setInterval(() => {
            setTotalSeconds((s) => s + 1);
        }, 1000);

        return () => clearInterval(t);
    }, [roundId, gameEnded]);

    // 60 seconds per question
    useEffect(() => {
        if (!roundId || gameEnded || events.length === 0) return;

        setSecondsLeft(60);
        setFeedback("");

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    endGame("time_up");
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [roundId, currentIndex, gameEnded, events.length]);

    async function endGame(reason) {
        if (gameEnded || !roundId) return;
        setGameEnded(true);

        try {
            const res = await gameAPI.completeGame(roundId);
            const finalScore = res.final_score ?? score;
            const accuracy = res.accuracy ?? null;

            nav("/over", {
                state: {
                    finalScore,
                    timeElapsed: totalSeconds,
                    accuracy,
                    reason,
                },
            });
        } catch (err) {
            console.warn("completeGame failed:", err);
            nav("/over", {
                state: {
                    finalScore: score,
                    timeElapsed: totalSeconds,
                },
            });
        }
    }

    async function submitGuess(e) {
        e.preventDefault();
        if (!roundId || events.length === 0 || !guess.trim() || gameEnded) return;

        const currentEvent = events[currentIndex];
        if (!currentEvent) return;

        try {
            const timeTaken = 60 - secondsLeft;

            const res = await gameAPI.submitGuess(
                roundId,
                currentEvent.id ?? currentEvent.uic_event_id,
                guess.trim(),
                timeTaken
            );

            const isCorrect = !!res.is_correct;
            const newScore = res.current_score != null ? res.current_score : score;

            setScore(newScore);
            setFeedback(isCorrect ? "Correct!" : "Incorrect!");

            // Update lives if incorrect
            let newLives = lives;
            if (!isCorrect) {
                newLives = lives - 1;
                setLives(newLives);
            }

            const nextIndex = currentIndex + 1;
            const noMoreEvents = nextIndex >= events.length;

            if (newLives <= 0) {
                await endGame("no_lives");
            } else if (noMoreEvents) {
                await endGame("completed_all")
            } else {
                setCurrentIndex(nextIndex);
            }
        } catch (err) {
            console.error("submitGuess failed:", err);
        } finally {
            setGuess("");
        }
    }

    const currentEvent = events.length > 0 ? events[currentIndex] : null;

    const hintText = currentEvent?.hint || currentEvent?.description || "Brief sentence(s) describing event.";

    const imageUrl = currentEvent?.image_base64 || null;

    return (
        <main style={{
            maxWidth: 1100,
            margin: "24px auto",
            display: "grid",
            gridTemplateColumns: "320px 1fr 360px",
            gap: 24,
            fontFamily: "system-ui, sans-serif",
            }}
        >
            <aside>
                <div>⏱ Time left: {secondsLeft}s</div>
                <div style={{ marginTop: 8 }}>
                    Total Time: {totalSeconds}s
                </div>
                <div style={{ marginTop: 8 }}>Score: {score}</div>
                <div style={{ marginTop: 8 }}>Lives: {lives}</div>
                <div style={{ marginTop: 8 }}>
                    Question:{" "}
                    {events.length > 0 ? `${currentIndex + 1} / ${events.length}` : "0 / 0"}
                </div>
                <button style={{ marginTop: 12 }}
                    onClick={() => nav("/menu")}
                >
                    Return to Menu
                </button>
            </aside>

            <section>
                <div style={{ 
                    width: "100%",
                    height: 240,
                    background: "#eee",
                    display: "grid",
                    placeItems: "center",
                    }}
                >
                    {loading ? (
                        <span>Loading event...</span>
                    ) : imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={currentEvent.name ?? "Event"}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <span>[ No image available ]</span>
                    )}
                </div>

                <div style={{ marginTop: 16 }}>
                    Lives remaining: {lives}
                </div>

                {feedback && (
                    <div style={{ marginTop: 8 }}>
                        {feedback === "Correct!" ? "✅ Correct!" : "❌ Incorrect"}
                    </div>
                )}

                {error && (
                    <div style={{ color: "#d33", marginTop: 8 }}>{error}</div>
                )}

                <form
                    onSubmit={submitGuess}
                    style={{ display: "flex", gap: 8, marginTop: 8 }}
                >
                    <input
                        placeholder="Type your guess"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        style={{ flex: 1 }}
                        disabled={
                            !roundId ||
                            loading ||
                            gameEnded ||
                            lives <= 0 ||
                            secondsLeft <= 0
                        }
                    />
                    <button 
                        disabled={
                            !roundId ||
                            !guess.trim() ||
                            loading ||
                            gameEnded ||
                            lives <= 0 ||
                            secondsLeft <= 0
                        }
                    >
                        Submit
                    </button>
                </form>
            </section>

            <aside>
                <h3>Hint</h3>
                <p>{hintText}</p>
            </aside>
        </main>
    );
}