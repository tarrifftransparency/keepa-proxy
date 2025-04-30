import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const KEEPA_API_KEY = process.env.KEEPA_API_KEY;

const cache = new NodeCache({ stdTTL: 86400 });

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please try again later.'
});

app.use(limiter);

app.get('/keepa', async (req, res) => {
  const { asin } = req.query;
  if (!asin) return res.status(400).json({ error: 'ASIN is required' });

  const cacheKey = `keepa-${asin}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const keepaUrl = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=1&asin=${asin}`;
    const response = await fetch(keepaUrl);
    if (!response.ok) throw new Error('Keepa API error');
    const data = await response.json();
    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from Keepa API' });
  }
});

app.listen(PORT, () => {
  console.log(`Keepa proxy running at http://localhost:${PORT}`);
});