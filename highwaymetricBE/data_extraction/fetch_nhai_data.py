import requests
import json

def fetch_highway_data():
    """
    Fetches highway project data from the NHAI API.
    """
    url = "https://datalakeg.nhai.gov.in/nhai/mISC/OOM/Get_Adv_UPC_Wise_Alignments_WFS"
    payload = {
        "St_Code": "0",
        "St_Name": "ALL",
        "D_Code": "0",
        "D_Name": "ALL",
        "PIA_Code": "0",
        "PIA_Name": "ALL",
        "RO_Code": "0",
        "RO_Name": "ALL",
        "Prj_Code": "0",
        "Prj_Name": "ALL",
        "PKG_Code": "0",
        "PKG_Name": "ALL",
        "Cont_Code": "0",
        "Cont_Name": "ALL",
        "Consult_Code": "0",
        "Consult_Name": "ALL"
    }
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, verify=False) # Using verify=False to bypass SSL issues if any
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        
        try:
            data = response.json()
        except json.JSONDecodeError:
            print("Failed to decode JSON. Response content:")
            print(response.text)
            return None

        # The actual data is a JSON string within the 'd' key
        if 'd' in data:
            project_data = json.loads(data['d'])
            
            # Save the raw data to a file
            with open('data_extraction/nhai_projects_raw.json', 'w') as f:
                json.dump(project_data, f, indent=4)
            print(f"Successfully fetched and saved {len(project_data)} projects to nhai_projects_raw.json")
            
            return project_data
        else:
            print("Error: 'd' key not found in the response.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

if __name__ == "__main__":
    fetch_highway_data()
