import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { authAPI, leaderboardAPI } from '../api/client';

export default function MainMenu() {
    // code to manage theme switcher
    const [isdark, setIsdark] = useState(
        JSON.parse(localStorage.getItem('isdark'))
    );
    useEffect(() => {

        // Local storage so it can persist on refresh :)
        localStorage.setItem('isdark', JSON.stringify(isdark));
        setIsdark(isdark);

        if (isdark) { // set it in the document
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, [isdark]);


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
            {/* Theme switcher*/}
            <label className="swap swap-rotate absolute top-0 left-0 m-4">
            <input type="checkbox" className="theme-controller" value="synthwave" checked={!isdark} onChange={() => {setIsdark(!isdark);}} />

            <svg
                className="swap-off h-10 w-10 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg
                className="swap-on h-10 w-10 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
            </label>
            <div className="card bg-primary bg-base-100 w-125 h-130  shadow-xl rounded-small flex min-h justify-center items-center container mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="card-body">
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
            </div>
            </div>
        </main>
    );
}