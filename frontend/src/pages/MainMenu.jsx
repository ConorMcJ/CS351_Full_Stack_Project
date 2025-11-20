import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { authAPI, leaderboardAPI } from '../api/client';

export default function MainMenu() {
    const nav = useNavigate();

    const [weekly, setWeekly] = useState([]);
    const [allTime, setAllTime] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileMsg, setProfileMsg] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError("");
            setProfileMsg("");

            try {
                const [weeklyRes, topRes, statsRes, profileRes] = await Promise.all([
                leaderboardAPI.getWeeklyScores(10),
                leaderboardAPI.getTopScores(10),
                leaderboardAPI.getUserStats(), 
                authAPI.getProfile(),                    
            ]);

            setWeekly(weeklyRes.entries ?? []);
            setAllTime(topRes.entries ?? []);
            setUserStats(statsRes ?? null);
            setProfile(profileRes ?? null);            
            } catch (err) {
                console.warn("Load error:", err);
                setError("Failed to load leaderboard or profile data.");
                setWeekly([]);
                setAllTime([]);
                setUserStats(null);
                setProfile(null);                
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    async function handleLogout() {
        try {
            await authAPI.logout();
        } catch (err) {
            console.warn("Logout failed:", err);
        } finally {
            nav("/login");
        }
    }

    async function handleProfileSave() {
        if (!profile) return;
        setSavingProfile(true);
        setProfileMsg("Saving...");

        try {
            const payload = {
                total_score: profile.total_score,
                games_played: profile.games_played,
                best_score: profile.best_score,
            };

            const updated = await authAPI.updateProfile(payload);
            setProfile(updated ?? { ...profile, ...payload });
            setProfileMsg("Saved!");
        } catch (err) {
            console.error("updateProfile:", err);
            setProfileMsg("Failed to save.");
        } finally {
            setSavingProfile(false);
        }
    }

    if (loading) return <div>Loading...</div>;

    function renderList(list) {
        if (!list || list.length === 0) return <li>No scores yet.</li>;

        return list.map((entry, idx) => {
            const rank = entry.rank ?? idx + 1;
            const username = entry.user_email ?? "Unknown";
            const score = entry.score ?? 0;

            return (
                <li key={`${username}-${rank}`}>
                    {rank}. {username} - {score}
                </li>
            );
        });
    }

    const allTimeRank = userStats?.all_time_rank ?? null;
    const allTimeBest = userStats?.all_time_best_score ?? null;
    const weeklyRank = userStats?.weekly_rank ?? null;
    const weeklyBest = userStats?.weekly_best_score ?? null;

    return (
        <main style = {{
            maxWidth: 900,
            margin: "40px auto",
            fontFamily: "system-ui, sans-serif",
            }}
        >
            {/* Header */}
            <header style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 24,
                gap: 16
                }}
            >
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: 4 }}>Main Menu</h1>
                    {profile && (
                        <p style= {{ margin: 0, fontSize: "0.95rem" }}>
                            Logged in as{" "}
                            <strong>
                                {profile.user?.email ?? "Player"}
                            </strong>
                        </p>
                    )}
                </div>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button onClick={handleLogout}>Log Out</button>
                </div>
            </header>

            {error && (
                <div style={{ color: "#d33", marginBottom: 16, fontSize: "0.95rem" }}>
                    {error}
                </div>
            )}

            <section style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                marginBottom: 24,
                }}
            >
                <div>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: 8 }}>
                        Top scores this week
                    </h2>
                    <ul>{renderList(weekly)}</ul>
                </div>

                <div>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: 8 }}>Top Scores</h2>
                    <ul>{renderList(allTime)}</ul>
                </div>
            </section>

            {userStats && (
                <section style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 8 }}>Your Stats</h3>
                    <p style={{ margin: 0 }}>
                        All-time rank: {" "}
                        {allTimeRank != null ? `#${allTimeRank}` : "unranked"}
                        {allTimeBest != null && <> • Best score: {allTimeBest}</>}
                    </p>
                    <p style={{ margin: 0 }}>
                        Weekly rank: {" "}
                        {weeklyRank != null ? `#${weeklyRank}` : "unranked"}
                        {weeklyBest != null && <> • Best score: {weeklyBest}</>}
                    </p>
                </section>
            )}

            {profile && (
                <section style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 8 }}>Profile</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        Update profile stats:
                    </p>
                    <button onClick={handleProfileSave} disabled={savingProfile}>
                        {savingProfile ? "Saving..." : "Manually Sync"}
                    </button>
                    {profileMsg && (
                        <div style={{ marginTop: 6, fontSize: "0.85rem" }}>
                            {profileMsg}
                        </div>
                    )}
                </section>
            )}

            <div style= {{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => nav("/play")}>New Game</button>
            </div>
        </main>
    );
}