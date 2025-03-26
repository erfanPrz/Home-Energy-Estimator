import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WindowIcon from '@mui/icons-material/Window';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

function ResultsDisplay({ estimationData }) {
  if (!estimationData) return null;

  const { 
    address, 
    houseSize, 
    windowCount, 
    energyUsage 
  } = estimationData;

  // Convert from Trillion Btu to kWh (1 Trillion Btu = 293,071,070 kWh)
  // Since we're getting monthly data, we need to divide by 12 to get the monthly value
  const monthlyEnergyBtu = (energyUsage.value * 293071070) / 12;
  const monthlyEnergy = Math.round(monthlyEnergyBtu);

  console.log('Energy calculations:', {
    energyUsage,
    monthlyEnergy,
    houseSize,
  
  });


  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        align="center"
      >
        Estimation Results for {address}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HomeIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">House Size</Typography>
              <Typography variant="body1">
                {Math.round(houseSize)} sq ft
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Estimated Area
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WindowIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Windows</Typography>
              <Typography variant="body1">
                {windowCount} windows
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Estimated Count
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ElectricBoltIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Energy Usage</Typography>
              <Typography variant="body1">
                {monthlyEnergy} kWh/month
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Estimated Consumption
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> These are approximate estimates based on 
          statistical modeling and should not be considered precise measurements.
        </Typography>
      </Box>
    </Box>
  );
}

export default ResultsDisplay;
