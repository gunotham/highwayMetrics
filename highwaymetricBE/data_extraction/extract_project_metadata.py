import json
import re

def clean_text(text):
    """Removes unwanted characters and extra whitespace."""
    return re.sub(r'\s+', ' ', text).strip()

def extract_data_from_pdfs():
    """
    Manually defined data extracted from the OCR content of the four PDFs,
    focusing on Telangana and Andhra Pradesh.
    """
    all_projects = []

    # Data from: Awarded_not_appointed_nov-2025.pdf
    all_projects.extend([
        {
            "project_name": "Long-term Rectification of MoRTH identified Blackspots on NH-44 in Telangana", "nh_number": "44", "total_length": "3.18", "state": "Telangana", "status": "Awarded But Not Started", "concessionaire": "Sri Balaji Constructions", "loa_date": "03/09/2025"
        },
        {
            "project_name": "Permanent rectification of Accident Spot at Lingampally X Road on NH-65", "nh_number": "65", "total_length": "0.6", "state": "Telangana", "status": "Awarded But Not Started", "concessionaire": "Ibha constructions Pvt. Ltd", "loa_date": "10/01/2025"
        },
        {
            "project_name": "Construction of 6-lane LVUP at Nookalamma Arch junction and other blackspots on NH-16", "nh_number": "16", "total_length": "3.245", "state": "Andhra Pradesh", "status": "Awarded But Not Started", "concessionaire": "Sudharma InfraTech Pvt. Ltd.", "loa_date": "28/03/2025"
        },
        {
            "project_name": "Construction of FOB near Gundugolanu Village at design Km. 1023.520 of Six laning of Gundugolanu – Kalaparru section of NH-16", "nh_number": "16", "total_length": "0.003", "state": "Andhra Pradesh", "status": "Awarded But Not Started", "concessionaire": "Jaabilli Constructions Pvt. Ltd.", "loa_date": "19/02/2025"
        },
        {
            "project_name": "4L of Kadapa – China Orampadu section of NH-716", "nh_number": "716", "total_length": "64.2", "state": "Andhra Pradesh", "status": "Awarded But Not Started", "concessionaire": "Lakshmi Infrastructure & Developers India Pvt. Ltd.", "loa_date": "24/03/2023"
        }
    ])

    # Data from: Balance_for_award_nov-2025.pdf
    all_projects.extend([
        {
            "project_name": "Consultancy Services for DPR of Hyderabad-Vijayawada Section of NH-65", "nh_number": "65", "total_length": "226", "state": "Andhra Pradesh, Telangana", "status": "Balance For Award", "dpr_name": "AICONS Engineering Private Limited", "mode": "Not Applicable"
        },
        {
            "project_name": "Short term Improvement and Routine Maintenance of Ichapuram-Srikakulam-Anandapuram Section of NH-16", "nh_number": "16", "total_length": "212.565", "state": "Andhra Pradesh", "status": "Balance For Award", "dpr_name": None, "mode": "Item Rate"
        },
        {
            "project_name": "Construction of 6 LANE ELEVATED CORRIDOR AND ITS APPROACHES FROM KM. 629+860 TO KM. 634+000 IN RANASTHALAM TOWN PORTION", "nh_number": "16", "total_length": "22.64", "state": "Andhra Pradesh", "status": "Balance For Award", "dpr_name": "CHAITANYA PROJECTS CONSULTANCY PVT LTD", "mode": "EPC"
        }
    ])
    
    # Data from: Completed_PCOD_PCC_Issued-nov-2025.pdf
    all_projects.extend([
        {
            "project_name": "4L of Gundugolanu Devarapalli Kovvuru from km 15.320 to Km 85.204 of NH-16", "nh_number": "16", "total_length": "69.884", "state": "Andhra Pradesh", "status": "Completed", "concessionaire": "G R Infraprojects Limited", "appointed_date": "22/10/2018"
        },
        {
            "project_name": "Bangalore Chennai Expressway (Phase-II Pkg-III) from km.127.000 to Km 156.000", "nh_number": "NE-7", "total_length": "29", "state": "Andhra Pradesh", "status": "Completed", "concessionaire": "BANGARUPALEM GUDIPALA HIGHWAYS LIMITED", "appointed_date": "04/10/2022"
        },
        {
            "project_name": "Ankapalli - Annavaram (Tuni) from km. 741.255 to km. 830.525", "nh_number": "16", "total_length": "89.27", "state": "Andhra Pradesh", "status": "Completed", "concessionaire": "GMR Infrastructure Ltd", "appointed_date": "05/09/2002"
        },
        {
            "project_name": "Hyderabad-Yadagiri", "nh_number": "163", "total_length": "36", "state": "Telangana", "status": "Completed", "concessionaire": "Sadbhav Engineering Pvt. Ltd.", "appointed_date": "30/07/2010"
        }
    ])

    # Data from: Under_implementation_NOV-2025.pdf
    all_projects.extend([
        {
            "project_name": "6L VUP (1X20X5.5) at km.376.400 near Tekriyal and km.388.500 near Pondurthy X Roads", "nh_number": "44", "total_length": "3.55", "state": "Telangana", "status": "Under Implementation", "concessionaire": "Srinivasa Laxmi Construction Co.", "appointed_date": "01/11/2022"
        },
        {
            "project_name": "Construction of 6-lane LVUP at Japthishivnoor Village on NH-44", "nh_number": "44", "total_length": "1", "state": "Telangana", "status": "Under Implementation", "concessionaire": "R.K.Chavan Infrastructure Pvt. Ltd.", "appointed_date": "11/07/2022"
        },
        {
            "project_name": "Bangalore Chennai Expressway (Phase-II Pkg-I) from km.71.000 to Km 96.000", "nh_number": "NE-7", "total_length": "25", "state": "Andhra Pradesh", "status": "Under Implementation", "concessionaire": "Montecarlo Bangalore Chennai expressway P2P1 Private Limited.", "appointed_date": "10/10/2022"
        },
        {
            "project_name": "4L of Pileru to Kalur Section from Km 55.900 to Km 92.800 & Km 94.500 to Km 95.717 of NH-71(Package-II)", "nh_number": "71", "total_length": "38.117", "state": "Andhra Pradesh", "status": "Under Implementation", "concessionaire": "Megha Engineering and Infrastructure Ltd.", "appointed_date": "24/10/2023"
        }
    ])

    # Clean the project names and extract chainage
    for project in all_projects:
        project["project_name"] = clean_text(project["project_name"])
        
        # Extract chainage if available
        # Pattern: from km X to km Y
        chainage_match = re.search(r'from\s+(?:design\s+)?km\.?\s*([\d\+\.]+)\s+to\s+(?:km\.?\s*)?([\d\+\.]+)', project["project_name"], re.IGNORECASE)
        if chainage_match:
            project['start_chainage'] = chainage_match.group(1)
            project['end_chainage'] = chainage_match.group(2)
        else:
            # Pattern: at km X
            at_km_match = re.search(r'at\s+(?:design\s+)?km\.?\s*([\d\+\.]+)', project["project_name"], re.IGNORECASE)
            if at_km_match:
                project['start_chainage'] = at_km_match.group(1)
                project['end_chainage'] = at_km_match.group(1)

    with open('data_extraction/projects_metadata.json', 'w') as f:
        json.dump(all_projects, f, indent=4)

    print(f"Successfully processed and saved {len(all_projects)} projects to data_extraction/projects_metadata.json")

if __name__ == "__main__":
    extract_data_from_pdfs()