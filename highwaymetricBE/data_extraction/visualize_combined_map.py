import json
import os

# Read the data
ap_file = 'state_highways.json'
ts_file = 'data_extraction/telanganaHighway.json'
output_file = 'data_extraction/visualize_combined_highways.html'

combined_data = []

# Load AP Data
try:
    with open(ap_file, 'r') as f:
        ap_data = json.load(f)
        print(f"Loaded {len(ap_data)} segments from AP.")
        combined_data.extend(ap_data)
except FileNotFoundError:
    print(f"Error: {ap_file} not found.")

# Load TS Data
try:
    with open(ts_file, 'r') as f:
        ts_data = json.load(f)
        print(f"Loaded {len(ts_data)} segments from TS.")
        combined_data.extend(ts_data)
except FileNotFoundError:
    print(f"Error: {ts_file} not found.")

print(f"Total segments to visualize: {len(combined_data)}")

# HTML Template
html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Combined Highway Visualization (AP & TS)</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        #map {{ height: 100vh; width: 100%; }}
        .info {{ padding: 6px 8px; font: 14px/16px Arial, Helvetica, sans-serif; background: white; background: rgba(255,255,255,0.8); box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px; }}
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Centered roughly between AP and TS
        var map = L.map('map').setView([16.5, 79.5], 7); 
        L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
            attribution: '© OpenStreetMap contributors'
        }}).addTo(map);

        var highwayData = {json.dumps(combined_data)};

        var bounds = L.latLngBounds();
        
        highwayData.forEach(function(segment, index) {{
            if (segment.geometry && segment.geometry.coordinates) {{
                var latlngs = segment.geometry.coordinates.map(function(coord) {{
                    return [coord[1], coord[0]];
                }});
                
                var color = '#000000'; // Black for all highways
                
                var polyline = L.polyline(latlngs, {{color: color, weight: 3, opacity: 0.8}}).addTo(map);
                
                var popupContent = "<b>" + (segment.ref || "Unknown") + "</b><br>" + 
                                 "<b>Name:</b> " + (segment.name || "Unknown") + "<br>" +
                                 "<b>Length:</b> " + (segment.length_km || "N/A") + " km<br>" +
                                 "<b>ID:</b> " + segment.id;
                                 
                polyline.bindPopup(popupContent);
                bounds.extend(polyline.getBounds());
            }}
        }});

        if (bounds.isValid()) {{
            map.fitBounds(bounds);
        }}
    </script>
</body>
</html>"""

with open(output_file, 'w') as f:
    f.write(html_content)

print(f"Generated {output_file}")
