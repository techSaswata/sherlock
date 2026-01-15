#!/usr/bin/env python
"""
Local development server for the Video Fact-Checker API.
Exposes a /analyze endpoint that runs the CrewAI agents.
"""

import os
import json
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Try to import Supabase (optional for local dev)
try:
    from supabase import create_client, Client
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    if SUPABASE_URL and SUPABASE_KEY:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        HAS_SUPABASE = True
    else:
        HAS_SUPABASE = False
        supabase = None
except ImportError:
    HAS_SUPABASE = False
    supabase = None

from agent.crew import VideoFactCheckerCrew


class AnalyzeRequest(BaseModel):
    url: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Video Fact-Checker API starting...")
    print(f"📊 Supabase integration: {'Enabled' if HAS_SUPABASE else 'Disabled'}")
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="Video Fact-Checker API",
    description="Analyzes videos and blogs for fact-checking",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def process_content(url: str):
    """Process content and optionally save to Supabase."""
    try:
        # Insert initial record if Supabase is available
        if HAS_SUPABASE and supabase:
            try:
                supabase.table("video_analysis").insert({
                    "url": url,
                    "url_status": "processing"
                }).execute()
            except Exception as e:
                print(f"⚠️ Supabase insert error: {e}")

        # Run the crew
        print(f"\n🔍 Starting fact-check analysis for: {url}\n")
        inputs = {"video_url": url}
        result = VideoFactCheckerCrew().crew().kickoff(inputs=inputs)
        
        # Get the result as string
        result_text = str(result)
        
        # Update Supabase with results if available
        if HAS_SUPABASE and supabase:
            try:
                supabase.table("video_analysis").update({
                    "url_status": "completed",
                    "url_content": {
                        "success": True,
                        "message": "Video analysis completed successfully",
                        "result": result_text,
                        "error": None
                    }
                }).eq("url", url).eq("url_status", "processing").execute()
            except Exception as e:
                print(f"⚠️ Supabase update error: {e}")
        
        print(f"\n✅ Analysis complete for: {url}\n")
        return {
            "success": True,
            "message": "Video analysis completed successfully",
            "result": result_text,
            "error": None
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ Error processing {url}: {error_msg}\n")
        
        # Update Supabase with error if available
        if HAS_SUPABASE and supabase:
            try:
                supabase.table("video_analysis").update({
                    "url_status": "error",
                    "url_content": {
                        "success": False,
                        "message": f"Analysis failed: {error_msg}",
                        "result": None,
                        "error": error_msg
                    }
                }).eq("url", url).execute()
            except:
                pass
        
        return {
            "success": False,
            "message": f"Analysis failed: {error_msg}",
            "result": None,
            "error": error_msg
        }


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Video Fact-Checker API is running",
        "endpoints": {
            "/analyze": "POST - Submit URL for analysis",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "supabase": HAS_SUPABASE}


@app.post("/analyze")
async def analyze_url(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Submit a URL for analysis.
    Processing happens in the background.
    """
    print(f"📥 Received analysis request for: {request.url}")
    
    # Add to background tasks
    background_tasks.add_task(process_content, request.url)
    
    return {
        "status": "accepted",
        "message": "Processing started. Results will be available in the database.",
        "url": request.url
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n🌐 Starting server on http://localhost:{port}\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
