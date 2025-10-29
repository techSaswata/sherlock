# Sherlock website navigation

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/techysds-projects/v0-cliste-website-navigation)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/5WauRRkvf62)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/techysds-projects/v0-cliste-website-navigation](https://vercel.com/techysds-projects/v0-cliste-website-navigation)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/5WauRRkvf62](https://v0.app/chat/projects/5WauRRkvf62)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Development

### Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### URL Processor Feature

The `/process` page includes an advanced URL content analyzer that:
- Analyzes Instagram Reels, YouTube videos, blog posts, and more
- Provides authenticity scoring and claim verification
- Shows visual processing animations
- Integrates with backend API for real analysis

**See documentation:**
- `BACKEND_API_SPEC.md` - Complete API specification for backend integration
- `CHANGES_SUMMARY.md` - Recent changes and migration details

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/analyze
```

### Backend Integration

The URL processor makes POST requests to your backend API. If no backend is running, it operates in demo mode with simulated processing.

For complete backend setup instructions, see `BACKEND_API_SPEC.md`.
