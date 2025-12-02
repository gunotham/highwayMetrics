// Temporarily testing routing functionality
import { config } from 'dotenv';
config(); // Load environment variables from .env files

// Import the routing service file content directly
const fs = require('fs');
const path = require('path');

// Read the routing service file and extract the class
const routingServiceContent = fs.readFileSync('./src/services/routing.ts', 'utf8');

// Rather than trying to parse the TypeScript, let's just make the API call directly
async function testRoute() {
    const ORS_API_KEY = process.env.ORS_API_KEY;

    if (!ORS_API_KEY) {
        console.error('ORS_API_KEY not found in environment variables');
        process.exit(1);
    }

    console.log('Testing route from Hyderabad to Nagpur (NH44)...');
    
    // Coordinates: Hyderabad and Nagpur
    const start = [78.482083, 17.520417];  // Hyderabad
    const end = [79.049083, 21.021194];    // Nagpur
    
    try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
            method: 'POST',
            headers: {
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coordinates: [start, end],
                format: 'geojson',
                preference: 'recommended'
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouteService error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Route response:', JSON.stringify(data, null, 2));
        
        if (data.features && data.features[0] && data.features[0].geometry && data.features[0].geometry.coordinates) {
            console.log('\nNumber of coordinate points in the route:', data.features[0].geometry.coordinates.length);
            console.log('Distance:', data.features[0].properties.summary.distance, 'meters');
            console.log('Duration:', data.features[0].properties.summary.duration, 'seconds');
        }
    } catch (error) {
        console.error('Error getting route:', error.message);
    }
}

testRoute();