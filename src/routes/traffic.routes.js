import express from 'express';

const router = express.Router();

// Helper functions to get services from app
const getTrafficService = (req) => req.app.get('trafficService');
const getBroadcast = (req) => req.app.get('broadcast');

// Get all traffic locations
router.get('/locations', (req, res) => {
  try {
    const trafficService = getTrafficService(req);
    const locations = trafficService.getAllLocations();

    console.log(`📍 GET /locations - Returning ${locations.length} locations`);

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error getting locations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get location by ID
router.get('/locations/:id', (req, res) => {
  try {
    const trafficService = getTrafficService(req);
    const location = trafficService.getLocationById(req.params.id);

    if (location) {
      res.json({
        success: true,
        data: location
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }
  } catch (error) {
    console.error('Error getting location:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search locations
router.get('/search', (req, res) => {
  try {
    const trafficService = getTrafficService(req);
    const query = req.query.q || '';
    const results = trafficService.searchLocations(query);

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔥 ADD NEW LOCATION - WITH IMMEDIATE WEBSOCKET BROADCAST
router.post('/locations', (req, res) => {
  try {
    const trafficService = getTrafficService(req);
    const broadcast = getBroadcast(req);

    const { name, lat, lng, area, status, speed, incidents } = req.body;

    // Validate required fields
    if (!name || !lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, lat, lng'
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('📍 NEW LOCATION REQUEST');
    console.log('='.repeat(50));
    console.log('📌 Name:', name);
    console.log('📊 Before adding - Total locations:', trafficService.getAllLocations().length);

    // Add location to service
    const newLocation = trafficService.addLocation({
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      area: area || 'User Added',
      status: status || 'moderate',
      speed: parseInt(speed) || 30,
      incidents: parseInt(incidents) || 0
    });

    console.log('✅ Location added successfully!');
    console.log('🆔 New Location ID:', newLocation.id);
    console.log('📊 After adding - Total locations:', trafficService.getAllLocations().length);

    // 🔥 CRITICAL: Broadcast update to all connected clients IMMEDIATELY
    if (broadcast && typeof broadcast === 'function') {
      const allLocations = trafficService.getAllLocations();

      const sentCount = broadcast({
        type: 'traffic_update',
        data: allLocations,
        timestamp: new Date().toISOString()
      });

      console.log('📡 ✅ BROADCASTED IMMEDIATELY!');
      console.log('📡 Total locations in broadcast:', allLocations.length);
      console.log('📡 Clients received update:', sentCount);
      console.log('='.repeat(50) + '\n');
    } else {
      console.error('❌ ERROR: Broadcast function not available!');
      console.error('⚠️ Frontend will NOT update until next 5-second interval');
      console.log('='.repeat(50) + '\n');
    }

    // Return success response
    res.json({
      success: true,
      message: 'Location added and broadcasted successfully',
      data: newLocation,
      totalLocations: trafficService.getAllLocations().length
    });

  } catch (error) {
    console.error('❌ Error adding location:', error);
    console.log('='.repeat(50) + '\n');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete location
router.delete('/locations/:id', (req, res) => {
  try {
    const trafficService = getTrafficService(req);
    const broadcast = getBroadcast(req);

    const locationId = req.params.id;
    const location = trafficService.getLocationById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    // Remove location
    trafficService.locations = trafficService.locations.filter(loc => loc.id !== locationId);

    console.log(`🗑️ Deleted location: ${location.name}`);

    // Broadcast update
    if (broadcast) {
      broadcast({
        type: 'traffic_update',
        data: trafficService.getAllLocations(),
        timestamp: new Date().toISOString()
      });
      console.log('📡 Broadcasted deletion update');
    }

    res.json({
      success: true,
      message: 'Location deleted successfully',
      deletedLocation: location
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manual trigger for traffic update
router.post('/update', (req, res) => {
  try {
    const trafficService = getTrafficService(req);
    const broadcast = getBroadcast(req);

    console.log('🔄 Manual traffic update triggered');

    const updatedLocations = trafficService.updateTrafficConditions();

    if (broadcast) {
      const sentCount = broadcast({
        type: 'traffic_update',
        data: updatedLocations,
        timestamp: new Date().toISOString()
      });
      console.log('📡 Broadcasted manual update to', sentCount, 'clients');
    }

    res.json({
      success: true,
      message: 'Traffic data updated and broadcasted',
      data: updatedLocations,
      count: updatedLocations.length
    });
  } catch (error) {
    console.error('Error updating traffic:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;