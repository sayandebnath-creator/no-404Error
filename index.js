require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Dummy local database
const images = [
  { id: 1, name: "sunset", url: "/images/sunset.jpg" },
  { id: 2, name: "ocean", url: "/images/ocean.jpg" },
  { id: 3, name: "mountain", url: "/images/mountain.jpg" },
];


const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

// Function to search local images
const findLocalImage = (query) => {
  return images.find((img) => img.name.includes(query));
};

// Function to search Unsplash
const searchUnsplash = async (query) => {
  try {
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query, per_page: 1 },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });
    return response.data.results.length ? response.data.results[0].urls.small : null;
  } catch (error) {
    console.error("Unsplash API Error:", error.message);
    return null;
  }
};

// Function to search Pixabay
const searchPixabay = async (query) => {
  try {
    const response = await axios.get(`https://pixabay.com/api/`, {
      params: { key: PIXABAY_API_KEY, q: query, per_page: 1 },
    });
    return response.data.hits.length ? response.data.hits[0].webformatURL : null;
  } catch (error) {
    console.error("Pixabay API Error:", error.message);
    return null;
  }
};


app.get("/image/:name", async (req, res) => {
  const imageName = req.params.name.toLowerCase();


  let image = findLocalImage(imageName);
  if (image) {
    return res.json({ message: "Image found locally", data: image });
  }


  image = await searchUnsplash(imageName);
  if (image) {
    return res.json({ message: "Image found on Unsplash", url: image });
  }


  image = await searchPixabay(imageName);
  if (image) {
    return res.json({ message: "Image found on Pixabay", url: image });
  }


  res.json({
    message: "No exact match found, showing default image",
    url: "https://via.placeholder.com/400", // Default fallback image
  });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
