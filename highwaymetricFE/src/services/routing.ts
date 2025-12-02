import { HighwayGeometry } from '../components/Map';

interface RouteParams {
  start: [number, number]; // [longitude, latitude]
  end: [number, number];   // [longitude, latitude]
  profile?: string;        // 'driving-car', 'cycling-regular', etc.
  preference?: string;     // 'shortest', 'fastest', 'recommended'
}

interface RouteResponse {
  geometry: HighwayGeometry;
  distance: number; // in meters
  duration: number; // in seconds
}

export class RoutingService {
  private static readonly ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';
  
  /**
   * Get route geometry between two points using OpenRouteService
   * @param params - Routing parameters including start/end coordinates
   * @param apiKey - OpenRouteService API key (will be provided by user)
   * @returns Route geometry and metadata
   */
  static async getRoute(
    params: RouteParams, 
    apiKey: string
  ): Promise<RouteResponse> {
    const { start, end, profile = 'driving-car', preference = 'fastest' } = params;
    
    const response = await fetch(`${this.ORS_BASE_URL}/${profile}`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [start, end],
        format: 'geojson',
        preference: preference,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouteService error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the route geometry and metadata
    const geometry: HighwayGeometry = {
      type: 'LineString',
      coordinates: data.features[0].geometry.coordinates,
    };

    const distance = data.features[0].properties.summary.distance;
    const duration = data.features[0].properties.summary.duration;

    return {
      geometry,
      distance,
      duration
    };
  }

  /**
   * Get the NH44 route between Hyderabad and Nagpur
   * @param apiKey - OpenRouteService API key
   * @returns Route geometry for NH44
   */
  static async getNH44Route(apiKey: string): Promise<RouteResponse> {
    // Coordinates: Hyderabad (17°31'13.5"N 78°28'55.5"E) and Nagpur (21°01'16.3"N 79°02'56.7"E)
    // Convert to [longitude, latitude] format
    const start: [number, number] = [78.482083, 17.520417]; // [lng, lat] - Hyderabad
    const end: [number, number] = [79.049083, 21.021194];   // [lng, lat] - Nagpur
    
    return this.getRoute({
      start,
      end,
      profile: 'driving-car',
      preference: 'recommended' // Use recommended to follow major highways like NH44 when possible
    }, apiKey);
  }
  
  /**
   * Generate a route that follows specific highways if possible
   * @param start - Start coordinates [lng, lat]
   * @param end - End coordinates [lng, lat]
   * @param highwayRefs - Highway reference numbers (e.g., ['NH44'])
   * @param apiKey - OpenRouteService API key
   * @returns Route geometry following specified highways
   */
  static async getHighwayRoute(
    start: [number, number], 
    end: [number, number], 
    highwayRefs: string[], 
    apiKey: string
  ): Promise<RouteResponse> {
    return this.getRoute({
      start,
      end,
      profile: 'driving-car',
      preference: 'recommended' // Use recommended to potentially follow major highways
    }, apiKey);
  }

  /**
   * Generate a route with multiple intermediate points for more detailed path following
   * @param start - Start coordinates [lng, lat]
   * @param end - End coordinates [lng, lat]
   * @param apiKey - OpenRouteService API key
   * @returns Route geometry with more detailed path
   */
  static async getDetailedRoute(
    start: [number, number], 
    end: [number, number], 
    apiKey: string
  ): Promise<RouteResponse> {
    // For this implementation, we'll create a more detailed route by
    // splitting the journey into segments and getting routes for each segment
    // In a production environment, you might use routing APIs with via-points
    
    // For now, return the normal route but with the understanding that in the future
    // this could be enhanced to follow specific highways better
    return this.getRoute({
      start,
      end,
      profile: 'driving-car',
      preference: 'recommended'
    }, apiKey);
  }
}