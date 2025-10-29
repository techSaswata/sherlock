#!/usr/bin/env python
"""
Test script to verify the video fact-checker setup.
Run this to check if all dependencies and API keys are configured correctly.
"""

import os
import sys
from dotenv import load_dotenv


def test_environment():
    """Test environment variables."""
    print("🔧 Testing Environment Variables...")
    
    load_dotenv()
    
    gemini_key = os.getenv('GEMINI_API_KEY')
    serper_key = os.getenv('SERPER_API_KEY')
    model = os.getenv('MODEL')
    
    if not gemini_key or gemini_key == 'your_gemini_api_key_here':
        print("❌ GEMINI_API_KEY not configured in .env")
        return False
    else:
        print(f"✅ GEMINI_API_KEY found")
    
    if not serper_key or serper_key == 'your_serper_api_key_here':
        print("⚠️  SERPER_API_KEY not configured (optional but recommended)")
    else:
        print(f"✅ SERPER_API_KEY found")
    
    if model:
        print(f"✅ MODEL: {model}")
    
    return True


def test_imports():
    """Test if all required packages are installed."""
    print("\n📦 Testing Package Imports...")
    
    packages = {
        'crewai': 'crewai',
        'google.generativeai': 'google-generativeai',
        'yt_dlp': 'yt-dlp',
        'instaloader': 'instaloader',
        'requests': 'requests',
        'dotenv': 'python-dotenv',
    }
    
    all_ok = True
    for module, package in packages.items():
        try:
            __import__(module)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} not installed")
            all_ok = False
    
    return all_ok


def test_tools():
    """Test if custom tools can be imported."""
    print("\n🔨 Testing Custom Tools...")
    
    try:
        from agent.tools import VideoDownloaderTool, GeminiVideoAnalyzerTool, FactCheckerTool
        print("✅ VideoDownloaderTool")
        print("✅ GeminiVideoAnalyzerTool")
        print("✅ FactCheckerTool")
        return True
    except ImportError as e:
        print(f"❌ Error importing tools: {e}")
        return False


def test_crew():
    """Test if crew can be initialized."""
    print("\n👥 Testing Crew Initialization...")
    
    try:
        from agent.crew import VideoFactCheckerCrew
        crew = VideoFactCheckerCrew()
        print("✅ Crew initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Error initializing crew: {e}")
        return False


def test_gemini_api():
    """Test Gemini API connection."""
    print("\n🤖 Testing Gemini API Connection...")
    
    try:
        import google.generativeai as genai
        load_dotenv()
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key or api_key == 'your_gemini_api_key_here':
            print("⚠️  Skipping API test - no valid API key")
            return True
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Simple test
        response = model.generate_content("Say 'API test successful'")
        if response.text:
            print("✅ Gemini API connection successful")
            return True
        else:
            print("❌ Gemini API returned empty response")
            return False
            
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return False


def main():
    """Run all tests."""
    print("="*60)
    print("VIDEO FACT-CHECKER SETUP TEST")
    print("="*60)
    
    results = []
    
    results.append(("Environment", test_environment()))
    results.append(("Packages", test_imports()))
    results.append(("Tools", test_tools()))
    results.append(("Crew", test_crew()))
    results.append(("Gemini API", test_gemini_api()))
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name:20} {status}")
    
    all_passed = all(result[1] for result in results)
    
    print("\n" + "="*60)
    if all_passed:
        print("🎉 All tests passed! Your setup is ready.")
        print("\nRun your first fact-check with:")
        print("  crewai run")
        print("\nOr:")
        print("  python -m agent.main <video_url>")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("1. Install missing packages: crewai install")
        print("2. Configure API keys in .env file")
        print("3. Check CONFIGURATION.md for detailed setup")
    print("="*60)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
