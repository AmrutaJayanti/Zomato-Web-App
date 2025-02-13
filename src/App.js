import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/Header";
import RestaurantList from "./pages/RestaurantList";
import RestaurantDetail from "./pages/RestaurantDetail";
import LocationSearch from "./pages/LocationSearch";
import ImageSearch from "./pages/ImageSearch";
import "./App.css";

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/restaurants" />} />
                        <Route path="/restaurants" element={<RestaurantList />} />
                        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                        <Route path="/location-search" element={<LocationSearch />} />
                        <Route path="/image-search" element={<ImageSearch />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;