import {useLocation, useNavigate } from "react-router-dom";

export default function GameOver() {
    const { state } = useLocation();
    const nav = useNavigate();

    const finalScore = state?.finalScore ?? 0;
    const timeElapsed = state?.timeElapsed ?? 0;
    const accuracy = state?.accuracy ?? null;
    const reason = state?.reason ?? null;

    let reasonText = "";
    if (reason === "time_up") {
        reasonText = "Time's up!";
    } else if (reason === "no_lives") {
        reasonText = "You ran out of lives.";
    } else if (reason === "completed_all") {
        reasonText = "You completed all events!";
    }

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


    const accuracyText = typeof accuracy === "number" ? `${(accuracy).toFixed(1)}%` : null;

    return (
        <main style={{ maxWidth: 720, margin: "80px auto", textAlign: "center", fontFamily: "system-ui, sans-serif", }}> 
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
            <div style={{ marginBottom: 8 }}>⏱ Time Elapsed: {timeElapsed}s</div>

            {reasonText && (
                <div style={{ marginBottom: 16, fontSize: "1rem" }}>
                    {reasonText}
                </div>
            )}

            <h1>Results</h1>
            <h2 style={{ margin: 0 }}>Score: {finalScore}</h2>

            {accuracyText && (
                <p style={{ marginTop: 8 }}>Accuracy: {accuracyText}</p>
            )}

            <div
                style ={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    marginTop: 24,
                }}
            >
                <button onClick={() => nav("/play")}>New Game</button>
                <button onClick={() => nav("/menu")}>Return</button>
            </div>
        </main>
    );
}