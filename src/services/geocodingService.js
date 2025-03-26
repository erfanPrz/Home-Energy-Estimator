import axios from 'axios';

// Nominatim OpenStreetMap Geocoding
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'HomeEnergyEstimator/1.0'
      }
    });

    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { 
        latitude: parseFloat(lat), 
        longitude: parseFloat(lon),
        displayName: response.data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// House Size Estimation
export const estimateHouseSize = (lat, lon) => {
  // Simple estimation logic
  const baseSize = 1500; // Average house size
  const latVariation = Math.abs(lat) % 200; // Use latitude for slight variation
  const lonVariation = Math.abs(lon) % 150; // Use longitude for slight variation
  
  return Math.round(baseSize + latVariation + lonVariation);
};

// Window Count Estimation
export const estimateWindowCount = (houseSize) => {
  // Estimate windows based on house size
  return Math.round(houseSize / 150); // Approx 1 window per 150 sq ft
};

// Energy Usage Estimation
export const estimateEnergyUsage = (houseSize) => {
  // Mock energy usage calculation
  const averageMonthlyUsage = houseSize * 0.5; // kWh estimate
  const energyRate = 0.12; // Average electricity rate per kWh

  return {
    monthlyUsage: Math.round(averageMonthlyUsage),
    annualUsage: Math.round(averageMonthlyUsage * 12),
    estimatedMonthlyCost: Math.round(averageMonthlyUsage * energyRate)
  };
};