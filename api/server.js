import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import supabase from "./config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();
app.use("/restaurants", router); 
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json({ charset: 'utf-8' }));


function paginate(data, page, limit) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
        data: data.slice(start, end),
        totalPages: Math.ceil(data.length / limit),
    };
}

// 🟢 Get List of Restaurants with Pagination
app.get("/restaurants", async (req, res) => {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const { data: restaurants, error } = await supabase.from("restaurants").select("*");
    if (error) {
        console.error("Supabase Fetch Error:", error);
        return res.status(400).json({ error: error.message });
    }

    const paginatedResults = paginate(restaurants, page, limit);
    res.json({
        restaurants: paginatedResults.data,
        totalPages: paginatedResults.totalPages,
    });
});

// 🟢 Get a Restaurant by ID (no need for pagination)
app.get("/restaurant/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase.from("restaurants").select("*").eq("Restaurant_ID", id).maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Restaurant not found" });

    res.json(data);
});

// 🟢 Search Restaurants Nearby with Pagination
app.get("/restaurants/nearby", async (req, res) => {
    const { lat, lng, radius = 5, page = 1, limit = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Latitude and Longitude are required!" });

    const { data: restaurants, error } = await supabase.from("restaurants").select("*");
    if (error) return res.status(500).json({ error: error.message });

    // Haversine formula
    const R = 6371;
    const toRadians = (deg) => deg * (Math.PI / 180);
    const userLat = toRadians(lat);
    const userLng = toRadians(lng);

    const nearbyRestaurants = restaurants.filter((restaurant) => {
        const restLat = toRadians(restaurant.Latitude);
        const restLng = toRadians(restaurant.Longitude);
        const dLat = restLat - userLat;
        const dLng = restLng - userLng;

        const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLat) * Math.cos(restLat) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance <= radius;
    });

    const paginatedResults = paginate(nearbyRestaurants, parseInt(page), parseInt(limit));

    res.json({
        nearbyRestaurants: paginatedResults.data,
        totalPages: paginatedResults.totalPages,
    });
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


async function classifyCuisine(imageBuffer) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use updated model

        const result = await model.generateContent([
            { inlineData: { mimeType: "image/png", data: imageBuffer.toString("base64") } },
            "Analyze the image and classify the cuisine. Return only the cuisine name (e.g., 'Italian', 'Chinese', 'Indian', 'Mexican')."
        ]);

        console.log("Gemini API Response:", JSON.stringify(result, null, 2)); // Debugging

        const cuisine = result.response.candidates[0].content.parts[0].text.trim();
        return cuisine;
    } catch (err) {
        console.error("Error processing image:", err);
        return null;
    }
}

app.post("/restaurants/search/image", async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const cuisine = await classifyCuisine(req.file.buffer);
        res.json({ cuisine });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
