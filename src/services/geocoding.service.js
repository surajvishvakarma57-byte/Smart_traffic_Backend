import axios from 'axios';

export class GeocodingService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  async geocodeAddress(address) {
    try {
      if (!this.apiKey || this.apiKey === 'AIzaSyDP7EBe3E7qhJfcQO0OyE8GVZUfklJYutc') {
        // Return mock data when API key is not configured
        return this.getMockGeocodeResult(address);
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          address: address,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          success: true,
          data: {
            formattedAddress: result.formatted_address,
            location: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            },
            placeId: result.place_id,
            types: result.types,
            viewport: result.geometry.viewport
          }
        };
      } else {
        return {
          success: false,
          error: 'Location not found',
          status: response.data.status
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async reverseGeocode(lat, lng) {
    try {
      if (!this.apiKey || this.apiKey === 'AIzaSyDP7EBe3E7qhJfcQO0OyE8GVZUfklJYutc') {
        return this.getMockReverseGeocodeResult(lat, lng);
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          success: true,
          data: {
            formattedAddress: result.formatted_address,
            location: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            },
            placeId: result.place_id,
            types: result.types
          }
        };
      } else {
        return {
          success: false,
          error: 'Location not found',
          status: response.data.status
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mock data for when API key is not configured
  getMockGeocodeResult(address) {
    const mockLocations = {
      'mg road': {
        formattedAddress: 'MG Road, Bengaluru, Karnataka, India',
        location: { lat: 12.9716, lng: 77.5946 }
      },
      'silk board': {
        formattedAddress: 'Silk Board Junction, Bengaluru, Karnataka, India',
        location: { lat: 12.9165, lng: 77.6229 }
      },
      'whitefield': {
        formattedAddress: 'Whitefield, Bengaluru, Karnataka, India',
        location: { lat: 12.9698, lng: 77.7499 }
      },
      'koramangala': {
        formattedAddress: 'Koramangala, Bengaluru, Karnataka, India',
        location: { lat: 12.9352, lng: 77.6245 }
      },
      'indiranagar': {
        formattedAddress: 'Indiranagar, Bengaluru, Karnataka, India',
        location: { lat: 12.9784, lng: 77.6408 }
      }
    };

    const searchKey = address.toLowerCase();
    for (const [key, value] of Object.entries(mockLocations)) {
      if (searchKey.includes(key)) {
        return {
          success: true,
          data: {
            ...value,
            placeId: 'mock_place_id',
            types: ['route'],
            isMock: true
          }
        };
      }
    }

    // Default to Bengaluru center
    return {
      success: true,
      data: {
        formattedAddress: 'Bengaluru, Karnataka, India',
        location: { lat: 12.9716, lng: 77.5946 },
        placeId: 'mock_place_id',
        types: ['locality'],
        isMock: true
      }
    };
  }

  getMockReverseGeocodeResult(lat, lng) {
    return {
      success: true,
      data: {
        formattedAddress: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        location: { lat, lng },
        placeId: 'mock_place_id',
        types: ['point_of_interest'],
        isMock: true
      }
    };
  }

  async searchPlaces(query) {
    // This would use Places API in production
    // For now, return filtered locations
    const commonPlaces = [
      { name: 'MG Road', lat: 12.9716, lng: 77.5946 },
      { name: 'Silk Board Junction', lat: 12.9165, lng: 77.6229 },
      { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
      { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
      { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
      { name: 'Electronic City', lat: 12.8456, lng: 77.6603 },
      { name: 'Hebbal', lat: 13.0358, lng: 77.5970 }
    ];

    const filtered = commonPlaces.filter(place =>
      place.name.toLowerCase().includes(query.toLowerCase())
    );

    return {
      success: true,
      data: filtered
    };
  }
}
