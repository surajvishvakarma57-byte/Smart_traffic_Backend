import express from 'express';
import { TrafficDataService } from '../services/traffic.service.js';

const router = express.Router();
const trafficService = new TrafficDataService();

// Get analytics overview
router.get('/overview', (req, res) => {
  try {
    const analytics = trafficService.getAnalytics();
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get hourly traffic data
router.get('/hourly', (req, res) => {
  try {
    const analytics = trafficService.getAnalytics();
    res.json({
      success: true,
      data: analytics.hourly,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get weekly traffic data
router.get('/weekly', (req, res) => {
  try {
    const analytics = trafficService.getAnalytics();
    res.json({
      success: true,
      data: analytics.weekly,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get summary statistics
router.get('/summary', (req, res) => {
  try {
    const analytics = trafficService.getAnalytics();
    res.json({
      success: true,
      data: analytics.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
