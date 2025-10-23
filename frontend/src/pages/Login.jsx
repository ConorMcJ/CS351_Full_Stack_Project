import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from '../api/client';

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setPending(true);
        try {
            const res = await login(email, pw);
            console.log('login ok', res);
            nav('/menu');
        } catch (err) {
            setError(err?.payload?.error?.message || err.message || "Login failed");
        } finally {
            setPending(false);
        }
    }

    return (
        <main style={{ maxWidth: 420, margin: "60px auto" }}>
        <h1>Student-Life Guessr</h1>
        <p>By Conor • Sammy • Arsalan • Eric</p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 24 }}>
            <input
            type = "email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <input
            placeholder="Password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
        />
        {error && <div style={{ color: "#f55" }}>{error}</div>}
        <button disabled={!email || !pw || pending}>
            {pending ? "Signing in..." : "Sign in"}
        </button>
        <button type="button" onClick={() => alert("Forgot password flow later")}>
            Forgot Password
                </button>
            </form>
        </main>
    );
}
