import React, { useState } from "react";
import "./../styles/ImageSearch.css";

const ImageSearch = () => {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState([]);
    const [foodItem, setFoodItem] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const uploadImage = async () => {
        if (!file) return alert("Please select an image.");
        
        setIsLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("https://zomato-web-app.onrender.com/restaurants/search/image", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            setFoodItem(data.food);
            setResults(data.restaurants);
        } catch (err) {
            console.error("Error details:", err);
            setError(err.message || "Failed to upload image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="image-search">
            <h1 className="search-title">Search Restaurants by Food Image</h1>
            
            <div className="upload-section">
                <div className="file-input-container">
                    <label className="file-input-label">
                        <input 
                            type="file" 
                            className="file-input"
                            onChange={(e) => {
                                const selectedFile = e.target.files[0];
                                if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
                                    alert("File size should be less than 5MB");
                                    return;
                                }
                                setFile(selectedFile);
                                setError(null);
                            }}
                            accept="image/*"
                        />
                        {file ? file.name : "Choose an image"}
                    </label>
                </div>
                <button 
                    className="search-button" 
                    onClick={uploadImage}
                    disabled={!file || isLoading}
                >
                    {isLoading ? "Searching..." : "Search Restaurants"}
                </button>
            </div>

            {error && (
                <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
                    {error}
                </div>
            )}

            {foodItem && (
                <h2 className="detected-food">Detected Food: {foodItem}</h2>
            )}

            {results.length > 0 ? (
                <ul className="results-list">
                    {results.map(r => (
                        <li key={r.Restaurant_ID} className="result-item">
                            <h3 className="restaurant-name">{r.Restaurant_Name}</h3>
                            <p className="restaurant-address">{r.Address}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-results">No restaurants found for this cuisine.</p>
            )}
        </div>
    );
};

export default ImageSearch;
