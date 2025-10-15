import { useNavigate, Link } from "react-router-dom";

export default function MainMenu() {
    const nav = useNavigate();


    return (
        <main style={{ maxWidth: 900, margin: "40px auto" }}>
            <h2>Main Menu</h2>

            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                    <h3>Top This Week</h3>
                    <ul>
                        <li>1. alice - 120</li>
                        <li>2. bob - 95</li>
                    </ul>
                </div>
                <div>
                    <h3>Top Overall</h3>
                    <ul>
                        <li>1. zoe - 900</li>
                        <li>2. mike - 850</li>
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