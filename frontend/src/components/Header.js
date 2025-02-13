// components/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./../styles/Header.css";

const Header = () => {
    return (
        <header className="header">
            <nav className="nav-container">
                <NavLink to="/restaurants" className="nav-logo">
                    RestaurantFinder
                </NavLink>
                <div className="nav-links">
                    <NavLink 
                        to="/restaurants" 
                        className={({ isActive }) => 
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        All Restaurants
                    </NavLink>
                    <NavLink 
                        to="/location-search" 
                        className={({ isActive }) => 
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Search by Location
                    </NavLink>
                    <NavLink 
                        to="/image-search" 
                        className={({ isActive }) => 
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Search by Image
                    </NavLink>
                </div>
            </nav>
        </header>
    );
};

export default Header;