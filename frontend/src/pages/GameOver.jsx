import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GameOver() {
    const { state } = useLocation();
    const nav = useNavigate();
    const finalScore = state?.finalScore ?? 0;
    const timeElapsed = state?.timeElapsed ?? 0;


    // this stuff is to fetch figma 
    const [buttonStyles, setButtonStyles] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDesignData = async () => {
            try {
                const response = await axios.get(`https://api.figma.com/v1/files/${import.meta.env.VITE_API_FIGMA_FILE_KEY}`, {
                    headers: { 'X-Figma-Token': import.meta.env.VITE_API_FIGMA_API_KEY }
                });
                

                const styles = {
                    newGameButton: { // first
                        backgroundColor: 0// have to fill
                    },
                    returnButton: {
                        backgroundColor: 0//have to fill
                    }
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

    return (
        <main style={{ maxWidth: 720, margin: "80px auto", textAlign: "center" }}>
            <div style={{ marginBottom: 16 }}>⏱ Time Elapsed: {timeElapsed}s</div>
            <h1>Results</h1>
            <h2 style={{ margin: 0 }}>{finalScore}</h2>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
                    <button 
                        style={{ ...buttonStyles.newGameButton, padding: '10px 20px', border: 'none', borderRadius: '5px', color: '#000' }}
                        onClick={() => nav("/play")}
                    >
                        New Game
                    </button>
                    <button 
                        style={{ ...buttonStyles.returnButton, padding: '10px 20px', border: 'none', borderRadius: '5px', color: '#000' }}
                        onClick={() => nav("/menu")}
                    >
                        Return
                    </button>
                </div>
           
        </main>
    );
}

