#!/usr/bin/env python
"""
Example usage of the Video Fact-Checker Agent

This script demonstrates how to use the fact-checking system programmatically.
"""

from agent.crew import VideoFactCheckerCrew


def fact_check_video(video_url: str):
    """
    Fact-check a video from YouTube or Instagram.
    
    Args:
        video_url: URL of the video to analyze
        
    Returns:
        Result of the fact-checking process
    """
    print(f"\n{'='*60}")
    print(f"🔍 VIDEO FACT-CHECKER")
    print(f"{'='*60}")
    print(f"\n📹 Analyzing: {video_url}\n")
    
    inputs = {
        'video_url': video_url,
    }
    
    try:
        # Initialize and run the crew
        crew = VideoFactCheckerCrew().crew()
        result = crew.kickoff(inputs=inputs)
        
        print(f"\n{'='*60}")
        print(f"✅ ANALYSIS COMPLETE")
        print(f"{'='*60}")
        print(f"\n📄 Report saved to: fact_check_report.md\n")
        
        return result
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
        raise


if __name__ == "__main__":
    # Example URLs (replace with actual videos)
    example_urls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # YouTube example
        # "https://www.instagram.com/reel/ABC123/",     # Instagram example
    ]
    
    # Fact-check the first example
    video_url = example_urls[0]
    
    # Or get URL from user input
    # video_url = input("Enter video URL: ")
    
    result = fact_check_video(video_url)
