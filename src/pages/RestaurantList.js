import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../styles/RestaurantList.css";

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10; // Adjust according to your backend pagination limit

    useEffect(() => {
        fetch(`https://zomato-web-app.onrender.com/restaurants?page=${currentPage}&limit=${itemsPerPage}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setRestaurants(data.restaurants || data); // Ensure it matches the backend structure
                setTotalPages(data.totalPages || Math.ceil(data.length / itemsPerPage)); // Fallback calculation if totalPages not returned
            })
            .catch((error) => console.error("Fetch error:", error));
    }, [currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    return (
        <div className="container">
            <h1>Restaurants</h1>
            {restaurants.map((r) => (
                <Link
                    key={r.Restaurant_ID}
                    to={`/restaurant/${r.Restaurant_ID}`}
                    style={{ display: "block", margin: "10px 0" }}
                >
                    <h3>{r.Restaurant_Name}</h3>
                    <p>{r.Address}</p>
                </Link>
            ))}
            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default RestaurantList;
