# Backend Architecture & Implementation Guide

## System Overview

The backend is an intelligent content analysis system that processes URLs from various sources (YouTube, Instagram, blogs) and returns comprehensive fact-check reports with confidence scores and evidence-based conclusions.

## Architecture Flow

```
URL Input → Fetch Source → Extract Content → AI Agent Analysis → Fact-Check Report
                ↓              ↓                    ↓
          Service Scrapers  Processing Tools   Vector DB Cache
```

## Core Components

### 1. **Service Scrapers**
Fetches content from multiple platforms:
- **YouTube**: Download videos, extract metadata
- **Instagram**: Download reels/posts, captions
- **Blog Websites**: Crawl and extract text content

### 2. **Content Type Detection**
Automatically identifies:
- Video content (reels, YouTube shorts)
- Image content (Instagram posts)
- Text content (blogs, articles)

### 3. **Data Extraction Pipeline**

#### Video Processing
- **FFmpeg**: Video splitting, frame extraction
- **Faster Whisper**: Audio transcription (speech-to-text)
- **Tesseract OCR**: Text extraction from frames
- **BLIP-2 Model**: Image captioning and understanding

#### Image Processing
- **Tesseract OCR**: Text recognition
- **BLIP-2 Model**: Scene understanding and caption analysis

#### Text Processing
- **Web Crawling**: Extract article content
- **Language Detection**: Identify language
- **Translation**: Convert to English for analysis

### 4. **Vector Database**
Caches processed content for efficiency:
- **Store**: URLs, extracted text, metadata
- **Purpose**: Semantic search, avoiding reprocessing
- **Benefits**: Faster responses, cost reduction

### 5. **Agentic Workflow**
AI agent orchestrates the analysis:
- **Deep Research**: Cross-reference claims with trusted sources
- **Semantic Search**: Find similar cached content
- **Decision Making**: Evaluate authenticity and verify facts
- **Report Generation**: Compile findings into structured reports

### 6. **Language Processing**
Handles multilingual content:
- **Detection**: Identify content language
- **Translation**: Convert to English for analysis
- **Preservation**: Maintain original context

## API Specification

### Endpoint
```
POST https://crew-backend-dxlx.onrender.com/analyze
```

The frontend is pre-configured with this production endpoint.

### Request
```json
{
  "url": "https://www.youtube.com/shorts/xXHUVzYww-E"
}
```

### Response
```json
{
  "success": true,
  "message": "Video analysis completed successfully",
  "result": "# Fact-Check Report\n...",
  "error": null
}
```

### Report Structure (Markdown Format)

```markdown
# Fact-Check Report
**Content URL:** [URL]
**Content Type:** Video/Image/Text
**Analysis Date:** YYYY-MM-DD

## 1. EXPLANATION
[Summary of content and key findings]

## 2. EVIDENCE
### Claim 1: [Claim statement]
**Status:** TRUE/FALSE/UNVERIFIED
**Key Evidence:** [Supporting evidence]
**Sources:** [List of sources with URLs]

## 3. FINAL VERDICT
[Overall conclusion about content authenticity]

## 4. CONFIDENCE SCORE
[Percentage: 0-100%]
```

## Implementation Guide

### Tech Stack Recommendations

**Framework Options:**
- FastAPI (Python) - Recommended for ML integration
- Express.js (Node.js) - Good for lightweight APIs
- Flask (Python) - Simple alternative

**Processing Tools:**
- FFmpeg - Video/audio processing
- Faster Whisper - Speech-to-text
- Tesseract OCR - Text extraction
- BLIP-2/CLIP - Image understanding
- LangChain/CrewAI - Agent orchestration

**Vector Database:**
- Pinecone - Managed service
- Weaviate - Open source
- Chroma - Lightweight option
- Qdrant - High performance

**Language Models:**
- OpenAI GPT-4 - Advanced reasoning
- Claude - Strong analysis capabilities
- Llama 2/3 - Open source option
- Mistral - Cost-effective alternative

### Example Implementation (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

