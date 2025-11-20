// src/FigmaComponent.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FigmaComponent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://api.figma.com/v1/files/${import.meta.env.VITE_API_FIGMA_FILE_KEY}`, {
                    headers: { 'X-Figma-Token': import.meta.env.VITE_API_FIGMA_API_KEY }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching Figma data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <div>No Design Data Available</div>
            )}
        </div>
    );
};

export default FigmaComponent;
