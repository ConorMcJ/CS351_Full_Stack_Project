import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authAPI } from '../api/client';

export default function Login() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(null);

    function getErrorMessage(err) {
        if (err?.payload?.error) return err.payload.error;
        if (err?.payload?.detail) return err.payload.detail;

        return err.message || "Something went wrong";
    }

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading("login");

        try {
            await authAPI.login(email, pw);
            nav("/menu");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setError("");
        setLoading("register");

        try {
            await authAPI.register(email, pw);
            await authAPI.login(email, pw) // auto login after register
            nav("/menu");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    }

    const disabled = !email || !pw || !!loading;

    return (
        <main
            style={{
                maxWidth: 420,
                margin: "60px auto",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "2rem", marginBottom: 4 }}>StudentLife-Guessr</h1>
            <p style={{ marginBottom: 24 }}>
                Game designed by Arsalan, Conor, Eric, and Sammy
            </p>

            <h2 style={{ fontSize: "1.25rem", marginBottom: 16}}>Login to Play!</h2>

            <form
                onSubmit={handleLogin}
                style={{ display: "grid", gap: 12, marginTop: 8 }}
            >
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: "8px 10px" }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    style={{ padding: "8px 10px" }}
                />

                {error && (
                    <div style={{ color: "#d33", fontSize: "0.9rem" }}>{error}</div>
                )}

                {/*Login button */}
                <button
                    type="submit"
                    disabled={disabled}
                    style={{
                        padding: "10px 12px",
                        marginTop: 4,
                        cursor: disabled ? "default" : "pointer",
                    }}
                >
                    {loading === "login" ? "Signing in..." : "Sign In"}
                </button>

                {/*Register button*/}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleRegister}
                    style={{
                        padding: "10px 12px",
                        cursor: disabled ? "default" : "pointer",
                    }}
                >
                    {loading === "register" ? "Registering..." : "Register"}
                </button>
            </form>
        </main>
    );
}