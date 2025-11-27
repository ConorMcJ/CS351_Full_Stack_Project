import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authAPI } from '../api/client';

export default function Login() {
    const nav = useNavigate();


    

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
    
    


    // user  data
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

<div className="card bg-primary bg-base-100 w-125 h-100  shadow-xl rounded-small flex min-h justify-center items-center container mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div className="card-body">
            <h1></h1>
            <h1 className="card-title"style={{ fontSize: "2rem", marginBottom: 4 }}>StudentLife-Guessr</h1>
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
                <button class='btn rounded-full'
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
            </div>
            </div>
        </main>
    );
}