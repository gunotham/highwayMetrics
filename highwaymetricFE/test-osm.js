#!/usr/bin/env node

// test-osm.js - Simple script to test fetching OSM data for highways

import fs from 'fs/promises';

// Function to fetch highway data from OSM
async function fetchHighwayData(highwayRef, bbox = null) {
  // Query for highways with the specific reference number
  // Use a query that should return ways with geometries directly
  let query;
  if (bbox) {
    // Parse bbox from string "minLat,minLon,maxLat,maxLon"
    const [minLat, minLon, maxLat, maxLon] = bbox.split(',').map(Number);
    
    query = `
      [out:json][timeout:25];
      (
        way["ref"="${highwayRef}"](${minLat},${minLon},${maxLat},${maxLon});
      );
      (._;>;);
      out geom;
    `;
  } else {
    // If no bbox provided, search in India region
    query = `
      [out:json][timeout:25];
      (
        way["ref"="${highwayRef}"](8.0,68.0,37.0,98.0);  // India bbox
      );
      (._;>;);
      out geom;
    `;
  }
  
  try {
    // Use fetch API (Node.js 18+ has global fetch)
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    });
    
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status} ${response.statusText}`);
    }
    
    const osmData = await response.json();
    console.log(`Fetched ${osmData.elements.length} elements from OSM`);
    
    // Process the OSM data to extract highway features
    const highways = [];
    
    if (osmData.elements && osmData.elements.length > 0) {
      console.log(`${osmData.elements.length} total elements fetched`);
      
      // Count elements by type
      const typeCounts = {};
      for (const element of osmData.elements) {
        typeCounts[element.type] = (typeCounts[element.type] || 0) + 1;
      }
      console.log('Element type counts:', typeCounts);
      
      // Find ways with matching ref
      for (const element of osmData.elements) {
        if (element.type === 'way' && element.tags && element.tags.ref === highwayRef) {
          if (element.geometry && element.geometry.length > 0) {
            // Convert OSM coordinates to GeoJSON format
            const coordinates = element.geometry.map((coord) => [coord.lon, coord.lat]);
            
            highways.push({
              id: element.id.toString(),
              name: element.tags?.name || element.tags?.ref || `Highway ${element.id}`,
              ref: element.tags?.ref || highwayRef,
              geometry: {
                type: 'LineString',
                coordinates: coordinates
              },
              properties: element.tags || {}
            });
            
            console.log(`Highway ${element.id}: ${element.tags?.name || element.tags?.ref || 'Unknown name'}`);
            console.log(`  Coordinates: ${coordinates.length} points`);
            console.log(`  First point: [${coordinates[0][0]}, ${coordinates[0][1]}]`);
            console.log(`  Last point: [${coordinates[coordinates.length-1][0]}, ${coordinates[coordinates.length-1][1]}]`);
          } else {
            console.log(`Found way with ref ${element.tags.ref} but no geometry`);
          }
        }
      }
    }
    
    return highways;
  } catch (error) {
    console.error('Error fetching OSM data:', error);
    throw error;
  }
}

// Main function
async function main() {
  console.log('Testing OSM data fetching...');
  
  // Default test for NH44
  const highwayRef = process.argv[2] || 'NH44';
  const bbox = process.argv[3] || null;
  console.log(`Searching for highway: ${highwayRef}`);
  if (bbox) {
    console.log(`With bounding box: ${bbox}`);
  }
  
  try {
    const highways = await fetchHighwayData(highwayRef, bbox);
    
    if (highways.length > 0) {
      console.log(`\nFound ${highways.length} highways matching ${highwayRef}`);
      
      // Write to a file for further analysis
      await fs.writeFile(`osm_${highwayRef.toLowerCase()}_test.json`, JSON.stringify(highways, null, 2));
      console.log(`Data saved to osm_${highwayRef.toLowerCase()}_test.json`);
      
      // Show first highway coordinates for inspection
      const firstHighway = highways[0];
      console.log(`\nFirst 5 coordinates of the first highway:`);
      firstHighway.geometry.coordinates.slice(0, 5).forEach((coord, index) => {
        console.log(`  ${index}: [${coord[0]}, ${coord[1]}]`);
      });
      
      console.log(`\nLast 5 coordinates of the first highway:`);
      const coords = firstHighway.geometry.coordinates;
      coords.slice(Math.max(coords.length - 5, 0)).forEach((coord, index) => {
        console.log(`  ${coords.length - 5 + index}: [${coord[0]}, ${coord[1]}]`);
      });
    } else {
      console.log(`No highways found for ${highwayRef}`);
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the main function
main();