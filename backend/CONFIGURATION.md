# Configuration Guide

## API Keys Setup

### 1. Google Gemini API (Required)

Gemini is used for video analysis - extracting visual and audio content.

**Get your key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

**Add to .env:**
```env
GEMINI_API_KEY=your_actual_key_here
```

**Free tier includes:**
- 60 requests per minute
- Sufficient for most fact-checking needs

### 2. Serper API (Optional but Recommended)

Serper provides enhanced web search for fact-checking.

**Get your key:**
1. Visit [Serper.dev](https://serper.dev/)
2. Sign up for free account
3. Copy your API key from dashboard

**Add to .env:**
```env
SERPER_API_KEY=your_serper_key_here
```

**Free tier includes:**
- 2,500 searches per month
- More than enough for regular use

**Without Serper:**
- System will use basic search capabilities
- Results may be less comprehensive

## Model Configuration

You can change the Gemini model in `.env`:

```env
# Fast and efficient (recommended)
MODEL=gemini/gemini-2.5-flash

# More powerful but slower
MODEL=gemini/gemini-2.5-pro

# Latest experimental
MODEL=gemini/gemini-2.0-flash-exp
```

## Agent Customization

### Modify Agent Behavior

Edit `src/agent/config/agents.yaml`:

```yaml
video_analyst:
  role: >
    Your custom role description
  goal: >
    Your custom goal
  backstory: >
    Your custom backstory
```

### Modify Task Instructions

Edit `src/agent/config/tasks.yaml`:

```yaml
video_analysis_task:
  description: >
    Your custom task description
  expected_output: >
    Your custom output format
```

## Advanced Settings

### Change Process Type

In `src/agent/crew.py`, modify the process:

```python
# Sequential (default) - tasks run one after another
process=Process.sequential

# Hierarchical - manager agent coordinates
process=Process.hierarchical
```

### Add Custom Tools

Create new tools in `src/agent/tools/`:

```python
from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field

class MyCustomToolInput(BaseModel):
    argument: str = Field(..., description="Description")

class MyCustomTool(BaseTool):
    name: str = "My Tool"
    description: str = "What it does"
    args_schema: Type[BaseModel] = MyCustomToolInput
    
    def _run(self, argument: str) -> str:
        # Your logic here
        return "result"
```

Then add to agent in `crew.py`:

```python
from agent.tools import MyCustomTool

@agent
def video_analyst(self) -> Agent:
    return Agent(
        config=self.agents_config['video_analyst'],
        tools=[VideoDownloaderTool(), GeminiVideoAnalyzerTool(), MyCustomTool()],
        verbose=True
    )
```

## Performance Tuning

### Video Size Limits

Large videos may fail. To handle:

1. **Adjust download options** in `video_downloader.py`:
```python
ydl_opts = {
    'format': 'worst[ext=mp4]',  # Lower quality
    'postprocessor_args': ['-t', '60'],  # First 60 seconds only
}
```

2. **Use shorter clips** for analysis

### Timeout Settings

For slow connections, increase timeouts in tools.

### Memory Usage

For large videos, ensure sufficient RAM (4GB+ recommended).

## Troubleshooting

### API Rate Limits

If you hit rate limits:
- Wait a few minutes
- Upgrade to paid tier
- Use different API keys for different projects

### Video Download Fails

Try updating yt-dlp:
```bash
pip install -U yt-dlp
```

### Gemini Processing Errors

- Check video format (MP4 works best)
- Reduce video size/length
- Verify API key is valid

## Environment Variables Reference

```env
# Required
GEMINI_API_KEY=your_key          # Google Gemini API key
MODEL=gemini/gemini-1.5-flash    # Model to use

# Optional
SERPER_API_KEY=your_key          # Serper search API key

# Advanced (optional)
GEMINI_TIMEOUT=300               # Timeout in seconds
MAX_VIDEO_SIZE=100               # Max size in MB
DEBUG=false                      # Enable debug logging
```

## Best Practices

1. **Start with short videos** (< 5 minutes)
2. **Use public URLs** that don't require authentication
3. **Check API quotas** regularly
4. **Keep API keys secure** - never commit .env file
5. **Test with known content** first to verify setup

## Getting Help

- Check logs for detailed error messages
- Review CrewAI docs: https://docs.crewai.com
- Review Gemini docs: https://ai.google.dev/docs
- Open an issue with error details
