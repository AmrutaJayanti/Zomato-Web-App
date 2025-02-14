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
        console.log("Image buffer size:", imageBuffer.length);
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "What type of cuisine is shown in this image? Please respond with just the cuisine name (e.g., 'Italian', 'Chinese', 'Indian', 'Mexican').";

        const result = await model.generateContent([
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: "image/jpeg"
                }
            },
            prompt
        ]);

        const response = await result.response;
        const cuisine = response.text().trim();
        return cuisine;
    } catch (err) {
        console.error("Cuisine classification error:", err);
        throw new Error("Failed to classify cuisine: " + err.message);
    }
}

async function findRestaurantsByCuisine(cuisine, page = 1, limit = 10) {
    try {
        const { data: restaurants, error } = await supabase
            .from("restaurants")
            .select("*");
        if (error) throw error;

    
        const matchingRestaurants = restaurants.filter(restaurant => 
            restaurant.Cuisines && restaurant.Cuisines.toLowerCase().includes(cuisine.toLowerCase())
        );
        const paginatedResults = paginate(matchingRestaurants, page, limit);

        return {
            restaurants: paginatedResults.data,
            totalPages: paginatedResults.totalPages,
        };
    } catch (error) {
        console.error("Error finding restaurants:", error);
        throw error;
    }
}

router.post("/search/image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        console.log("Received image:", req.file.originalname, "Size:", req.file.size);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        let cuisine;
        try {
            cuisine = await classifyCuisine(req.file.buffer);
        } catch (error) {
            console.error("Classification error:", error);
            return res.status(400).json({ error: "Could not classify cuisine: " + error.message });
        }
        try {
            const results = await findRestaurantsByCuisine(cuisine, page, limit);
            return res.json({
                cuisine,
                restaurants: results.restaurants,
                totalPages: results.totalPages
            });
        } catch (error) {
            console.error("Restaurant search error:", error);
            return res.status(500).json({ error: "Error searching restaurants: " + error.message });
        }

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            error: "Internal Server Error",
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));