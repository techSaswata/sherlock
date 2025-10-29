# WebSocket Backend Implementation Guide

This guide explains how to implement the backend WebSocket server for real-time URL processing.

## Configuration

1. Copy `.env.local.example` to `.env.local`
2. Update `NEXT_PUBLIC_WS_URL` with your backend WebSocket URL

## WebSocket Message Protocol

### Client → Server

When the user submits a URL, the frontend sends:

```json
{
  "type": "process_url",
  "url": "https://instagram.com/reel/example",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Server → Client

Your backend should send messages in the following format:

**Note:** Content type and progress percentages are automatically handled by the frontend, so you don't need to send `content_type_detected` or `progress` messages.

#### 1. Step Start
```json
{
  "type": "step_start",
  "step_index": 0,
  "message": "Parsing URL"
}
```

#### 3. Step Complete
```json
{
  "type": "step_complete",
  "step_index": 0,
  "message": "URL parsed successfully"
}
```

#### 3. Log Message
```json
{
  "type": "log",
  "message": "Downloaded video file",
  "log_type": "info"
}
```
Types: `"info"`, `"success"`, `"warning"`

#### 4. Processing Complete
```json
{
  "type": "processing_complete",
  "message": "All processing complete",
  "report": {
    "summary": "...",
    "authenticity_score": 0.85
  }
}
```

#### 5. Error
```json
{
  "type": "error",
  "message": "Failed to download video"
}
```

## Example Backend Implementation (Python FastAPI)

```python
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        # Receive URL from client
        data = await websocket.receive_text()
        request = json.loads(data)
        url = request.get("url")
        
        # Note: Content type is detected in frontend
        # Start processing directly
        await websocket.send_json({
            "type": "step_start",
            "step_index": 0,
            "message": "Parsing URL"
        })
        
        # Simulate processing
        await asyncio.sleep(1)
        
        await websocket.send_json({
            "type": "step_complete",
            "step_index": 0,
            "message": "Parsing complete"
        })
        
        # Step 3: Download
        await websocket.send_json({
            "type": "step_start",
            "step_index": 2,
            "message": "Downloading content"
        })
        
        await websocket.send_json({
            "type": "log",
            "message": "📥 Downloading video...",
            "log_type": "info"
        })
        
        await asyncio.sleep(2)
        
        await websocket.send_json({
            "type": "step_complete",
            "step_index": 2,
            "message": "Download complete"
        })
        
        # Step 4: Scanning (progress handled by frontend)
        await websocket.send_json({
            "type": "step_start",
            "step_index": 5,
            "message": "Scanning frames"
        })
        
        # Simulate processing time
        await asyncio.sleep(3)
        
        # Complete
        await websocket.send_json({
            "type": "processing_complete",
            "message": "Processing complete",
            "report": {
                "summary": "Analysis complete",
                "authenticity_score": 0.85
            }
        })
        
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Running the Backend

1. Install dependencies:
```bash
pip install fastapi uvicorn websockets
```

2. Run the server:
```bash
python backend.py
```

3. Update `.env.local` with:
```
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## Processing Steps Order

The frontend expects steps in this order (adjust `step_index` accordingly):

**For Videos (Instagram Reels, YouTube):**
0. Parsing URL
1. Identified content type
2. Downloading video
3. Splitting into frames
4. Running OCR
5. Scanning frames (with progress updates)
6. Analyzing captions
7. Splitting audio
8. Parsing through STT
9. Concising into report

**For Images (Instagram Posts):**
0. Parsing URL
1. Identified content type
2. Downloading pic
3. Running OCR
4. Analyzing captions
5. Concising into report

**For Websites:**
0. Parsing URL
1. Identified content type
2. Crawling through site
3. Analyzing texts
4. Checking for images
5. Concising into report

## Notes

- The frontend automatically falls back to simulation mode if WebSocket connection fails
- Always send logs to keep the user informed of progress
- Use appropriate log types: `info`, `success`, `warning`
- Close the WebSocket connection after sending `processing_complete` or `error`

