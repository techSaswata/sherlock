# Sherlock - AI-Powered Content Fact-Checker

An intelligent platform that analyzes content from social media and websites, verifies claims, and provides evidence-based fact-check reports with confidence scores.

[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 Project Overview

Sherlock is a full-stack content analysis platform that helps users verify the authenticity of online content. It combines powerful web scraping, AI-driven analysis, and beautiful user interfaces to deliver comprehensive fact-checking reports.

### What It Does

1. **Accepts URLs** from multiple platforms (YouTube, Instagram, blogs)
2. **Extracts content** using advanced processing tools (OCR, STT, crawlers)
3. **Analyzes authenticity** through AI agents and deep research
4. **Generates reports** with confidence scores, evidence, and recommendations

### Key Features

- 🎥 **Multi-Platform Support**: YouTube, Instagram Reels/Posts, blog articles
- 🤖 **AI-Powered Analysis**: LLM-based agents for claim verification
- 📊 **Visual Reports**: Beautiful UI with authenticity scores and evidence
- ⚡ **Real-Time Processing**: Live updates during content analysis
- 💾 **Smart Caching**: Vector database for faster repeat queries
- 🌍 **Multilingual**: Automatic language detection and translation
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  Next.js 14 + React 19 + Tailwind CSS
│  (User UI)  │  Beautiful animations, real-time updates
└──────┬──────┘
       │ POST /analyze
       ↓
┌─────────────┐
│   Backend   │  FastAPI + AI Agents
│  (Analysis) │  Content extraction, fact-checking
└──────┬──────┘
       │
       ├─→ Service Scrapers (YouTube, Instagram, Web)
       ├─→ Processing Tools (FFmpeg, Whisper, Tesseract, BLIP-2)
       ├─→ AI Agent Workflow (LangChain/CrewAI)
       └─→ Vector Database (Caching & semantic search)
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 19 (Server Components)
- TypeScript 5
- Tailwind CSS 4
- Framer Motion (Animations)
- Radix UI (Components)

**Backend (Recommended):**
- Python FastAPI
- LangChain/CrewAI (AI Agents)
- FFmpeg (Video processing)
- Faster Whisper (Speech-to-text)
- Tesseract OCR (Text extraction)
- BLIP-2 (Image understanding)
- Pinecone/Weaviate (Vector DB)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm

### Frontend Setup

```bash
# Clone repository
git clone <repository-url>
cd v0-landingpage

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit **http://localhost:3000** to see the app.

### ✨ Production Ready

The app is pre-configured with a production backend at:
**`https://crew-backend-dxlx.onrender.com/analyze`**

No environment variables or backend setup needed! Just run and use.

### Development Mode

To use a local backend during development, create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/analyze
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[BACKEND_EXPLANATION.md](BACKEND_EXPLANATION.md)** | Complete backend architecture, implementation guide, and code examples |
| **[BACKEND_API_SPEC.md](BACKEND_API_SPEC.md)** | API endpoints, request/response formats, and integration details |
| **[FEATURES.md](FEATURES.md)** | Detailed feature list and capabilities showcase |

## 🎨 Features in Detail

### URL Processing

Navigate to `/process` to access the content analyzer:

1. **Input**: Paste any URL from supported platforms
2. **Detection**: Automatic content type identification
3. **Processing**: Visual animation with real-time logs
4. **Analysis**: AI-powered fact-checking and claim verification
5. **Report**: Comprehensive results with evidence and sources

### Report Components

- **Authenticity Score**: 0-100% confidence visualization
- **Summary**: AI-generated content overview
- **Sentiment**: Positive/Negative/Neutral classification
- **Key Findings**: Bullet-point discoveries
- **Claims Verification**: Individual claim status with confidence levels
- **Recommendations**: Suggested actions for users
- **Sources**: Links to evidence and references
- **Full Report**: Detailed markdown report (collapsible)
- **Raw Data**: JSON response for developers

### Visual Design

- **Glassmorphic UI**: Modern frosted glass effects
- **3D Backgrounds**: Animated particle systems
- **Smooth Animations**: Framer Motion transitions
- **Responsive Layout**: Mobile-first design
- **Dark Theme**: Optimized for readability
- **Primary Color**: #84CC16 (lime green)

## 🔧 Development

### Project Structure

```
v0-landingpage/
├── app/                      # Next.js app router
│   ├── page.tsx             # Home page
│   ├── process/             # URL processor
│   ├── car-dealerships/     # Dealership page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── url-processor.tsx    # Main processing component
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   └── ui/                  # UI primitives
├── lib/                     # Utilities
├── public/                  # Static assets
└── styles/                  # Global styles
```

### Key Files

- **`components/url-processor.tsx`**: Core analysis interface
  - Handles URL submission
  - Manages processing animation
  - Displays analysis reports
  - Parses backend responses

- **`app/process/page.tsx`**: Processing page wrapper
  - Provides layout and background
  - Manages page transitions

### Available Scripts

```bash
pnpm dev        # Development server (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Production server
pnpm lint       # Run ESLint
```

### Environment Variables

The app works out of the box with the production backend. Environment variables are optional:

```bash
# Optional: Override backend URL for local development
NEXT_PUBLIC_API_URL=http://localhost:8000/analyze

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_id
```

## 🔌 Backend Integration

The frontend automatically connects to the production backend at:
**`https://crew-backend-dxlx.onrender.com/analyze`**

### API Request

```bash
curl -X POST https://crew-backend-dxlx.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/shorts/example"}'
```

### Expected Response

```json
{
  "success": true,
  "message": "Analysis completed",
  "result": "# Fact-Check Report\n...",
  "error": null
}
```

The frontend automatically:
1. Sends POST request on form submit
2. Shows visual processing animation
3. Waits for backend response
4. Parses markdown report into structured UI
5. Displays beautiful analysis results

See **[BACKEND_EXPLANATION.md](BACKEND_EXPLANATION.md)** for implementation details.

## 🎯 Use Cases

### Content Creators
- Verify sources before sharing
- Check competitor content authenticity
- Analyze engagement patterns

### Journalists
- Fact-check viral content
- Investigate misinformation
- Gather evidence for stories

### Researchers
- Analyze social media trends
- Study misinformation spread
- Collect verified data

### Businesses
- Monitor brand mentions
- Verify influencer content
- Protect reputation

## 🛠️ Customization

### Styling

The app uses Tailwind CSS with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#84CC16', // Lime green
        // Add your colors
      },
    },
  },
}
```

### Processing Steps

Customize steps in `url-processor.tsx`:

```typescript
const generateSteps = (type: ContentType): ProcessStep[] => {
  // Modify steps based on content type
  return [
    { id: "parsing", label: "Parsing URL", ... },
    { id: "analyzing", label: "Analyzing content", ... },
    // Add your steps
  ]
}
```

### Backend URL

The default production endpoint is pre-configured. To use a different backend:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/analyze  # Local development
# or
NEXT_PUBLIC_API_URL=https://your-api.com/analyze   # Custom backend
```

