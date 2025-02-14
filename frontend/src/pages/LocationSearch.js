import React, { useState, useEffect } from "react";
import "./../styles/LocationSearch.css";
import { Link } from "react-router-dom";

function App() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [page, setPage] = useState(1); 
    const [totalPages, setTotalPages] = useState(1); 

    const fetchNearbyRestaurants = async () => {
        if (!latitude || !longitude) return alert("Please enter latitude and longitude!");

        setLoading(true);
        try {
            const response = await fetch(`https://zomato-web-ap.onrender.com/restaurants/nearby?lat=${latitude}&lng=${longitude}&page=${page}&limit=10`,
                {
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    }
                }
            );
            const data = await response.json();
            setRestaurants(data.nearbyRestaurants);
            setTotalPages(data.totalPages); 
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (latitude && longitude) fetchNearbyRestaurants();
    }, [page,latitude,longitude]); 

    return (
        <div className="location-search">
            <h2 className="search-title">Find Nearby Restaurants 🍽️</h2>
            <div className="search-form">
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Enter Latitude"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter Longitude"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                    />
                </div>
                <button className="search-button" onClick={fetchNearbyRestaurants}>Find Restaurants</button>
            </div>
            {loading && <p className="loading-text">Loading...</p>}
            <div className="results-container">
                {restaurants.length > 0 ? (
                    restaurants.map((restaurant, index) => (
                        <Link key={restaurant.Restaurant_ID} to={`/restaurant/${restaurant.Restaurant_ID}`}>
                            <div key={index} className="result-card">
                                <h3 className="result-name">{restaurant.Restaurant_Name}</h3>
                                <p className="result-address">📍 {restaurant.Latitude}, {restaurant.Longitude}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    !loading && <p className="no-results">No restaurants found.</p>
                )}
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            className={`pagination-button ${page === index + 1 ? "active" : ""}`}
                            onClick={() => setPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
