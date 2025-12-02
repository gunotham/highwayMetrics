import re
import json
import subprocess
import sys
import time
from typing import List, Dict, Tuple, Optional

# Check for required libraries
try:
    from geopy.geocoders import Nominatim
    from geopy.exc import GeocoderTimedOut
    from shapely.geometry import LineString, Point, shape
    from shapely.ops import substring
except ImportError as e:
    print(f"Missing required library: {e}")
    print("Please install them using: pip install geopy shapely")
    sys.exit(1)

# Constants
# Constants
PDF_TEXT_FILE = "Awarded_not_appointed_nov-2025.txt"
STATE_HIGHWAYS_FILE = "state_highways.json"
OUTPUT_FILE = "highway_data.json"

def load_state_highways(file_path: str) -> List[Dict]:
    """
    Loads the pre-fetched state highway data.
    """
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {file_path} not found. Please run fetch_state_highways.js first.")
        sys.exit(1)

def parse_pdf_text(file_path: str) -> List[Dict]:
    """
    Parses the text file extracted from the PDF to find project details.
    """
    projects = []
    current_project = {}
    
    # Regex patterns
    sr_no_pattern = re.compile(r'^\s*(\d+)\s+(.*)')
    
    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    buffer_text = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Skip headers/footers
        if "Awarded But not Start" in line or "Status as on" in line or "Page" in line:
            continue
            
        match = sr_no_pattern.match(line)
        if match:
            if current_project:
                current_project['raw_text'] = buffer_text
                projects.append(current_project)
                current_project = {}
                buffer_text = ""
            
            current_project['sr_no'] = match.group(1)
            buffer_text += match.group(2) + " "
        else:
            buffer_text += line + " "
            
    if current_project:
        current_project['raw_text'] = buffer_text
        projects.append(current_project)
        
    return projects