## 📊 Performance

- **First Load**: ~2s (optimized builds)
- **Analysis Time**: 10-30s (backend dependent)
- **Animation**: 60 FPS (hardware accelerated)
- **Mobile Score**: 95+ (Lighthouse)

## 🔒 Security

- ✅ CORS configured for specific origins
- ✅ Input sanitization on URL submission
- ✅ No sensitive data in frontend
- ✅ Environment variables for secrets
- ✅ Rate limiting recommended on backend

## 🐛 Troubleshooting

### Backend Not Connecting

```bash
# Test the production backend
curl https://crew-backend-dxlx.onrender.com/analyze

# Check browser console for errors
# Open DevTools → Console tab

# Verify CORS and network status
# Open DevTools → Network tab
```

### Animation Stuck

- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Check for JavaScript errors in console
- Restart development server

### Slow Performance

- Enable production mode: `pnpm build && pnpm start`
- Check network tab for slow requests
- Optimize backend response time

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# The app works immediately with the production backend
# No environment variables needed!

# Optional: Override backend URL in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://your-custom-api.com/analyze
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of the v0.app deployment system.

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Animations with [Framer Motion](https://www.framer.com/motion)

## 📞 Support

For questions or issues:
- Check documentation files
- Review [BACKEND_API_SPEC.md](BACKEND_API_SPEC.md)
- Open an issue on GitHub

---

**Built with ❤️ for truth and transparency**
