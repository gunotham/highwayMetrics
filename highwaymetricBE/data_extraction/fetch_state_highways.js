const fs = require('fs');
const https = require('https');

const STATE_NAME = "Andhra Pradesh";
const OUTPUT_FILE = "state_highways.json";

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

const options = {
    hostname: 'overpass-api.de',
    path: '/api/interpreter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
        process.stdout.write('.'); // Progress indicator
    });

    res.on('end', () => {
        console.log('\nData received. Parsing...');
        try {
            const osmData = JSON.parse(data);

            if (!osmData.elements) {
                console.error("No elements found in response.");
                return;
            }

            console.log(`Found ${osmData.elements.length} elements.`);

            const highways = [];
            let skippedCount = 0;

            osmData.elements.forEach(element => {
                // Extract relevant data
                let ref = element.tags ? element.tags.ref : "Unknown";
                let name = element.tags ? element.tags.name : "Unknown";

                // If no ref, try to find it in relation tags if possible, or skip
                if (ref === "Unknown" && element.tags && element.tags.network === "IN:NH") {
                    // Sometimes ref is missing but it's an NH
                }

                const highway = {
                    id: element.id,
                    type: element.type,
                    ref: ref,
                    name: name,
                    geometry: null,
                    length_km: 0.0
                };

                // Handle Geometry
                if (element.geometry) {
                    const coords = element.geometry.map(pt => [pt.lon, pt.lat]);
                    highway.geometry = {
                        type: "LineString",
                        coordinates: coords
                    };
                    highway.length_km = calculateLength(coords);
                    highways.push(highway);
                } else if (element.members) {
                    // For relations without direct geometry (shouldn't happen with 'out geom' for ways, but for relations it might)
                    // If it's a relation, 'out geom' gives geometry for the relation object itself in some modes, 
                    // but often we need to stitch members. 
                    // However, our query asks for ways AND relations. 
                    // If we get a relation, we might not get a single geometry line.
                    // We will skip relations that don't have a simple geometry representation for now,
                    // relying on the fact that we also fetched the constituent ways.
                    skippedCount++;
                } else {
                    skippedCount++;
                }
            });

            // Deduplicate by ID
            const uniqueHighways = Array.from(new Map(highways.map(item => [item.id, item])).values());

            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueHighways, null, 2));
            console.log(`\nSaved ${uniqueHighways.length} highway segments to ${OUTPUT_FILE} (Skipped ${skippedCount} items without geometry)`);

        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw data:", data.substring(0, 500));
        }
    });
});

// Haversine formula to calculate distance between two points [lon, lat]
function calculateLength(coords) {
    let totalLength = 0;
    const R = 6371; // Radius of the earth in km

    for (let i = 0; i < coords.length - 1; i++) {
        const [lon1, lat1] = coords[i];
        const [lon2, lat2] = coords[i + 1];

        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        totalLength += d;
    }
    return parseFloat(totalLength.toFixed(3));
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(`data=${encodeURIComponent(query)}`);
req.end();
