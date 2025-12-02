// Temporarily testing routing functionality
import { config } from 'dotenv';
import { RoutingService } from './src/services/routing.js';

config(); // Load environment variables from .env files

const API_KEY = process.env.ORS_API_KEY;

if (!API_KEY) {
    console.error('ORS_API_KEY not found in environment variables');
    process.exit(1);
}

async function testRoute() {
    try {
        console.log('Testing route from Hyderabad to Nagpur (NH44)...');
        
        // Coordinates: Hyderabad and Nagpur
        const start = [78.482083, 17.520417];  // Hyderabad
        const end = [79.049083, 21.021194];    // Nagpur
        
        const routeResponse = await RoutingService.getRoute({
            start,
            end,
            profile: 'driving-car',
            preference: 'recommended'
        }, API_KEY);
        
        console.log('Route response:', JSON.stringify(routeResponse, null, 2));
        
        console.log('\nNumber of coordinate points in the route:', routeResponse.geometry.coordinates.length);
        console.log('Distance:', routeResponse.distance, 'meters');
        console.log('Duration:', routeResponse.duration, 'seconds');
        
    } catch (error) {
        console.error('Error getting route:', error.message);
        console.error('This is expected if no valid API key is provided');
    }
}

testRoute();