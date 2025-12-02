"use client";

import React, { useRef, useEffect, useState } from 'react';
import maplibregl, { GeoJSONSource, Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';

// Define TypeScript interfaces for type safety
interface HighwayGeometry {
  type: string;
  coordinates: number[][];
}

interface HighwayData {
  id: string;
  name: string;
  status: string;
  geom?: HighwayGeometry;
  [key: string]: any; // Allow additional properties
}

interface PaginatedHighwayResponse {
  data: HighwayData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define a fetcher function for SWR to handle paginated response
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MaplibreMap | null>(null);
  const [lng] = useState(78.9629);
  const [lat] = useState(20.5937);
  const [zoom] = useState(4);

  // Fetch highway data using SWR with pagination (get maximum allowed data)
  const { data: paginatedData, error } = useSWR<PaginatedHighwayResponse>('/api/highways?limit=100', fetcher);
  const highways = paginatedData?.data; // Extract the actual highway data from the paginated response

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        // Remove the map instance
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom]);

  // Add highway data to map when it loads and data is fetched
  useEffect(() => {
    if (!map.current || !highways) return;

    const mapInstance = map.current;
    
    // Create a cleanup function to handle layer and source removal
    const cleanup = () => {
      if (mapInstance.getLayer('highways-layer')) {
        mapInstance.removeLayer('highways-layer');
      }
      if (mapInstance.getSource('highways')) {
        mapInstance.removeSource('highways');
      }
    };

    const onLoad = () => {
      // Clean up any existing highway layer/source before adding new ones
      cleanup();

      // Create a GeoJSON feature collection from the highway data
      const features: GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString, { [name: string]: any }>[] = highways
        .filter(highway => {
          // Filter out highways without geometry or invalid geometry
          return highway.geom && 
                 highway.geom.type && 
                 highway.geom.coordinates && 
                 Array.isArray(highway.geom.coordinates) && 
                 highway.geom.coordinates.length > 0;
        })
        .map((highway: HighwayData) => {
          // Validate the geometry type before casting
          if (highway.geom?.type !== 'LineString' && highway.geom?.type !== 'MultiLineString') {
            console.warn(`Invalid geometry type for highway ${highway.id}: ${highway.geom?.type}`);
            // Return a default geometry to prevent errors
            return {
              type: 'Feature' as const,
              geometry: {
                type: 'LineString' as const,
                coordinates: []
              },
              properties: {
                id: highway.id,
                name: highway.name,
                status: highway.status,
              },
            };
          }
          
          return {
            type: 'Feature' as const,
            geometry: highway.geom as GeoJSON.LineString | GeoJSON.MultiLineString, // Cast to proper GeoJSON geometry type
            properties: {
              id: highway.id,
              name: highway.name,
              status: highway.status,
            },
          };
        });

      if (features.length > 0) {
        const geojson: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: features,
        };

        // Add the GeoJSON data as a source
        mapInstance.addSource('highways', {
          type: 'geojson',
          data: geojson,
        });

        // Add a layer to visualize the highways
        mapInstance.addLayer({
          id: 'highways-layer',
          type: 'line',
          source: 'highways',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': [
              'match',
              ['get', 'status'],
              'PLANNING', '#FFA500', // Orange for planning
              'CONSTRUCTION', '#FF0000', // Red for construction
              'COMPLETED', '#008000', // Green for completed
              'MAINTENANCE', '#800080', // Purple for maintenance
              '#000000' // Default black
            ],
            'line-width': 5
          }
        });
      }
    };

    // Clean up before adding new data
    cleanup();

    if (mapInstance.isStyleLoaded()) {
      onLoad();
    } else {
      mapInstance.on('load', onLoad);
    }

    // Clean up event listener on effect cleanup
    return () => {
      if (mapInstance) {
        mapInstance.off('load', onLoad);
      }
    };

  }, [highways]); // Rerun this effect when highways data changes

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {error && <div className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded">Failed to load highways</div>}
      {!highways && !error && <div className="absolute top-2 left-2 bg-blue-500 text-white p-2 rounded">Loading highways...</div>}
      {paginatedData && (
        <div className="absolute bottom-2 left-2 bg-white text-black p-2 rounded shadow-md">
          Showing {highways?.length || 0} of {paginatedData.total} highways
        </div>
      )}
    </div>
  );
}