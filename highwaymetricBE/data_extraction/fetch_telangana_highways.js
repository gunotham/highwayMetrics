const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuration
const STATE_NAME = "Telangana";
const OUTPUT_FILE = "telanganaHighway.json";
const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Helper function to calculate total length of a LineString geometry
function calculateGeometryLength(coordinates) {
    let totalLength = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const p1 = coordinates[i];
        const p2 = coordinates[i + 1];
        // GeoJSON coordinates are [lon, lat]
        totalLength += calculateDistance(p1[1], p1[0], p2[1], p2[0]);
    }
    return totalLength;
}

// Overpass QL query to get all National Highways in the state
// We use a recursive query to get ways that are part of NH relations
const query = `
[out:json][timeout:180];
area["name"="${STATE_NAME}"]->.searchArea;
(
  relation["network"="IN:NH"](area.searchArea);
  way["network"="IN:NH"](area.searchArea);
  way["highway"~"trunk|primary"]["ref"~"^NH"](area.searchArea);
);
out geom;
`;

console.log(`Fetching National Highways for ${STATE_NAME}...`);
console.log("Querying Overpass API (this may take a minute)...");

const req = https.request(OVERPASS_API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
        process.stdout.write("."); // Progress indicator
    });

    res.on('end', () => {
        console.log("\nData received. Parsing...");
        try {
            const result = JSON.parse(data);

            if (!result.elements) {
                console.error("No elements found in response.");
                return;
            }

            console.log(`Found ${result.elements.length} elements.`);

            const highways = [];
            let skippedCount = 0;
            const processedIds = new Set();

            result.elements.forEach(element => {
                // We are interested in ways that have geometry
                // Relations might come with members, but 'out geom' on relation gives geometry to members usually or we need to parse members.
                // For simplicity in this script, we focus on 'way' elements which contain the geometry directly with 'out geom'.
                // The query returns relations and ways. 'out geom' adds geometry to ways.

                if (element.type === 'way' && element.geometry) {

                    // Deduplication
                    if (processedIds.has(element.id)) return;
                    processedIds.add(element.id);

                    const coordinates = element.geometry.map(p => [p.lon, p.lat]);
                    const length = calculateGeometryLength(coordinates);

                    const highway = {
                        id: element.id,
                        type: element.type,
                        ref: element.tags.ref || "Unknown",
                        name: element.tags.name || "Unknown",
                        geometry: {
                            type: "LineString",
                            coordinates: coordinates
                        },
                        length_km: parseFloat(length.toFixed(3))
                    };
                    highways.push(highway);
                } else {
                    skippedCount++;
                }
            });

            const outputPath = path.join(__dirname, OUTPUT_FILE);
            fs.writeFileSync(outputPath, JSON.stringify(highways, null, 2));
            console.log(`\nSaved ${highways.length} highway segments to ${OUTPUT_FILE} (Skipped ${skippedCount} items without geometry)`);

        } catch (e) {
            console.error("Error parsing JSON response:", e);
            console.error("Raw data start:", data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(`data=${encodeURIComponent(query)}`);
req.end();
