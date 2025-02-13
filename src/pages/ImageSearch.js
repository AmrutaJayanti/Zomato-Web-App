import React, { useState } from "react";
import "./../styles/ImageSearch.css";

const ImageSearch = () => {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState([]);
    const [foodItem, setFoodItem] = useState("");

    const uploadImage = async () => {
        if (!file) return alert("Please select an image.");

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("http://localhost:5000/restaurants/search/image", {
                method: "POST",
                body: formData, 
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const data = await response.json();
            setFoodItem(data.food);
            setResults(data.restaurants);
        } catch (err) {
            console.error("Error searching:", err);
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
                            onChange={(e) => setFile(e.target.files[0])} 
                            accept="image/*"
                        />
                        {file ? file.name : "Choose an image"}
                    </label>
                </div>
                <button 
                    className="search-button" 
                    onClick={uploadImage}
                    disabled={!file}
                >
                    Search Restaurants
                </button>
            </div>

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