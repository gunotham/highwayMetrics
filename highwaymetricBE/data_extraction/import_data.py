import json
import requests
import time

def import_data():
    """
    Reads the processed project data from the JSON file and sends it to the 
    Spring Boot application's project endpoint one by one.
    """
    api_url = "http://localhost:8080/api/projects"
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
    
    success_count = 0
    for project in projects:
        try:
            # Map Python keys to Java Entity keys if necessary.
            # Based on extract_project_metadata.py, keys are snake_case (e.g. project_name)
            # Based on Project.java, keys are camelCase (e.g. projectName)
            # We need to convert snake_case to camelCase for the API to accept it automatically 
            # OR ensure the API handles snake_case (usually requires @JsonProperty or config).
            # Let's assume standard Spring Boot default which is camelCase.
            
            payload = {
                "projectName": project.get("project_name"),
                "nhNumber": project.get("nh_number"),
                "totalLength": float(project.get("total_length")) if project.get("total_length") else None,
                "state": project.get("state"),
                "status": project.get("status").upper().replace(" ", "_") if project.get("status") else None, # Enum matching
                "concessionaire": project.get("concessionaire") or project.get("dpr_name"),
                # Date handling: API expects "yyyy-MM-dd" usually for LocalDate. 
                # Source data has "dd/MM/yyyy".
            }
            
            # Handle date conversion
            loa_date_str = project.get("loa_date") or project.get("appointed_date")
            if loa_date_str:
                try:
                    parts = loa_date_str.split('/')
                    if len(parts) == 3:
                        payload["loaDate"] = f"{parts[2]}-{parts[1]}-{parts[0]}"
                except Exception:
                     pass # Leave as None if parsing fails

            response = requests.post(api_url, headers=headers, json=payload)
            
            if response.status_code in [200, 201]:
                success_count += 1
                print(f"Imported: {payload['projectName']}")
            else:
                print(f"Failed to import {payload['projectName']}: {response.status_code} - {response.text}")

        except requests.exceptions.RequestException as e:
            print(f"An error occurred while sending data to the API: {e}")
            
    print(f"Import process completed. {success_count}/{len(projects)} projects imported.")

if __name__ == "__main__":
    # Wait a few seconds for the Spring Boot app to be fully ready
    print("Waiting for the application to start (5s)...")
    time.sleep(5) 
    import_data()