import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./../styles/RestaurantDetail.css";

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);

    useEffect(() => {
        fetch(`https://zomato-web-app.onrender.com/restaurant/${id}`, {
            method: "GET", 
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => setRestaurant(data))
        .catch(error => console.error("Error fetching restaurant data:", error));
    }, [id]);

    if (!restaurant) return <div className="loading">Loading...</div>;

    return (
        <div className="restaurant-detail">
            <div className="restaurant-header">
                <h1 className="restaurant-name">{restaurant.Restaurant_Name}</h1>
            </div>
            <div className="restaurant-info">
                <p className="restaurant-address">{restaurant.Address}</p>
                <p className="restaurant-cuisine">Cuisine: {restaurant.Cuisines}</p>
            </div>
        </div>
    );
};

export default RestaurantDetail;
