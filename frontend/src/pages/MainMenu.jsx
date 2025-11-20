import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { leaderboardAPI } from '../api/client';
import axios from "axios";

export default function MainMenu() {
    const nav = useNavigate();
    const [week, setWeek] = useState([]);
    const [weekSize, setWeekSize] = useState(-1);
    const [all, setAll] = useState([]);
    const [allSize, setAllSize] = useState([]);

    // figma stuff
    useEffect(() => {
        const fetchDesignData = async () => {
            try {
                const response = await axios.get(`https://api.figma.com/v1/files/${import.meta.env.VITE_API_FIGMA_FILE_KEY}`, {
                    headers: { 'X-Figma-Token':import.meta.env.VITE_API_FIGMA_API_KEY }
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
                const w = await leaderboardAPI.getWeeklyScores();
                console.log("got here");
                console.log(w);
                if (alive) setWeek(w?.entries ?? []);
                setWeekSize(w?.entries?.length); // set size
            } catch {
                if (alive) setWeek([]);
            }

            try {
                const a = await leaderboardAPI.getTopScores();
                if (alive) setWeek(a?.entries ?? []);
                setWeekSize(a?.entries?.length); // set size
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
                        {week.length === -1 ? (
                            <li>Loading...</li>
                        ) : 
                        // another case if there are 0 entries
                        week.length === 0 ? (
                            <li>No games yet!</li>
                        ) :
                        (
                            week.map((r) => (
                                <li key={`w-${r.rank}`}>{r.rank}. {r.username} - {r.score}</li>
                            ))
                        )}
                    </ul>
                </div>
                <div>
                    <h3>Top Overall</h3>
                    <ul>
                        {all.length === -1 ? (
                            <li>Loading...</li>
                        ) : 
                        // another case if there are 0 entries
                        all.length === 0 ? (
                            <li>No games yet!</li>
                        ) 
                        : (
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