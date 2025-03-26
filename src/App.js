// Import necessary React and Material-UI components
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import HomeIcon from '@mui/icons-material/Home';
import WindowIcon from '@mui/icons-material/Window';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';

// Constants for estimations
const HOUSE_SIZE_BY_TYPE = {
  'house': 2000,
  'residential': 2000,
  'apartment': 1000,
  'condo': 1200,
  'default': 1800
};

const WINDOWS_BY_TYPE = {
  'house': 0.015,    // 1.5 windows per 100 sq ft
  'residential': 0.015,
  'apartment': 0.01,  // 1 window per 100 sq ft
  'condo': 0.01,
  'default': 0.012   // 1.2 windows per 100 sq ft
};

const ENERGY_PER_SQFT = 0.5; // 0.5 kWh per sq ft
const MAX_ENERGY = 2000; // Maximum energy usage for the meter
const MAX_WINDOWS = 30; // Maximum windows for the meter

// EIA API endpoints
const EIA_API_BASE = 'https://api.eia.gov/v2/total-energy/data/';
const EIA_PARAMS = {
  frequency: 'monthly',
  'data[0]': 'value',
  'sort[0][column]': 'period',
  'sort[0][direction]': 'desc',
  offset: 0,
  length: 5000
};

// Main App component
function App() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const validateAddress = async (address) => {
    try {
      // Add a delay to respect Nominatim's usage policy
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          params: {
            limit: 1,
            addressdetails: 1,
            'accept-language': 'en-US,en;q=0.9'
          }
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('Address not found. Please try a different address or postal code.');
      }

      const location = response.data[0];
      
      // Validate the location data
      if (!location.display_name || !location.lat || !location.lon) {
        throw new Error('Invalid location data received');
      }

      return location;
    } catch (err) {
      console.error('Address validation error:', err);
      if (err.response) {
        throw new Error(`Server error: ${err.response.status} - ${err.response.statusText}`);
      } else if (err.request) {
        throw new Error('No response received from the server. Please check your internet connection.');
      } else {
        throw new Error('Error validating address. Please try again.');
      }
    }
  };

  const getEnergyData = async () => {
    try {
      const response = await axios.get(
        EIA_API_BASE,
        {
          params: {
            api_key: process.env.REACT_APP_EIA_API_KEY,
            ...EIA_PARAMS
          }
        }
      );

      if (!response.data?.response?.data?.[0]?.value) {
        return null;
      }

      // Get the most recent monthly value
      const monthlyValue = Number(response.data.response.data[0].value);
      // Convert from Trillion Btu to kWh (1 Trillion Btu = 293,071,070 kWh)
      // Take 20% for residential portion
      return (monthlyValue * 293071070) * 0.2;
    } catch (err) {
      console.error('Error fetching energy data:', err);
      return null;
    }
  };

  const estimateHouseSize = (location) => {
    // Get property type from location
    const propertyType = location.type || location.class || 'default';
    
    // Get base size from property type
    let baseSize = HOUSE_SIZE_BY_TYPE[propertyType] || HOUSE_SIZE_BY_TYPE.default;
    
    // Adjust based on address details
    if (location.address) {
      // If it's a multi-family dwelling
      if (location.address.house_number?.includes('/')) {
        baseSize *= 0.75; // Reduce size by 25%
      }
      
      // If it's a high-rise building
      if (location.address.building) {
        baseSize *= 0.5; // Reduce size by 50%
      }
    }

    return Math.round(baseSize);
  };

  const estimateWindows = (houseSize, location) => {
    const propertyType = location.type || location.class || 'default';
    const windowRatio = WINDOWS_BY_TYPE[propertyType] || WINDOWS_BY_TYPE.default;
    return Math.round(houseSize * windowRatio);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Step 1: Validate address
      const location = await validateAddress(data.address);
      
      // Step 2: Get energy data
      const monthlyEnergy = await getEnergyData();
      
      // Step 3: Calculate estimates
      const houseSize = estimateHouseSize(location);
      const windowCount = estimateWindows(houseSize, location);
      
      // Step 4: Set results
      setResults({
        address: location.display_name,
        locationType: location.type || 'residential',
        houseSize,
        windowCount,
        monthlyEnergy: monthlyEnergy ? Math.round(monthlyEnergy) : Math.round(houseSize * ENERGY_PER_SQFT),
        dataSource: monthlyEnergy ? 'EIA' : 'Estimated'
      });
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to fetch property information');
    } finally {
      setLoading(false);
    }
  };

  const EnergyMeter = ({ value, max }) => {
    // Ensure values are numbers and handle undefined/null
    const numericValue = Number(value) || 0;
    const numericMax = Number(max) || 1;
    
    // Calculate percentage, ensuring we don't divide by zero
    const percentage = numericMax > 0 ? Math.min((numericValue / numericMax) * 100, 100) : 0;
    const color = percentage > 80 ? 'error' : percentage > 60 ? 'warning' : 'success';

    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={color}
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {percentage.toFixed(1)}% of typical maximum
        </Typography>
      </Box>
    );
  };

  const InfoCard = ({ title, value, icon, description, meter, tooltip }) => (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ ml: 1 }}>
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <IconButton size="small" sx={{ ml: 'auto' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {meter}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
        {description}
      </Typography>
    </Paper>
  );

  // Render the application layout
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(45deg, #FFD700, #FFA500)`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            mb: 4
          }}
        >
          Home Energy Estimator
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            mt: 4,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #fff9e6 100%)'
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Enter Postal Code or Address"
              variant="outlined"
              margin="normal"
              placeholder="e.g., 123 Main St, Vancouver or V6B 1A1"
              {...register("address", { 
                required: "Address is required",
                minLength: {
                  value: 3,
                  message: "Please enter a valid address or postal code"
                }
              })}
              error={!!errors.address}
              helperText={errors.address?.message}
              InputProps={{
                startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ 
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                background: `linear-gradient(45deg, #FFD700, #FFA500)`,
                '&:hover': {
                  background: `linear-gradient(45deg, #FFC700, #FF9500)`,
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Get Estimate"}
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {results && (
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  mb: 3
                }}
              >
                Property Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    title="Address"
                    value={results.address}
                    icon={<LocationOnIcon color="primary" />}
                    description={`${results.locationType.charAt(0).toUpperCase() + results.locationType.slice(1)} property`}
                    tooltip={`${results.addressDetails?.house_number ? `House #${results.addressDetails.house_number}` : ''} ${results.addressDetails?.road || ''}`}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    title="House Size"
                    value={`${results.houseSize} sq ft`}
                    icon={<HomeIcon color="primary" />}
                    description={`Based on typical ${results.locationType} size in this area`}
                    tooltip="Estimated based on property type and location"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    title="Windows"
                    value={`${results.windowCount} windows`}
                    icon={<WindowIcon color="primary" />}
                    description="Based on typical window-to-floor-area ratio"
                    meter={<EnergyMeter value={results.windowCount} max={MAX_WINDOWS} />}
                    tooltip="Estimated based on house size and typical residential patterns"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    title="Energy Usage"
                    value={`${results.monthlyEnergy} kWh`}
                    icon={<ElectricBoltIcon color="primary" />}
                    description={results.dataSource === 'EIA' 
                      ? 'Based on total energy consumption data from EIA'
                      : 'Based on typical residential energy consumption'}
                    meter={<EnergyMeter value={results.monthlyEnergy} max={MAX_ENERGY} />}
                    tooltip={results.dataSource === 'EIA'
                      ? 'Estimated based on house size and typical consumption'
                      : 'Estimated based on house size and typical consumption'}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default App;