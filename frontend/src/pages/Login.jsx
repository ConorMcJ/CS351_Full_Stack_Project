import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");

    function onSubmit(e) {
        e.preventDefault();
        // for now, just go to the main menu
        nav("/menu");
    }

    return (
        <main style={{ maxWidth: 420, margin: "60px auto" }}>
        <h1>Student-Life Guessr</h1>
        <p>By Conor • Sammy • Arsalan • Eric</p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 24 }}>
            <input
            placeholder="Email / Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        <input
            placeholder="Password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
        />
        <button type="submit">Log In</button>
        <button type="button" onClick={() => alert("Forgot password flow later")}>
            Forgot Password
                </button>
            </form>
        </main>
    );
}
