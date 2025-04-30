const express = require("express");
const fetch = require("node-fetch");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const KEEPA_API_KEY = process.env.KEEPA_API_KEY;

app.get("/keepa", async (req, res) => {
  const { asin } = req.query;
  if (!asin) {
    return res.status(400).json({ error: "Missing ASIN" });
  }

  try {
    const keepaURL = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=1&asin=${asin}&history=1&stats=1`;

    const response = await fetch(keepaURL);
    const data = await response.json();

    if (!data.products || !data.products[0]?.data?.NEW) {
      return res.status(404).json({ error: "Missing price history in response", raw: data });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching Keepa data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Keepa proxy running at http://localhost:${PORT}`);
});
