from crewai.tools import BaseTool
from typing import Type, Optional
from pydantic import BaseModel, Field
import yt_dlp
import os
import tempfile


class VideoDownloaderInput(BaseModel):
    """Input schema for VideoDownloader."""
    url: str = Field(..., description="YouTube or Instagram video/reel URL to download")


class VideoDownloaderTool(BaseTool):
    name: str = "Video Downloader"
    description: str = (
        "Downloads videos from YouTube or Instagram. "
        "Accepts a URL and returns the local file path of the downloaded video. "
        "Supports YouTube videos and Instagram reels/posts."
    )
    args_schema: Type[BaseModel] = VideoDownloaderInput

    def _run(self, url: str) -> str:
        """Download video from YouTube or Instagram."""
        try:
            # Create temp directory for downloads
            download_dir = tempfile.mkdtemp(prefix="video_fact_check_")
            
            ydl_opts = {
                'format': 'best[ext=mp4]/best',
                'outtmpl': os.path.join(download_dir, '%(title)s.%(ext)s'),
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                
            return f"Video downloaded successfully to: {filename}"
            
        except Exception as e:
            return f"Error downloading video: {str(e)}"