def extract_project_details(projects: List[Dict]) -> List[Dict]:
    """
    Refines the raw text to extract NH number, State, and Description.
    """
    cleaned_projects = []
    
    for p in projects:
        text = p['raw_text']
        
        # Extract NH Number (Heuristic: "NH-XX" or "NH XX")
        nh_match = re.search(r'NH[-\s]?(\d+[A-Z]?)', text, re.IGNORECASE)
        nh_number = nh_match.group(1) if nh_match else None
        
        # Extract State
        states = ["Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
                  "Kerala", "Madhya Pradesh", "Maharashtra", "Meghalaya", "Odisha", "Punjab", "Rajasthan", 
                  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"]
        
        found_state = "Unknown"
        for state in states:
            if state in text:
                found_state = state
                break
                
        # Extract potential start/end points
        start_loc = None
        end_loc = None
        
        from_to_match = re.search(r'from\s+([A-Z][a-zA-Z\s]+?)\s+to\s+([A-Z][a-zA-Z\s]+)', text)
        if from_to_match:
            start_loc = from_to_match.group(1).strip()
            end_loc = from_to_match.group(2).strip()
        else:
            dash_match = re.search(r'([A-Z][a-zA-Z\s]+)\s?-\s?([A-Z][a-zA-Z\s]+)\s+section', text)
            if dash_match:
                start_loc = dash_match.group(1).strip()
                end_loc = dash_match.group(2).strip()

        # Extract Total Length (looking for number followed by km)
        length_match = re.search(r'(\d+\.?\d*)\s*km', text, re.IGNORECASE)
        total_length = length_match.group(1) if length_match else None

        cleaned_projects.append({
            "sr_no": p['sr_no'],
            "nh_number": f"NH {nh_number}" if nh_number else "Unknown",
            "state": found_state,
            "project_name": text[:100] + "..." if len(text) > 100 else text, # Use first 100 chars as name
            "description": text,
            "start_location": start_loc,
            "end_location": end_loc,
            "total_length": total_length,
            "status": "AWARDED", # Default status based on file
            "concessionaire": "Unknown" # Placeholder
        })
        
    return cleaned_projects

def get_coordinates(place_name: str) -> Optional[Tuple[float, float]]:
    """
    Geocodes a place name to (lat, lon).
    """
    if not place_name:
        return None
        
    geolocator = Nominatim(user_agent="highway_metric_explorer")
    try:
        location = geolocator.geocode(f"{place_name}, India", timeout=10)
        if location:
            return (location.latitude, location.longitude)
    except Exception as e:
        print(f"Geocoding error for {place_name}: {e}")
        
    return None

def find_matching_highway_segments(state_highways: List[Dict], nh_ref: str) -> List[Dict]:
    """
    Finds all segments in the state highway data that match the NH number.
    """
    matches = []
    target_ref = nh_ref.replace(" ", "").lower() # e.g. "nh16"
    
    for hw in state_highways:
        hw_ref = hw.get('ref', '').replace(" ", "").lower()
        if target_ref in hw_ref or hw_ref in target_ref:
             matches.append(hw['geometry'])
             
    return matches

def find_best_segment(geometries: List[Dict], start_coords: Tuple[float, float], end_coords: Tuple[float, float]) -> Optional[Dict]:
    """
    Finds the geometry segment that is closest to the start and end coordinates.
    """
    if not geometries:
        return None
        
    best_geom = None
    min_score = float('inf')
    
    p1 = Point(start_coords[1], start_coords[0])
    p2 = Point(end_coords[1], end_coords[0])
    
    for geom in geometries:
        if geom['type'] != 'LineString':
            continue
            
        line = LineString(geom['coordinates'])
        
        dist1 = line.distance(p1)
        dist2 = line.distance(p2)
        
        score = dist1 + dist2
        
        if score < min_score:
            min_score = score
            best_geom = geom
            
    return best_geom

def slice_geometry(geometry_json: Dict, start_coords: Tuple[float, float], end_coords: Tuple[float, float]) -> Optional[Dict]:
    """
    Slices a GeoJSON LineString between two coordinate points.
    """
    if not geometry_json or geometry_json['type'] != 'LineString':
        return None
        
    line = LineString(geometry_json['coordinates'])
    
    p1 = Point(start_coords[1], start_coords[0])
    p2 = Point(end_coords[1], end_coords[0])
    
    dist1 = line.project(p1)
    dist2 = line.project(p2)
    
    if dist1 > dist2:
        dist1, dist2 = dist2, dist1
        
    sliced_line = substring(line, dist1, dist2)
    
    return {
        "type": "LineString",
        "coordinates": list(sliced_line.coords)
    }

def main():
    print("Step 1: Loading State Highways...")
    state_highways = load_state_highways(STATE_HIGHWAYS_FILE)
    print(f"Loaded {len(state_highways)} highway segments.")

    print("Step 2: Parsing PDF text...")
    raw_projects = parse_pdf_text(PDF_TEXT_FILE)
    projects = extract_project_details(raw_projects)
    print(f"Found {len(projects)} projects.")
    
    final_data = []
    
    # Limit to first 5 for testing
    for proj in projects[:5]: 
        print(f"\nProcessing Project {proj['sr_no']}: {proj['nh_number']}")
        print(f"  Route: {proj['start_location']} -> {proj['end_location']}")
        
        start_coords = get_coordinates(proj['start_location'])
        end_coords = get_coordinates(proj['end_location'])
        
        if start_coords and end_coords:
            print(f"  Coords: {start_coords} -> {end_coords}")
            
            # Find matching segments in loaded data
            matching_geoms = find_matching_highway_segments(state_highways, proj['nh_number'])
            print(f"  Found {len(matching_geoms)} matching segments in state data.")
            
            best_geom = find_best_segment(matching_geoms, start_coords, end_coords)
            
            if best_geom:
                print("  Slicing best geometry...")
                sliced_geom = slice_geometry(best_geom, start_coords, end_coords)
                proj['geometry'] = sliced_geom
            else:
                print("  No suitable geometry found in state data.")
        else:
            print("  Could not geocode start/end locations.")
            
        final_data.append(proj)
        time.sleep(1) # Be nice to Nominatim
        
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(final_data, f, indent=4)
    print(f"\nSaved processed data to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
