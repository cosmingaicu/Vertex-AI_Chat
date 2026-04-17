# Vertex AI Chat Bot

## GCP Authentication
1. Login to Google Cloud: `gcloud auth login`
2. Generate Application: `gcloud auth application-default login`

## Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python3 -m venv venv`
3. Activate the environment: `source venv/bin/activate`
4. Install dependencies: `pip install fastapi uvicorn google-cloud-aiplatform pydantic python-dotenv`
5. Copy `.env.example` into `.env` file in the `backend` folder, and update the Project ID and Location with yours
6. Run the server: `uvicorn main:app --reload`

## Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
