import { v4 as uuidv4 } from 'uuid';

export class TrafficDataService {
  constructor() {
    this.locations = this.initializeLocations();
    this.hourlyData = this.initializeHourlyData();
    this.weeklyData = this.initializeWeeklyData();
  }

  initializeLocations() {
    // Major locations in Bengaluru
    return [
      {
        id: uuidv4(),
        name: 'MG Road',
        status: 'moderate',
        speed: 25,
        incidents: 0,
        lat: 12.9716,
        lng: 77.5946,
        area: 'Central Business District'
      },
      {
        id: uuidv4(),
        name: 'Silk Board Junction',
        status: 'heavy',
        speed: 15,
        incidents: 1,
        lat: 12.9165,
        lng: 77.6229,
        area: 'South Bangalore'
      },
      {
        id: uuidv4(),
        name: 'Whitefield Main Road',
        status: 'moderate',
        speed: 30,
        incidents: 0,
        lat: 12.9698,
        lng: 77.7499,
        area: 'East Bangalore'
      },
      {
        id: uuidv4(),
        name: 'ORR (Outer Ring Road)',
        status: 'light',
        speed: 50,
        incidents: 0,
        lat: 12.9352,
        lng: 77.6245,
        area: 'Peripheral Ring'
      },
      {
        id: uuidv4(),
        name: 'Hebbal Flyover',
        status: 'heavy',
        speed: 20,
        incidents: 2,
        lat: 13.0358,
        lng: 77.5970,
        area: 'North Bangalore'
      },
      {
        id: uuidv4(),
        name: 'Indiranagar 100 Feet Road',
        status: 'moderate',
        speed: 28,
        incidents: 0,
        lat: 12.9784,
        lng: 77.6408,
        area: 'East Bangalore'
      },
      {
        id: uuidv4(),
        name: 'Koramangala',
        status: 'moderate',
        speed: 22,
        incidents: 1,
        lat: 12.9352,
        lng: 77.6245,
        area: 'South Bangalore'
      },
      {
        id: uuidv4(),
        name: 'Electronic City',
        status: 'light',
        speed: 45,
        incidents: 0,
        lat: 12.8456,
        lng: 77.6603,
        area: 'South Bangalore'
      }
    ];
  }

  initializeHourlyData() {
    const currentHour = new Date().getHours();
    const data = [];
    
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour - 23 + i) % 24;
      const hourStr = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      
      // Simulate realistic traffic patterns
      let vehicles;
      if (hour >= 0 && hour < 6) vehicles = 500 + Math.random() * 500;
      else if (hour >= 6 && hour < 9) vehicles = 4000 + Math.random() * 2000;
      else if (hour >= 9 && hour < 17) vehicles = 3500 + Math.random() * 1500;
      else if (hour >= 17 && hour < 20) vehicles = 5000 + Math.random() * 2000;
      else vehicles = 2000 + Math.random() * 1500;
      
      data.push({
        hour: hourStr,
        vehicles: Math.round(vehicles),
        timestamp: new Date().setHours(hour, 0, 0, 0)
      });
    }
    
    return data;
  }

  initializeWeeklyData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      volume: Math.round(35000 + Math.random() * 25000),
      predicted: Math.round(37000 + Math.random() * 25000),
      capacity: 60000
    }));
  }

  getAllLocations() {
    return this.locations;
  }

  getLocationById(id) {
    return this.locations.find(loc => loc.id === id);
  }

  updateTrafficConditions() {
    this.locations = this.locations.map(location => {
      // Randomly update traffic conditions
      const rand = Math.random();
      let newStatus = location.status;
      let newSpeed = location.speed;
      let newIncidents = location.incidents;

      // 30% chance of status change
      if (rand < 0.3) {
        const statusOptions = ['light', 'moderate', 'heavy'];
        newStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        // Adjust speed based on status
        if (newStatus === 'heavy') {
          newSpeed = 10 + Math.random() * 20;
        } else if (newStatus === 'moderate') {
          newSpeed = 25 + Math.random() * 25;
        } else {
          newSpeed = 45 + Math.random() * 20;
        }
      } else {
        // Small speed variation
        newSpeed = Math.max(5, location.speed + (Math.random() - 0.5) * 10);
      }

      // 10% chance of incident change
      if (Math.random() < 0.1) {
        newIncidents = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 3);
      }

      return {
        ...location,
        status: newStatus,
        speed: Math.round(newSpeed),
        incidents: newIncidents,
        lastUpdated: new Date().toISOString()
      };
    });

    // Update hourly data (add new point, remove oldest)
    this.updateHourlyData();
    
    return this.locations;
  }

  updateHourlyData() {
    const currentHour = new Date().getHours();
    const currentHourStr = currentHour === 0 ? '12 AM' : currentHour < 12 ? `${currentHour} AM` : currentHour === 12 ? '12 PM' : `${currentHour - 12} PM`;
    
    // Update the last entry with current hour data
    const lastIndex = this.hourlyData.length - 1;
    if (this.hourlyData[lastIndex]) {
      let vehicles;
      if (currentHour >= 0 && currentHour < 6) vehicles = 500 + Math.random() * 500;
      else if (currentHour >= 6 && currentHour < 9) vehicles = 4000 + Math.random() * 2000;
      else if (currentHour >= 9 && currentHour < 17) vehicles = 3500 + Math.random() * 1500;
      else if (currentHour >= 17 && currentHour < 20) vehicles = 5000 + Math.random() * 2000;
      else vehicles = 2000 + Math.random() * 1500;

      this.hourlyData[lastIndex] = {
        hour: currentHourStr,
        vehicles: Math.round(vehicles),
        timestamp: Date.now()
      };
    }
  }

  getAnalytics() {
    return {
      hourly: this.hourlyData,
      weekly: this.weeklyData,
      summary: {
        totalVolume: this.weeklyData.reduce((sum, day) => sum + day.volume, 0),
        avgSpeed: Math.round(this.locations.reduce((sum, loc) => sum + loc.speed, 0) / this.locations.length),
        totalIncidents: this.locations.reduce((sum, loc) => sum + loc.incidents, 0),
        peakDay: this.weeklyData.reduce((max, day) => day.volume > max.volume ? day : max, this.weeklyData[0])
      }
    };
  }

  addLocation(locationData) {
    const newLocation = {
      id: uuidv4(),
      ...locationData,
      lastUpdated: new Date().toISOString()
    };
    this.locations.push(newLocation);
    return newLocation;
  }

  searchLocations(query) {
    const lowerQuery = query.toLowerCase();
    return this.locations.filter(loc => 
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.area.toLowerCase().includes(lowerQuery)
    );
  }
}
