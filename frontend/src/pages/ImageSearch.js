import React, { useState } from "react";
import "./../styles/ImageSearch.css";
import { Link } from "react-router-dom";

const ImageSearch = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [results, setResults] = useState([]);
    const [foodItem, setFoodItem] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const uploadImage = async () => {
        if (!file) {
            setError("Please select an image.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(`http://localhost:5000/restaurants/search/image?page=${currentPage}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const data = await response.json();
            setFoodItem(data.cuisine);
            setResults(data.restaurants);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError("Error searching restaurants. Please try again.");
            console.error("Error searching:", err);
        } finally {
            setLoading(false);
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
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {file ? file.name : "Choose an image"}
                    </label>

                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="Preview" />
                        </div>
                    )}
                </div>

                <button 
                    className="search-button" 
                    onClick={uploadImage}
                    disabled={!file || loading}
                >
                    {loading ? "Processing..." : "Search Restaurants"}
                </button>

                {error && (
                    <div className="error-message">{error}</div>
                )}
            </div>

            {foodItem && (
                <h2 className="detected-food">Detected Cuisine: {foodItem}</h2>
            )}

            {results.length > 0 ? (
                <div className="results-container">
                    <ul className="results-list">
                        {results.map(r => (
                            <Link key={r.Restaurant_ID}
                            to={`/restaurant/${r.Restaurant_ID}`}>
                            <li key={r.Restaurant_ID} className="result-item">
                                <h3 className="restaurant-name">{r.Restaurant_Name}</h3>
                                <p className="restaurant-address">{r.Address}</p>
                                <p className="restaurant-cuisine">Cuisine: {r.cuisine}</p>
                            </li>
                            </Link>
                        ))}
                    </ul>
                    
                    <div className="pagination">
                        <button 
                            className="pagination-button"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                        >
                            Previous
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            className="pagination-button"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || loading}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                foodItem && <p className="no-results">No restaurants found for this cuisine.</p>
            )}
        </div>
    );
};

export default ImageSearch;