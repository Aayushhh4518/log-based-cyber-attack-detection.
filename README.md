# Log-Based Cyber Attack Detection and Alert System

## Academic Project
This project is an academic cybersecurity project designed to parse server logs and detect potential attacks such as:
1. Brute-force attempts
2. Suspicious/unauthorized privilege escalation
3. Anomalous login times

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Backend**: Python, FastAPI, SQLite

## Folder Structure
- `frontend/`: React + Vite frontend application
- `backend/`: Python + FastAPI backend application
- `sample_logs/`: Directory to store raw log files for testing the detection engine
- `tests/`: Unit and integration tests
- `docs/`: Project documentation and architecture diagrams
- `screenshots/`: Screenshots for academic reports

## Installation and Run Instructions

### Backend
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn main:app --reload`
6. API will be available at `http://localhost:8000`

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. App will be available at `http://localhost:5173`
