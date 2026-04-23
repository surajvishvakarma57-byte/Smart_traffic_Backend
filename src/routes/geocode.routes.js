import express from 'express';
import { GeocodingService } from '../services/geocoding.service.js';

const router = express.Router();
const geocodingService = new GeocodingService();

// Geocode an address
router.get('/forward', async (req, res) => {
  try {
    const address = req.query.address;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address parameter is required'
      });
    }

    const result = await geocodingService.geocodeAddress(address);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reverse geocode coordinates
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude parameters are required'
      });
    }

    const result = await geocodingService.reverseGeocode(
      parseFloat(lat),
      parseFloat(lng)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search places
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter (q) is required'
      });
    }

    const result = await geocodingService.searchPlaces(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
