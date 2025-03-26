# Home Energy Estimator

A web application that estimates house size, number of windows, and energy usage based on postal code or address input.

## Features

- Input postal code or full address
- Get estimates for:
  - House size (square feet)
  - Number of windows
  - Monthly energy usage (kWh)
- Clean, modern UI with Material-UI components
- Mobile-responsive design
- Form validation and error handling

## Tech Stack

- React.js
- Material-UI (MUI)
- React Hook Form
- Axios (for API calls)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd home-energy-estimator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## API Integration

Currently, the application uses mock data for demonstration purposes. To integrate with real APIs:

1. Google Maps API for address validation and geocoding
2. Real estate data APIs for house size estimation
3. Energy usage data APIs for consumption estimates

## Limitations and Assumptions

- Current implementation uses mock data
- House size estimates are based on neighborhood averages
- Window count is estimated based on typical house sizes
- Energy usage is approximated based on similar properties

## Next Steps

1. Integrate with real APIs for accurate data
2. Add more detailed property information
3. Implement user authentication
4. Add historical energy usage trends
5. Include energy-saving recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
