# Enhanced Video Analysis

## Overview

The video analysis system now includes comprehensive metadata extraction and detailed content analysis with person identification and activity recognition.

## Features

### 1. Metadata Extraction

#### YouTube Videos
Automatically extracts:
- **Title** - Video title
- **Description** - Full video description
- **Channel** - Channel name and ID
- **Upload Date** - When the video was published
- **View Count** - Number of views
- **Like Count** - Number of likes
- **Duration** - Video length in seconds
- **Tags** - Video tags/keywords

#### Instagram Videos
Automatically extracts:
- **Author** - Instagram username
- **Title/Caption** - Post caption
- **Description** - Full post description
- **Upload Date** - When posted
- **View Count** - Number of views
- **Like Count** - Number of likes

### 2. Enhanced Visual Analysis

#### People Identification
- Identifies people visible in the video
- **Recognizes public figures** - Celebrities, politicians, influencers
- Describes appearance, clothing, demeanor
- Notes their role in the video (speaker, subject, etc.)

#### Detailed Visual Content
- Specific objects and subjects
- Scene descriptions (indoor/outdoor, location type)
- Text overlays, captions, graphics
- Visual elements, symbols, logos, branding
- Camera angles and editing style
- Production quality assessment
- **AI-generated content detection** indicators

### 3. Activity Recognition

Identifies and describes:
- What people are doing in the video
- All significant actions and activities
- Demonstrations, experiments, performances
- Main purpose or goal of activities
- Interactions between people

### 4. Comprehensive Audio Analysis

- **Full transcription** of all spoken words
- Speaker tone, emotion, speaking style
- Background sounds and music
- Audio cues providing context

### 5. Intelligent Claim Extraction

- Lists ALL factual claims (visual and audio)
- Identifies news, events, incidents mentioned
- Notes dates, locations, names, specific details
- **Distinguishes** between facts, opinions, speculation
- Focuses on TOP 2-3 most important verifiable claims

### 6. Context and Credibility Assessment

- Video purpose (news, entertainment, educational, satire)
- Source credibility indicators
- Red flags or suspicious elements
- **Relationship between title/description and content**
- Signs of manipulation or deepfakes

## How It Works

### YouTube Analysis Process

1. **Extract Metadata** (no download)
   - Fetches title, description, channel info
   - Gets view count, likes, tags
   - Retrieves upload date and duration

2. **Download Video** (optimized)
   - Downloads in MP4 format, max 720p
   - Saves temporarily

3. **Upload to Gemini 2.0**
   - Uploads video for analysis
   - Waits for processing

4. **Detailed Analysis**
   - Sends metadata + video to Gemini 2.0 Flash Exp
   - Gemini analyzes with context from metadata
   - Identifies people, activities, claims

5. **Cleanup**
   - Removes temporary files
   - Returns comprehensive analysis

### Instagram Analysis Process

1. **Extract Metadata** (if possible)
   - Fetches author, caption, description
   - Gets view and like counts

2. **Download Video**
   - Downloads Instagram video

3. **Upload to Gemini 1.5**
   - Uploads for analysis

4. **Detailed Analysis**
   - Analyzes with metadata context
   - Identifies people and activities

5. **Cleanup**
   - Returns analysis with metadata

## Example Output

### YouTube Video Analysis

```
YOUTUBE VIDEO ANALYSIS
======================

VIDEO METADATA:
- URL: https://youtube.com/shorts/xXHUVzYww-E
- Title: "Sam Altman Stealing GPUs - AI Generated"
- Channel: TechNews Daily
- Upload Date: 20241025
- Views: 1,234,567
- Likes: 45,678
- Duration: 30 seconds

DESCRIPTION:
This is a Sora-generated video showing Sam Altman...

TAGS: AI, Sora, Sam Altman, OpenAI, GPUs, Satire

---

DETAILED VIDEO ANALYSIS:

1. PEOPLE IDENTIFICATION:
   - Sam Altman (CEO of OpenAI) - Appears to be AI-generated
   - Wearing casual business attire
   - Acting as the main subject

2. VISUAL CONTENT:
   - AI-generated video (Sora)
   - Indoor setting, appears to be a data center
   - High-quality CGI rendering
   - Text overlay: "This is satire"

3. ACTIVITIES AND ACTIONS:
   - Subject appears to be handling computer hardware
   - Satirical portrayal of "stealing" GPUs
   - Comedic/entertainment purpose

4. AUDIO/SPEECH CONTENT:
   - [Transcription of dialogue]
   - Humorous tone
   - Background music

5. CLAIMS AND STATEMENTS:
   - Main claim: This is AI-generated satire
   - No factual claims about real events
   - Entertainment/demonstration purpose

6. CONTEXT AND CREDIBILITY:
   - Purpose: Entertainment/AI demonstration
   - Clearly labeled as AI-generated
   - Satire/parody content
   - No misleading intent
```

## Benefits

### 1. Better Context
- Metadata provides crucial context
- Title and description help understand intent
- Channel info indicates source credibility

### 2. Accurate Person Identification
- Recognizes public figures
- Helps verify if claims about specific people are accurate
- Identifies deepfakes or AI-generated content

### 3. Comprehensive Activity Analysis
- Understands what's happening in the video
- Identifies key actions that support or contradict claims
- Provides evidence for fact-checking

### 4. Enhanced Fact-Checking
- More information = better verification
- Metadata can be cross-referenced
- Activity recognition helps verify claims

### 5. Deepfake Detection
- Identifies AI-generated content indicators
- Notes inconsistencies in visual quality
- Flags suspicious elements

## Use Cases

### 1. News Verification
- Identify people in news videos
- Verify locations and activities
- Check if title matches content

### 2. Deepfake Detection
- Identify AI-generated videos
- Spot visual inconsistencies
- Verify person identity

### 3. Misinformation Detection
- Check if description matches content
- Verify claims about people's actions
- Identify out-of-context content

### 4. Celebrity Impersonation
- Identify real vs fake celebrities
- Verify if person is who they claim to be
- Detect unauthorized use of likeness

## Technical Details

### Metadata Extraction
- Uses yt-dlp's info extraction
- No download required for metadata
- Fast and efficient

### Person Identification
- Powered by Gemini 2.0's advanced vision
- Recognizes public figures
- Describes appearance and role

### Activity Recognition
- Detailed action descriptions
- Context-aware analysis
- Purpose identification

## Limitations

### Person Identification
- May not recognize all public figures
- Accuracy depends on video quality
- Better with clear, well-lit footage

### Metadata Availability
- Some videos may have limited metadata
- Private videos can't be analyzed
- Age-restricted content may be blocked

### AI-Generated Content
- Detection is not 100% accurate
- Sophisticated deepfakes may be harder to detect
- Relies on visual cues and inconsistencies

## Best Practices

1. **Use high-quality videos** for better person identification
2. **Check metadata** for context clues
3. **Cross-reference** person identifications with other sources
4. **Look for AI indicators** in the analysis
5. **Verify claims** about identified people independently

## Future Enhancements

Potential improvements:
- Face recognition database integration
- More sophisticated deepfake detection
- Emotion and sentiment analysis
- Object tracking across frames
- Scene-by-scene breakdown
