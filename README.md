# Home Energy Estimator

A web application that estimates home energy usage based on address and property information. The application uses OpenStreetMap for address validation and EIA (Energy Information Administration) API for energy consumption data.

## Features

- Address validation using OpenStreetMap API
- Real-time energy consumption data from EIA API
- Property size estimation based on location type
- Window count estimation
- Monthly energy usage calculation
- Responsive design with Material-UI
- Interactive energy meters and visualizations

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- EIA API key (get it from [EIA Open Data](https://www.eia.gov/opendata/))


## API Integration

### OpenStreetMap API
- Used for address validation and geocoding
- No API key required
- Rate limiting: 1 request per second

### EIA API
- Used for energy consumption data
- Requires API key
- Provides monthly energy consumption data
- Residential portion estimated at 20% of total consumption

## Estimation Methods

### House Size
- Base sizes by property type:
  - House/Residential: 2000 sq ft
  - Apartment: 1000 sq ft
  - Condo: 1200 sq ft
  - Default: 1800 sq ft
- Adjustments for multi-family dwellings and high-rise buildings

### Windows
- Window-to-floor-area ratio by property type:
  - House/Residential: 1.5 windows per 100 sq ft
  - Apartment/Condo: 1 window per 100 sq ft
  - Default: 1.2 windows per 100 sq ft

### Energy Usage
- Real data from EIA API when available
- Fallback estimation: 0.5 kWh per sq ft
- Maximum energy usage: 2000 kWh

