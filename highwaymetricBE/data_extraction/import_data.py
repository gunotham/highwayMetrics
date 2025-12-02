import json
import requests
import time

def import_data():
    """
    Reads the processed project data from the JSON file and sends it to the 
    Spring Boot application's bulk import endpoint.
    """
    api_url = "http://localhost:8080/api/import/bulk"
    json_file = "data_extraction/projects_metadata.json"

    try:
        with open(json_file, 'r') as f:
            projects = json.load(f)
    except FileNotFoundError:
        print(f"Error: {json_file} not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {json_file}.")
        return

    print(f"Found {len(projects)} projects to import.")

    headers = {'Content-Type': 'application/json'}
    
    try:
        # The endpoint is expecting a list of projects
        response = requests.post(api_url, headers=headers, data=json.dumps(projects))
        
        # Check the response
        if response.status_code == 200:
            print("Bulk import successful!")
            print("Response:", response.json().get('message'))
        else:
            print(f"Bulk import failed with status code: {response.status_code}")
            try:
                print("Error response:", response.json())
            except json.JSONDecodeError:
                print("Error response could not be decoded as JSON:", response.text)

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while sending data to the API: {e}")

if __name__ == "__main__":
    # Wait a few seconds for the Spring Boot app to be fully ready
    print("Waiting for the application to start...")
    time.sleep(15) 
    import_data()
