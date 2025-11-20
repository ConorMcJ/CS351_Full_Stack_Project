import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/client';

export default function MainMenu() {
    const nav = useNavigate();
    const [week, setWeek] = useState([]);
    const [all, setAll] = useState([]);

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
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const w = await getLeaderboard('week');
                if (alive) setWeek(w?.items ?? []);
            } catch {
                if (alive) setWeek([]);
            }

            try {
                const a = await getLeaderboard('all');
                if (alive) setAll(a?.items ?? []);
            } catch {
                if (alive) setAll([]);
            }
        })();

        return () => { alive = false; };
    }, []);

    return (
        <main style={{ maxWidth: 900, margin: "40px auto" }}>
            <h2>Main Menu</h2>

            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                    <h3>Top This Week</h3>
                    <ul>
                        {week.length === 0 ? (
                            <li>Loading...</li>
                        ) : (
                            week.map((r) => (
                                <li key={`w-${r.rank}`}>{r.rank}. {r.username} - {r.score}</li>
                            ))
                        )}
                    </ul>
                </div>
                <div>
                    <h3>Top Overall</h3>
                    <ul>
                        {all.length === 0 ? (
                            <li>Loading...</li>
                        ) : (
                            all.map((r) => (
                                <li key={`a-${r.rank}`}>{r.rank}. {r.username} - {r.score}</li>
                            ))
                        )}
                    </ul>
                </div>
            </section>

            <div style={{ display: "flex", gap: 12, marginTop: 24}}>
                <button onClick={() => nav("/play")}>New Game</button>
                <Link to="/login" style={{ marginLeft: "auto" }}>Log Out</Link>
            </div>
        </main>
    );
}