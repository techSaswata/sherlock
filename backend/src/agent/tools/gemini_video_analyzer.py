from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import google.generativeai as genai
import os
import time
import yt_dlp


class GeminiVideoAnalyzerInput(BaseModel):
    """Input schema for GeminiVideoAnalyzer."""
    video_path: str = Field(..., description="Local path to the video file to analyze OR Instagram URL")


class GeminiVideoAnalyzerTool(BaseTool):
    name: str = "Gemini Video Analyzer"
    description: str = (
        "Analyzes video content using Google Gemini AI. "
        "For Instagram URLs, extracts metadata (title, description, author) first. "
        "For local files, analyzes directly. "
        "Extracts visual information, identifies people and objects, text overlays, "
        "scene descriptions, and any claims or statements made in the video. "
        "Returns a detailed analysis of the video content."
    )
    args_schema: Type[BaseModel] = GeminiVideoAnalyzerInput

    def _run(self, video_path: str) -> str:
        """Analyze video using Gemini AI."""
        try:
            # Configure Gemini
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                return "Error: GEMINI_API_KEY not found in environment variables"
            
            genai.configure(api_key=api_key)
            
            # Check if it's an Instagram URL or local file
            metadata = {}
            is_instagram = 'instagram.com' in video_path
            
            if is_instagram:
                # Extract Instagram metadata
                print(f"Extracting Instagram metadata: {video_path}")
                ydl_opts_info = {
                    'quiet': True,
                    'no_warnings': True,
                    'skip_download': True,
                }
                
                try:
                    with yt_dlp.YoutubeDL(ydl_opts_info) as ydl:
                        info = ydl.extract_info(video_path, download=False)
                        metadata = {
                            'title': info.get('title', 'Instagram Post'),
                            'description': info.get('description', 'No description'),
                            'author': info.get('uploader', 'Unknown'),
                            'upload_date': info.get('upload_date', 'Unknown'),
                            'view_count': info.get('view_count', 0),
                            'like_count': info.get('like_count', 0),
                        }
                except:
                    metadata = {
                        'title': 'Instagram Post',
                        'description': 'Could not extract metadata',
                        'author': 'Unknown',
                    }
            
            # Upload video file
            print(f"Uploading video: {video_path}")
            video_file = genai.upload_file(path=video_path)
            
            # Wait for processing
            while video_file.state.name == "PROCESSING":
                time.sleep(2)
                video_file = genai.get_file(video_file.name)
            
            if video_file.state.name == "FAILED":
                return "Error: Video processing failed"
            
            # Create enhanced analysis prompt
            if is_instagram and metadata:
                prompt = f"""Analyze this Instagram video in DETAIL. Use the metadata provided to enhance your analysis.

VIDEO METADATA:
- Author: {metadata.get('author', 'Unknown')}
- Title/Caption: {metadata.get('title', 'No title')}
- Description: {metadata.get('description', 'No description')[:500]}
- Upload Date: {metadata.get('upload_date', 'Unknown')}
- Views: {metadata.get('view_count', 0):,}

Now analyze the video content thoroughly:

1. PEOPLE IDENTIFICATION:
   - Identify any people visible in the video
   - If they appear to be public figures, celebrities, influencers, or well-known personalities, identify them
   - Describe their appearance, clothing, and demeanor
   - Note their role in the video

2. VISUAL CONTENT (DETAILED):
   - Main subjects and objects visible (be specific)
   - Scene descriptions and settings
   - Any text overlays, captions, graphics, or on-screen text
   - Notable visual elements, symbols, logos, or branding
   - Camera angles, editing style, production quality
   - Any filters or effects applied

3. ACTIVITIES AND ACTIONS:
   - What are people doing in the video?
   - Describe all significant actions and activities
   - Note any demonstrations, performances, or interactions

4. AUDIO/SPEECH CONTENT (DETAILED):
   - Transcribe ALL spoken words and dialogue
   - Note the speaker's tone and emotion
   - Background sounds, music, or sound effects

5. CLAIMS AND STATEMENTS:
   - List ALL factual claims made (visual or audio)
   - Identify any news, events, or incidents mentioned
   - Note dates, locations, names, or specific details
   - Focus on the TOP 2-3 most important verifiable claims

6. CONTEXT AND CREDIBILITY:
   - Apparent purpose of the video (entertainment, news, educational, promotional, etc.)
   - Potential red flags or suspicious elements
   - Relationship between caption and actual content

Be extremely detailed and objective."""
            else:
                prompt = """Analyze this video thoroughly and provide:
            
1. PEOPLE IDENTIFICATION:
   - Identify any people visible in the video
   - If they appear to be public figures or well-known personalities, identify them
   - Describe their appearance and role

2. VISUAL CONTENT (DETAILED):
   - Main subjects and objects visible
   - Scene descriptions and settings
   - Any text overlays, captions, or graphics
   - Notable visual elements or symbols

3. ACTIVITIES AND ACTIONS:
   - What are people doing in the video?
   - Describe all significant actions

4. AUDIO/SPEECH CONTENT:
   - Transcribe any spoken words or dialogue
   - Background sounds or music
   - Tone and emotion of speakers

5. CLAIMS AND STATEMENTS:
   - List all factual claims made (visual or audio)
   - Identify any news, events, or incidents mentioned
   - Note dates, locations, names, or specific details

6. CONTEXT:
   - Apparent purpose of the video
   - Any indicators of source or credibility
   - Potential red flags or suspicious elements

Be detailed and objective in your analysis."""
            
            # Generate analysis using Gemini 1.5 Flash for Instagram videos
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")
            response = model.generate_content([video_file, prompt])
            
            # Clean up uploaded file
            genai.delete_file(video_file.name)
            
            # Format result with metadata if available
            if is_instagram and metadata:
                result = f"""
INSTAGRAM VIDEO ANALYSIS
========================

VIDEO METADATA:
- Author: {metadata.get('author', 'Unknown')}
- Title/Caption: {metadata.get('title', 'No title')}
- Upload Date: {metadata.get('upload_date', 'Unknown')}
- Views: {metadata.get('view_count', 0):,}
- Likes: {metadata.get('like_count', 0):,}

DESCRIPTION/CAPTION:
{metadata.get('description', 'No description')[:500]}

---

DETAILED VIDEO ANALYSIS:
{response.text}
"""
                return result
            else:
                return response.text
            
        except Exception as e:
            return f"Error analyzing video: {str(e)}"
