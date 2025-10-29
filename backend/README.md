# Video Fact-Checker Agent

An intelligent agentic system that analyzes videos from YouTube or Instagram to verify if the content is real or fake news. Uses Google Gemini AI for video analysis and multi-agent collaboration for comprehensive fact-checking.

## Features

- 📥 **Video Download**: Automatically downloads videos from YouTube and Instagram
- 🎥 **AI Video Analysis**: Uses Google Gemini to extract visual and audio content
- 🔍 **Fact Checking**: Researches claims online using multiple credible sources
- 📊 **Comprehensive Reports**: Generates detailed fact-check reports with evidence

## How It Works

The system uses **Google Gemini AI** for all analysis and reasoning:

1. **Video Analyst** (Powered by Gemini):
   - Downloads videos from YouTube/Instagram
   - Uses Gemini AI to analyze video content
   - Extracts visual elements, scenes, and objects
   - Transcribes audio and speech
   - Identifies text overlays and graphics
   - Lists all factual claims

2. **Fact Checker** (Powered by Gemini):
   - Verifies claims through online research
   - Searches credible news sources
   - Cross-references information
   - Determines truth status of each claim
   - Provides confidence scores

3. **Report Writer** (Powered by Gemini):
   - Creates structured fact-check reports
   - Follows specific format: Explanation, Evidence, Final Verdict, Confidence Score
   - Cites sources with URLs and dates
   - Provides one-sentence final verdict

## Installation

### Prerequisites

- Python >=3.10 <3.14
- Google Gemini API key
- (Optional) Serper API key for enhanced web search

### Setup

1. Install UV package manager:
```bash
pip install uv
```

2. Install dependencies:
```bash
crewai install
```

Or manually:
```bash
uv pip install -e .
```

3. Configure API keys in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SERPER_API_KEY=your_serper_api_key_here  # Optional but recommended
MODEL=gemini/gemini-2.5-flash
```

### Get API Keys

- **Gemini API**: Get free API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Serper API** (optional): Get free API key at [Serper.dev](https://serper.dev/)

## Usage

### Basic Usage

Run with a video URL:
```bash
crewai run
```

Then enter the URL when prompted, or pass it directly:
```bash
python -m agent.main "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Supported Content Types

- ✅ YouTube videos
- ✅ Instagram reels and posts
- ✅ Blog posts and articles
- ✅ News websites
- ✅ Any video platform supported by yt-dlp

### Example URLs

```bash
# YouTube
python -m agent.main "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Instagram
python -m agent.main "https://www.instagram.com/reel/ABC123/"

# Blog/Article
python -m agent.main "https://example.com/blog/article-title"
```

## Output

The system generates a `fact_check_report.md` file containing:

- **Executive Summary**: Overall verdict and key findings
- **Video Information**: Source, date, content type
- **Visual & Audio Analysis**: Detailed content description
- **Claims Analysis**: Each claim with verdict and evidence
- **Conclusion**: Overall assessment and recommendations
- **Sources**: All consulted sources

## Project Structure

```
.
├── src/agent/
│   ├── config/
│   │   ├── agents.yaml      # Agent configurations
│   │   └── tasks.yaml       # Task definitions
│   ├── tools/
│   │   ├── video_downloader.py        # Downloads videos
│   │   ├── gemini_video_analyzer.py   # Analyzes with Gemini
│   │   └── fact_checker.py            # Fact-checking logic
│   ├── crew.py              # Crew orchestration
│   └── main.py              # Entry point
├── .env                     # API keys (create this)
├── pyproject.toml          # Dependencies
└── README.md               # This file
```

## Advanced Usage

### Training the Crew

Improve performance through training:
```bash
crewai train <n_iterations> <filename>
```

### Testing

Test the crew:
```bash
crewai test <n_iterations> <eval_llm>
```

### Replay

Replay from a specific task:
```bash
crewai replay <task_id>
```

## Troubleshooting

### Video Download Issues

If video download fails:
- Check if the URL is accessible
- Some platforms may require authentication
- Try updating yt-dlp: `pip install -U yt-dlp`

### Gemini API Issues

- Ensure your API key is valid
- Check API quota limits
- Video files must be under size limits

### Search Issues

- Add SERPER_API_KEY for better search results
- Without Serper, the system uses basic search capabilities

## Dependencies

- `crewai[tools]` - Multi-agent orchestration
- `google-generativeai` - Gemini AI for video analysis
- `yt-dlp` - Video downloading
- `instaloader` - Instagram support
- `requests` - HTTP requests
- `python-dotenv` - Environment management

## Contributing

Feel free to enhance the system by:
- Adding more video platforms
- Improving fact-checking algorithms
- Adding more analysis features
- Enhancing report formats

## License

MIT License - Feel free to use and modify

## Support

For issues or questions:
- Check [CrewAI documentation](https://docs.crewai.com)
- Review [Gemini API docs](https://ai.google.dev/docs)
- Open an issue on GitHub

---

Built with ❤️ using CrewAI and Google Gemini
