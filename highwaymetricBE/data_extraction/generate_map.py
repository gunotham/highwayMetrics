import json

# Read the data
with open('highway_data.json', 'r') as f:
    data = json.load(f)

# HTML Template
html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Highway Visualization</title>
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
        var map = L.map('map').setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
            attribution: '© OpenStreetMap contributors'
        }}).addTo(map);

        var highwayData = {json.dumps(data)};

        var bounds = L.latLngBounds();
        var colors = ['#FF0000', '#0000FF', '#008000', '#800080', '#FFA500'];

        highwayData.forEach(function(project, index) {{
            if (project.geometry && project.geometry.coordinates) {{
                var latlngs = project.geometry.coordinates.map(function(coord) {{
                    return [coord[1], coord[0]];
                }});
                
                var color = colors[index % colors.length];
                
                var polyline = L.polyline(latlngs, {{color: color, weight: 5, opacity: 0.7}}).addTo(map);
                
                var popupContent = "<b>" + project.nh_number + "</b><br>" + 
                                 "<b>Project:</b> " + project.project_name + "<br>" +
                                 "<b>Route:</b> " + project.start_location + " -> " + project.end_location + "<br>" +
                                 "<b>Length:</b> " + (project.total_length ? project.total_length + " km" : "N/A") + "<br>" +
                                 "<b>State:</b> " + project.state;
                                 
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

with open('data_extraction/visualize_highways.html', 'w') as f:
    f.write(html_content)

print("Generated data_extraction/visualize_highways.html")
