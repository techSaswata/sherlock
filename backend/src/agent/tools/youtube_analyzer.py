from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import google.generativeai as genai
import os
import yt_dlp
import tempfile
import time


class YouTubeAnalyzerInput(BaseModel):
    """Input schema for YouTubeAnalyzer."""
    url: str = Field(..., description="YouTube video URL to analyze (including YouTube Shorts)")


class YouTubeAnalyzerTool(BaseTool):
    name: str = "YouTube Analyzer"
    description: str = (
        "Analyzes YouTube videos and Shorts using Google Gemini 2.0 Flash Experimental. "
        "Downloads the video temporarily and analyzes it with advanced video understanding. "
        "Extracts video metadata (title, description, channel, views, date), visual information, "
        "identifies people and objects, scene descriptions, audio transcription, and claims. "
        "Uses Gemini 2.0 for superior video analysis capabilities. "
        "Use this for ALL YouTube content (youtube.com, youtu.be, youtube.com/shorts)."
    )
    args_schema: Type[BaseModel] = YouTubeAnalyzerInput

    def _run(self, url: str) -> str:
        """Analyze YouTube video using Gemini AI with metadata."""
        video_path = None
        try:
            # Configure Gemini
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                return "Error: GEMINI_API_KEY not found in environment variables"
            
            genai.configure(api_key=api_key)
            
            # Extract metadata first (without downloading)
            print(f"Extracting YouTube metadata: {url}")
            ydl_opts_info = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
            }
            
            metadata = {}
            with yt_dlp.YoutubeDL(ydl_opts_info) as ydl:
                info = ydl.extract_info(url, download=False)
                metadata = {
                    'title': info.get('title', 'Unknown'),
                    'description': info.get('description', 'No description'),
                    'channel': info.get('uploader', 'Unknown'),
                    'channel_id': info.get('channel_id', 'Unknown'),
                    'upload_date': info.get('upload_date', 'Unknown'),
                    'view_count': info.get('view_count', 0),
                    'like_count': info.get('like_count', 0),
                    'duration': info.get('duration', 0),
                    'tags': info.get('tags', []),
                }
            
            # Download video
            print(f"Downloading YouTube video: {url}")
            download_dir = tempfile.mkdtemp(prefix="youtube_fact_check_")
            
            ydl_opts = {
                'format': 'best[ext=mp4][height<=720]/best[ext=mp4]/best',
                'outtmpl': os.path.join(download_dir, '%(id)s.%(ext)s'),
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                video_path = ydl.prepare_filename(info)
            
            print(f"Video downloaded to: {video_path}")
            
            # Upload and analyze with Gemini
            print(f"Uploading video to Gemini for analysis...")
            video_file = genai.upload_file(path=video_path)
            
            # Wait for processing
            while video_file.state.name == "PROCESSING":
                print("Processing video...")
                time.sleep(2)
                video_file = genai.get_file(video_file.name)
            
            if video_file.state.name == "FAILED":
                return "Error: Video processing failed in Gemini"
            
            # Create enhanced analysis prompt with metadata
            prompt = f"""Analyze this YouTube video in DETAIL. Use the metadata provided to enhance your analysis.

VIDEO METADATA:
- Title: {metadata['title']}
- Channel: {metadata['channel']}
- Description: {metadata['description'][:500]}{'...' if len(metadata['description']) > 500 else ''}
- Upload Date: {metadata['upload_date']}
- Views: {metadata['view_count']:,}
- Duration: {metadata['duration']} seconds
- Tags: {', '.join(metadata['tags'][:10]) if metadata['tags'] else 'None'}

Now analyze the video content thoroughly:

1. PEOPLE IDENTIFICATION:
   - Identify any people visible in the video
   - If they appear to be public figures, celebrities, or well-known personalities, identify them by name
   - Describe their appearance, clothing, and demeanor
   - Note their role in the video (speaker, subject, interviewer, etc.)

2. VISUAL CONTENT (DETAILED):
   - Main subjects and objects visible (be specific)
   - Scene descriptions and settings (indoor/outdoor, location type)
   - Any text overlays, captions, graphics, or on-screen text
   - Notable visual elements, symbols, logos, or branding
   - Camera angles, editing style, production quality
   - Any visual effects or AI-generated content indicators

3. ACTIVITIES AND ACTIONS:
   - What are people doing in the video?
   - Describe all significant actions and activities
   - Note any demonstrations, experiments, or performances
   - Identify the main purpose or goal of the activities shown

4. AUDIO/SPEECH CONTENT (DETAILED):
   - Transcribe ALL spoken words and dialogue
   - Note the speaker's tone, emotion, and speaking style
   - Background sounds, music, or sound effects
   - Any audio cues that provide context

5. CLAIMS AND STATEMENTS:
   - List ALL factual claims made (visual or audio)
   - Identify any news, events, or incidents mentioned
   - Note dates, locations, names, or specific details
   - Distinguish between facts, opinions, and speculation
   - Focus on the TOP 2-3 most important verifiable claims

6. CONTEXT AND CREDIBILITY:
   - Apparent purpose of the video (news, entertainment, educational, satire, etc.)
   - Source credibility indicators (verified channel, professional production, etc.)
   - Potential red flags or suspicious elements
   - Relationship between title/description and actual content
   - Any signs of manipulation, deepfakes, or AI-generated content

Be extremely detailed and objective. Use the metadata to provide context for your analysis."""
            
            # Generate analysis using Gemini 2.0 Flash Experimental for better video understanding
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")
            print("Analyzing video content with Gemini 2.5 flash...")
            response = model.generate_content([video_file, prompt])
            
            # Combine metadata and analysis
            result = f"""
YOUTUBE VIDEO ANALYSIS
======================

VIDEO METADATA:
- URL: {url}
- Title: {metadata['title']}
- Channel: {metadata['channel']}
- Upload Date: {metadata['upload_date']}
- Views: {metadata['view_count']:,}
- Likes: {metadata['like_count']:,}
- Duration: {metadata['duration']} seconds

DESCRIPTION:
{metadata['description'][:1000]}{'...' if len(metadata['description']) > 1000 else ''}

TAGS: {', '.join(metadata['tags'][:15]) if metadata['tags'] else 'None'}

---

DETAILED VIDEO ANALYSIS:
{response.text}
"""
            
            # Clean up
            try:
                genai.delete_file(video_file.name)
                if video_path and os.path.exists(video_path):
                    os.remove(video_path)
                if os.path.exists(download_dir):
                    os.rmdir(download_dir)
            except:
                pass
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            
            # Clean up on error
            try:
                if video_path and os.path.exists(video_path):
                    os.remove(video_path)
            except:
                pass
            
            # Provide helpful error messages
            if "quota" in error_msg.lower():
                return f"""Error: API quota exceeded.

Please check your Gemini API quota at: https://makersuite.google.com/

URL provided: {url}
Error: {error_msg}"""
            
            elif "blocked" in error_msg.lower() or "safety" in error_msg.lower():
                return f"""Error: Content may have been blocked by safety filters.

This can happen with:
- Age-restricted content
- Potentially harmful content
- Private videos

URL provided: {url}
Error: {error_msg}"""
            
            elif "download" in error_msg.lower():
                return f"""Error downloading video: {error_msg}

URL provided: {url}

Troubleshooting:
1. Ensure the video is public
2. Check if the URL is correct
3. Try a different video"""
            
            else:
                return f"""Error analyzing YouTube video: {error_msg}

URL provided: {url}

Troubleshooting:
1. Ensure the video is public
2. Check if the URL is correct
3. Try a different video
4. Verify your API key is valid"""