app = FastAPI(title="Content Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    url: str

class AnalyzeResponse(BaseModel):
    success: bool
    message: str
    result: str | None = None
    error: str | None = None

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_content(request: AnalyzeRequest):
    """
    Analyze content from URL and return fact-check report
    """
    try:
        # Step 1: Detect content type
        content_type = await detect_content_type(request.url)
        
        # Step 2: Fetch and extract content
        if content_type == "video":
            content = await process_video(request.url)
        elif content_type == "image":
            content = await process_image(request.url)
        else:
            content = await process_text(request.url)
        
        # Step 3: Check vector DB cache
        cached = await check_vector_db(request.url)
        if cached:
            return AnalyzeResponse(
                success=True,
                message="Analysis retrieved from cache",
                result=cached["report"]
            )
        
        # Step 4: Run AI agent analysis
        report = await run_agent_analysis(content)
        
        # Step 5: Store in vector DB
        await store_in_vector_db(request.url, content, report)
        
        # Step 6: Return formatted report
        return AnalyzeResponse(
            success=True,
            message="Analysis completed successfully",
            result=report
        )
        
    except Exception as e:
        return AnalyzeResponse(
            success=False,
            message="Analysis failed",
            error=str(e)
        )

async def detect_content_type(url: str) -> str:
    """Detect if URL is video, image, or text content"""
    if "youtube.com" in url or "youtu.be" in url:
        return "video"
    elif "instagram.com/reel" in url:
        return "video"
    elif "instagram.com/p" in url:
        return "image"
    else:
        return "text"

async def process_video(url: str) -> dict:
    """
    Process video content:
    1. Download video using yt-dlp or instaloader
    2. Extract frames with FFmpeg
    3. Run OCR on frames with Tesseract
    4. Extract audio and transcribe with Faster Whisper
    5. Analyze captions and metadata
    """
    # Implementation here
    pass

async def process_image(url: str) -> dict:
    """
    Process image content:
    1. Download image
    2. Run OCR with Tesseract
    3. Run BLIP-2 for image understanding
    4. Extract captions and metadata
    """
    # Implementation here
    pass

async def process_text(url: str) -> dict:
    """
    Process text content:
    1. Crawl website
    2. Extract main content
    3. Detect language
    4. Translate if needed
    """
    # Implementation here
    pass

async def check_vector_db(url: str) -> dict | None:
    """Check if URL has been processed before"""
    # Query vector database
    pass

async def run_agent_analysis(content: dict) -> str:
    """
    Run AI agent workflow:
    1. Analyze content for claims
    2. Search for supporting/contradicting evidence
    3. Cross-reference with trusted sources
    4. Evaluate authenticity
    5. Generate structured report
    """
    # Agent orchestration logic
    pass

async def store_in_vector_db(url: str, content: dict, report: str):
    """Store processed content for future queries"""
    # Store in vector database
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Agentic Workflow Design

### Agent Tools

**1. Source Finder (Crawler)**
- Fetch content from URLs
- Handle rate limiting and authentication
- Extract structured data

**2. Content Analyzer**
- Identify content type
- Extract relevant information
- Detect language and translate

**3. Data Extractor**
- Use ML models (BLIP-2, Whisper, Tesseract)
- Process multimedia content
- Structure extracted data

**4. Research Agent**
- Perform deep web searches
- Cross-reference claims
- Gather supporting evidence

**5. Decision Maker**
- Evaluate claim authenticity
- Calculate confidence scores
- Generate final verdict

### Workflow Example (LangChain)

```python
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from langchain.chains import LLMChain

# Define tools
tools = [
    Tool(
        name="Fetch Content",
        func=fetch_content,
        description="Fetch content from URL"
    ),
    Tool(
        name="Extract Data",
        func=extract_data,
        description="Extract text, audio, images from content"
    ),
    Tool(
        name="Search Evidence",
        func=search_evidence,
        description="Search for supporting evidence"
    ),
    Tool(
        name="Verify Claim",
        func=verify_claim,
        description="Verify specific claims against sources"
    )
]

# Initialize agent
llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools, 
    llm, 
    agent="zero-shot-react-description",
    verbose=True
)

# Run analysis
result = agent.run(f"Analyze this URL and verify claims: {url}")
```

## Performance Optimization

### Caching Strategy
1. **Vector DB**: Store processed URLs and results
2. **Redis**: Cache API responses (short-term)
3. **CDN**: Cache media files

### Parallel Processing
- Process multiple frames simultaneously
- Batch API calls to ML models
- Async operations for I/O tasks

### Cost Optimization
- Cache embeddings and results
- Use smaller models for initial classification
- Rate limit expensive API calls

## Deployment

### Docker Setup
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
```bash
# API Keys
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key

# Vector DB
PINECONE_API_KEY=your_key
PINECONE_ENV=your_env

# Services
YOUTUBE_API_KEY=your_key

# Configuration
PORT=8000
WORKERS=4
```

## Security Considerations

1. **Rate Limiting**: Prevent abuse
2. **Input Validation**: Sanitize URLs
3. **API Keys**: Secure credential storage
4. **CORS**: Restrict origins
5. **Content Filtering**: Handle NSFW/illegal content

## Monitoring & Logging

```python
import logging
from prometheus_client import Counter, Histogram

# Metrics
analysis_requests = Counter('analysis_requests_total', 'Total analysis requests')
analysis_duration = Histogram('analysis_duration_seconds', 'Analysis duration')

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

## Testing

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_analyze_youtube():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/analyze",
            json={"url": "https://youtube.com/watch?v=example"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "result" in data
```

## Resources

**Documentation:**
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Faster Whisper](https://github.com/guillaumekln/faster-whisper)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [LangChain](https://docs.langchain.com/)
- [CrewAI](https://docs.crewai.com/)

**Tutorials:**
- Building AI agents with LangChain
- Video processing with FFmpeg
- Vector database integration
- FastAPI production deployment

## Next Steps

1. **Implement core scrapers** for YouTube, Instagram, websites
2. **Set up vector database** for caching
3. **Integrate ML models** for content extraction
4. **Build agent workflow** with LangChain/CrewAI
5. **Add monitoring** and error handling
6. **Deploy** with Docker/Kubernetes
7. **Optimize** performance and costs

