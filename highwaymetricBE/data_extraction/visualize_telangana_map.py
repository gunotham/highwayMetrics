import json

# Read the data
input_file = 'data_extraction/telanganaHighway.json'
output_file = 'data_extraction/visualize_telangana_highways.html'

try:
    with open(input_file, 'r') as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"Error: {input_file} not found.")
    data = []

# HTML Template
html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Telangana Highway Visualization</title>
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
        var map = L.map('map').setView([17.1232, 79.2088], 7); // Centered on Telangana
        L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
            attribution: '© OpenStreetMap contributors'
        }}).addTo(map);

        var highwayData = {json.dumps(data)};

        var bounds = L.latLngBounds();
        
        highwayData.forEach(function(segment, index) {{
            if (segment.geometry && segment.geometry.coordinates) {{
                var latlngs = segment.geometry.coordinates.map(function(coord) {{
                    return [coord[1], coord[0]];
                }});
                
                var color = '#E0DFDF'; // Light gray for all highways
                
                var polyline = L.polyline(latlngs, {{color: color, weight: 4, opacity: 0.8}}).addTo(map);
                
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
