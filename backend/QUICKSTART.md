# Quick Start Guide

Get your video fact-checker running in 5 minutes!

## Step 1: Install Dependencies

```bash
pip install uv
crewai install
```

## Step 2: Configure API Keys

Edit `.env` file:
```env
GEMINI_API_KEY=your_actual_gemini_key
SERPER_API_KEY=your_serper_key  # Optional
```

Get keys:
- Gemini: https://makersuite.google.com/app/apikey (FREE)
- Serper: https://serper.dev/ (FREE tier available)

## Step 3: Run Your First Fact-Check

```bash
crewai run
```

When prompted, paste a video URL:
```
https://www.youtube.com/watch?v=example
```

## Step 4: View Results

Check `fact_check_report.md` for the complete analysis!

## Example Workflow

1. **Input**: YouTube video claiming "XYZ event happened"
2. **Video Analysis**: Gemini extracts visuals, audio, and claims
3. **Fact Checking**: Agents research the claims online
4. **Report**: Get verdict (Real/Fake/Misleading) with evidence

## Tips

- Use recent news videos for best results
- Shorter videos (< 10 min) process faster
- Check the report for source citations
- Re-run with different videos to compare

## Common Issues

**"Video download failed"**
- Check if URL is public and accessible
- Try a different video

**"Gemini API error"**
- Verify your API key in .env
- Check you haven't exceeded quota

**"No search results"**
- Add SERPER_API_KEY for better results
- Some claims may be too new or obscure

## Next Steps

- Try different video platforms (Instagram, etc.)
- Experiment with various content types
- Review the generated reports
- Customize agents in `config/agents.yaml`

Happy fact-checking! 🔍
