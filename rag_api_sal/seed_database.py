import os
import requests

# Configuration
API_URL = "http://127.0.0.1:8000/ingest"
DATA_FOLDER = "clinical_data"
DATASET_ID = "clinical-manuals-v1" # The universal tag we will use to retrieve these manuals

def seed_database():
    # Check if folder exists
    if not os.path.exists(DATA_FOLDER):
        print(f"❌ Error: Folder '{DATA_FOLDER}' not found. Please create it and add your PDFs.")
        return

    # Get all files in the folder
    files_to_upload = [f for f in os.listdir(DATA_FOLDER) if os.path.isfile(os.path.join(DATA_FOLDER, f))]
    
    if not files_to_upload:
        print(f"⚠️ Warning: No files found in '{DATA_FOLDER}'.")
        return

    print(f"🚀 Starting ingestion of {len(files_to_upload)} files into dataset: {DATASET_ID}...\n")

    for filename in files_to_upload:
        filepath = os.path.join(DATA_FOLDER, filename)
        print(f"📄 Uploading: {filename}...")
        
        # Open the file in binary mode and prepare the multipart/form-data payload
        with open(filepath, 'rb') as f:
            files = {'files': (filename, f, 'application/octet-stream')}
            data = {'datasetId': DATASET_ID}
            
            try:
                response = requests.post(API_URL, files=files, data=data)
                
                if response.status_code == 200:
                    print(f"✅ Success: {filename} ingested perfectly.")
                else:
                    print(f"❌ Failed to ingest {filename}. Status Code: {response.status_code}")
                    print(f"Details: {response.text}")
            except requests.exceptions.ConnectionError:
                print("❌ CRITICAL ERROR: Could not connect to the RAG API. Is uvicorn running on port 8000?")
                return

    print("\n🎉 All clinical data has been seeded into the RAG database!")

if __name__ == "__main__":
    seed_database()
