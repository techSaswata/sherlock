# Supabase Database Polling Setup

## Overview

The application now uses **Supabase database polling** instead of waiting for direct HTTP responses from the backend. This allows for longer processing times without timeout issues.

## Architecture Flow

```
User submits URL
    ↓
Frontend sends POST to backend (fire and forget)
    ↓
Frontend shows 5-minute visual animation
    ↓
After animation, start polling Supabase database every 2 seconds
    ↓
Backend processes content and writes result to Supabase
    ↓
Frontend detects result in database
    ↓
Display comprehensive analysis report
```

## Environment Variables

Create a `.env.local` file in the project root with the following:

```bash
# Backend API endpoint
NEXT_PUBLIC_API_URL=https://crew-backend-dxlx.onrender.com/analyze

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://uuocunrkthcixhkgzxeq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1b2N1bnJrdGhjaXhoa2d6eGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzQ5NTcsImV4cCI6MjA3NzIxMDk1N30.ifQQaS0v_VcEN9g-6xRmA2s0w48x3iRyTdAYCStwaI4
```

## Database Schema

### Table: `video_analysis`

```sql
create table public.video_analysis (
    id uuid primary key default gen_random_uuid(),
    url text not null,
    url_status text,
    url_content jsonb,
    inserted_at timestamp with time zone default now()
);

-- Enable RLS and allow all operations (development only)
alter table public.video_analysis enable row level security;

create policy "Allow all operations for everyone"
on public.video_analysis
for all
using (true)
with check (true);
```

### Column Details

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key, auto-generated |
| `url` | text | The URL being analyzed (used for lookup) |
| `url_status` | text | Status of analysis (e.g., "processing", "completed") |
| `url_content` | jsonb | The analysis result in JSON format |
| `inserted_at` | timestamp | When the record was created |

## Backend Integration

Your backend should:

1. **Receive POST request** at `/analyze` with URL
2. **Insert initial record** into Supabase:
   ```sql
   INSERT INTO video_analysis (url, url_status)
   VALUES ('https://example.com/video', 'processing');
   ```

3. **Process the content** (can take up to 10 minutes)

4. **Update record** with results:
   ```sql
   UPDATE video_analysis
   SET url_status = 'completed',
       url_content = '{
         "success": true,
         "message": "Analysis completed",
         "result": "# Fact-Check Report\n..."
       }'::jsonb
   WHERE url = 'https://example.com/video';
   ```

### Example Backend (Python)

```python
from supabase import create_client
import os

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.post("/analyze")
async def analyze_content(request: dict):
    url = request["url"]
    
    # Insert initial record
    supabase.table("video_analysis").insert({
        "url": url,
        "url_status": "processing"
    }).execute()
    
    # Process content (async/background task recommended)
    result = await process_video(url)
    
    # Update with results
    supabase.table("video_analysis").update({
        "url_status": "completed",
        "url_content": {
            "success": True,
            "message": "Analysis completed",
            "result": result
        }
    }).eq("url", url).execute()
    
    return {"status": "processing"}
```

## Frontend Polling Logic

The frontend polls every **2 seconds** for up to **10 minutes** (300 attempts):

1. **Query**: `SELECT * FROM video_analysis WHERE url = ? ORDER BY inserted_at DESC LIMIT 1`
2. **Check Status**: Verifies `url_status === 'completed'` AND `url_content` is not null
3. **Parse**: Extract and display the markdown report
4. **Status Handling**:
   - `processing`: Continues polling, shows progress updates
   - `completed`: Retrieves and displays results
   - `error`: Stops polling, shows error message
   - `pending`: Continues polling silently
5. **Timeout**: After 10 minutes, stop polling

### Polling Status Logs

Users see progress updates:
- Every 30 seconds: "Still waiting for results... (X min Y sec)"
- When found: "Results found in database!"

## Expected Response Format

The `url_content` JSONB should contain:

```json
{
  "success": true,
  "message": "Video analysis completed successfully",
  "result": "# Fact-Check Report\n**Content URL:** ...",
  "error": null
}
```

The frontend will automatically:
1. Parse the markdown `result` field
2. Extract authenticity scores, claims, findings
3. Display in beautiful UI components

## Benefits

✅ **No timeouts**: Backend can take as long as needed
✅ **Reliable**: Avoids connection issues with long-running requests
✅ **Scalable**: Multiple users can be processed independently
✅ **Resumable**: Frontend can refresh and check status later
✅ **Status tracking**: Can show "processing" vs "completed" status

## Testing

### Test with curl:

```bash
# 1. Send analysis request
curl -X POST https://crew-backend-dxlx.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=example"}'

# 2. Check Supabase directly
# Visit: https://uuocunrkthcixhkgzxeq.supabase.co
# Table Editor → video_analysis → View records
```

### Test frontend polling:

1. Run the Next.js app: `pnpm dev`
2. Visit: http://localhost:3000/process
3. Enter a URL and submit
4. Watch the console for polling logs
5. When backend updates Supabase, report appears automatically

## Security Notes

⚠️ **Current Setup**: Public access (development only)

For production, implement proper RLS policies:

```sql
-- Example: User-specific access
create policy "Users can read their own analyses"
on public.video_analysis
for select
using (auth.uid() = user_id);

create policy "Service role can write"
on public.video_analysis
for insert
using (auth.role() = 'service_role');
```

## Troubleshooting

### Frontend not finding results?

1. Check Supabase credentials in `.env.local`
2. Verify table exists and has data
3. Check browser console for errors
4. Ensure RLS policies allow read access

### Backend not updating database?

1. Verify backend has Supabase credentials
2. Check backend logs for errors
3. Test Supabase connection from backend
4. Ensure backend uses service role key (more permissions)

### Polling timeout?

- Increase `maxAttempts` in `url-processor.tsx`
- Current: 300 attempts × 2 seconds = 10 minutes
- Adjust as needed for your use case

## Files Modified

- ✅ `package.json` - Added @supabase/supabase-js
- ✅ `lib/supabase.ts` - Supabase client setup
- ✅ `components/url-processor.tsx` - Polling logic
- ✅ Environment variables for Supabase connection

---

**Built for reliability and scalability** 🚀

