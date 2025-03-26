import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  geocodeAddress, 
  estimateHouseSize, 
  estimateWindowCount, 
  estimateEnergyUsage 
} from '../services/geocodingService';

function AddressForm({ onEstimationComplete }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddressSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate address input
      if (!data.address || data.address.trim().length < 3) {
        setError('Please enter a valid address or postal code');
        setIsLoading(false);
        return;
      }

      // Geocode the address
      const geoLocation = await geocodeAddress(data.address);

      if (!geoLocation) {
        setError('Unable to find location. Please check the address.');
        setIsLoading(false);
        return;
      }

      // Estimate house details
      const houseSize = estimateHouseSize(
        geoLocation.latitude, 
        geoLocation.longitude
      );
      const windowCount = estimateWindowCount(houseSize);
      const energyUsage = estimateEnergyUsage(houseSize);

      // Pass results back to parent component
      onEstimationComplete({
        address: geoLocation.displayName || data.address,
        location: geoLocation,
        houseSize,
        windowCount,
        energyUsage
      });

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Home Energy Estimator
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleAddressSubmit)}>
        <TextField
          fullWidth
          label="Enter Postal Code or Address"
          variant="outlined"
          {...register('address', { 
            required: 'Address is required',
            minLength: { 
              value: 3, 
              message: 'Address too short' 
            }
          })}
          error={!!errors.address}
          helperText={errors.address?.message}
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            'Estimate Energy'
          )}
        </Button>
      </form>
    </Box>
  );
}

export default AddressForm;