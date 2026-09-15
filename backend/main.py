from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Log-Based Cyber Attack Detection API",
    description="Backend API for the Log-Based Cyber Attack Detection and Alert System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, we allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Log-Based Cyber Attack Detection API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Log Detection Engine"}
