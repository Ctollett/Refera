# Mix Reference Analyzer - Implementation Spec

## Product Overview

Web-based audio analysis tool for music producers to compare their mixes against professional reference tracks.

## User Tiers

### Anonymous (No Signup)

- Upload reference + up to 3 mix versions
- Full analysis and insights
- Export basic PNG report
- Session stored 24 hours (temporary DB + cookie)
- Lost on session expiry
- Rate limit: 5 analyses/hour per IP

### Free (Registered)

- Save up to 5 sessions permanently
- Up to 5 versions per session
- Organize into up to 5 folders
- Export comprehensive PDF reports
- Rate limit: 50 analyses/day

## Database Schema

```sql
-- Users (reuse existing auth tables)

-- Anonymous sessions (24-hour TTL)
CREATE TABLE anonymous_sessions (
  id UUID PRIMARY KEY,
  data JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Permanent sessions (registered users)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  folder_id UUID REFERENCES folders(id),

  -- Reference track analysis (stored, not file)
  reference_analysis JSONB: {
    filename: string,
    lufs_integrated: number,
    true_peak: number,
    frequency_bands: {
      sub_bass: number,    // 20-60Hz avg dB
      bass: number,        // 60-250Hz
      low_mids: number,    // 250-500Hz
      mids: number,        // 500-2000Hz
      high_mids: number,   // 2000-6000Hz
      highs: number        // 6000-20000Hz
    },
    spectrum_data: number[]  // For visualization (optional)
  },

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Mix versions
CREATE TABLE mix_versions (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  version_number INT,

  -- Mix analysis
  analysis JSONB: {
    filename: string,
    lufs_integrated: number,
    true_peak: number,
    frequency_bands: { ... same structure },
    spectrum_data: number[]
  },

  -- Comparison to reference
  comparison JSONB: {
    lufs_delta: number,  // reference - mix
    frequency_deltas: {
      sub_bass: number,
      bass: number,
      low_mids: number,
      mids: number,
      high_mids: number,
      highs: number
    }
  },

  -- Generated insights
  insights JSONB: [
    {
      severity: 'minor' | 'moderate' | 'major',
      category: 'loudness' | 'bass' | 'low_mids' | 'mids' | 'high_mids' | 'highs',
      message: string,
      recommendation: string
    }
  ],

  created_at TIMESTAMP
);

-- Folders
CREATE TABLE folders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  created_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_mix_versions_session_id ON mix_versions(session_id);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_anonymous_expires ON anonymous_sessions(expires_at);
```

## API Endpoints

### Analysis

```
POST /api/analyze
Body: { file: File, type: 'reference' | 'mix', referenceData?: object }
Response: { analysis, comparison?, insights? }
Auth: Optional (tracks anonymous via cookie)
```

### Sessions

```
GET    /api/sessions              # List user's sessions
POST   /api/sessions              # Create session
GET    /api/sessions/:id          # Get session + versions
PATCH  /api/sessions/:id          # Update (rename)
DELETE /api/sessions/:id          # Delete session
POST   /api/sessions/:id/versions # Add new mix version
```

### Folders

```
GET    /api/folders               # List user's folders
POST   /api/folders               # Create folder
PATCH  /api/folders/:id           # Rename folder
DELETE /api/folders/:id           # Delete folder (moves sessions to root)
```

### Anonymous Sessions

```
GET    /api/anonymous/session     # Get current anonymous session
POST   /api/anonymous/convert     # Convert anonymous to registered
```

## Audio Analysis Pipeline

### Input

- Formats: MP3, WAV, AIFF
- Max size: 100MB (anonymous), 200MB (registered)
- Process client-side using Web Audio API

### Analysis Steps

```javascript
1. Decode audio file → AudioBuffer
2. Extract PCM data
3. Calculate LUFS-I (ITU-R BS.1770-4 algorithm)
4. Calculate True Peak
5. Run FFT analysis
6. Aggregate into 6 frequency bands
7. Generate spectrum data (optional, for viz)
8. If mix: calculate deltas vs reference
9. If mix: generate insights from deltas
10. Store results in database
```

### LUFS Calculation

- Use library: `loudness` npm package or custom implementation
- Standard: ITU-R BS.1770-4
- Output: Single integrated LUFS value (e.g., -10.2 LUFS)

### FFT → Frequency Bands

```javascript
// Aggregate FFT bins into 6 bands
const bands = {
  sub_bass: averageDb(20, 60), // Hz range
  bass: averageDb(60, 250),
  low_mids: averageDb(250, 500),
  mids: averageDb(500, 2000),
  high_mids: averageDb(2000, 6000),
  highs: averageDb(6000, 20000),
};
```

## Insights Generation (Hardcoded Rules)

```javascript
function generateInsights(comparison) {
  const insights = [];
  const { lufs_delta, frequency_deltas } = comparison;

  // Loudness rules
  if (Math.abs(lufs_delta) > 3) {
    insights.push({
      severity: "major",
      category: "loudness",
      message: `Your mix is ${Math.abs(lufs_delta).toFixed(1)} dB ${lufs_delta > 0 ? "quieter" : "louder"} than reference`,
      recommendation:
        lufs_delta > 0
          ? "Increase overall level or apply gentle limiting"
          : "Reduce overall level to avoid distortion",
    });
  } else if (Math.abs(lufs_delta) > 1) {
    insights.push({
      severity: "moderate",
      category: "loudness",
      message: `Your mix is ${Math.abs(lufs_delta).toFixed(1)} dB ${lufs_delta > 0 ? "quieter" : "louder"}`,
      recommendation: "Getting close, minor level adjustment needed",
    });
  }

  // Frequency rules (check each band)
  Object.entries(frequency_deltas).forEach(([band, delta]) => {
    if (Math.abs(delta) > 3) {
      insights.push({
        severity: "major",
        category: band,
        message: `${band.replace("_", " ")} is ${Math.abs(delta).toFixed(1)} dB ${delta < 0 ? "louder" : "quieter"}`,
        recommendation: getFrequencyRecommendation(band, delta),
      });
    } else if (Math.abs(delta) > 1.5) {
      insights.push({
        severity: "moderate",
        category: band,
        message: `${band.replace("_", " ")} is ${Math.abs(delta).toFixed(1)} dB ${delta < 0 ? "louder" : "quieter"}`,
        recommendation: getFrequencyRecommendation(band, delta),
      });
    }
  });

  // Success case
  if (Math.abs(lufs_delta) < 1 && Object.values(frequency_deltas).every((d) => Math.abs(d) < 1.5)) {
    insights.push({
      severity: "minor",
      category: "overall",
      message: "Your mix is very close to the reference!",
      recommendation: "Great work! Only minor tweaks needed if any.",
    });
  }

  return insights;
}

function getFrequencyRecommendation(band, delta) {
  const recommendations = {
    sub_bass:
      delta > 0
        ? "Check sub frequencies (20-60Hz), may need slight boost"
        : "Reduce sub bass or apply high-pass filter around 30Hz",
    bass:
      delta > 0
        ? "Low end needs more weight, boost around 80-120Hz"
        : "Bass is too prominent, reduce kick/bass or use EQ cut",
    low_mids:
      delta > 0
        ? "Low mids could use more body around 300-400Hz"
        : "Check for muddiness in 250-500Hz range, consider gentle cut",
    mids:
      delta > 0
        ? "Midrange needs more presence, boost around 1-2kHz"
        : "Midrange might be too forward, check vocals/guitars",
    high_mids:
      delta > 0
        ? "High mids need clarity, boost around 3-5kHz"
        : "High mids might be harsh, gentle cut around 2-4kHz",
    highs:
      delta > 0
        ? "Mix is too dark, add air with high shelf boost around 10kHz"
        : "Too much high end, reduce brightness or de-ess",
  };
  return recommendations[band];
}
```

## UI Flow

### Page Structure

```
/ (Welcome)
  ├─ "Start Free Session" → /analyze
  └─ "Login" → Modal → /dashboard

/analyze (Anonymous or New Session)
  ├─ Upload reference
  ├─ Upload mix versions (1-3 anonymous, 1-5 registered)
  ├─ View results in tabs
  └─ CTA to sign up

/dashboard (Registered only)
  ├─ List sessions (grouped by folder)
  ├─ Create new session → /analyze
  └─ Open session → /sessions/:id

/sessions/:id (Session View)
  ├─ Version selector tabs [v1] [v2] [v3] ...
  ├─ Analysis tabs: [Loudness] [Spectrum] [EQ Bands]
  ├─ Tab content (changes per selection)
  ├─ Insights panel (always visible below tabs)
  └─ [Export Report] [Save Changes] [Back to Dashboard]
```

### Anonymous Session Logic

```javascript
// On first visit
1. Generate session ID
2. Set cookie: anon_session_id=uuid
3. Store in anonymous_sessions table (expires 24h)
4. Allow uploads and analysis
5. Show conversion CTAs:
   - After first analysis
   - On refresh (lost warning)
   - At version limit
   - On export

// On signup from anonymous
1. Create user account
2. Convert anonymous_session to permanent session
3. Clear anonymous cookie
4. Redirect to dashboard
```

## Export Functionality

### MVP: PNG Export

```javascript
// Capture current view as image
1. Use html-to-image or canvas
2. Include: version number, LUFS comparison, insights
3. Download as PNG
```

### Phase 2: PDF Export

```javascript
// Generate comprehensive PDF
1. Use jsPDF or similar
2. Include all tabs, all versions, graphs
3. Professional formatting
```

## Rate Limiting

```javascript
// Anonymous
- 5 analyses per hour per IP
- Track in Redis or database
- Return 429 if exceeded

// Registered
- 50 analyses per day per user
- Track in database
- Return 429 if exceeded
```

## Validation Rules

### File Upload

- Formats: MP3, WAV, AIFF only
- Max size: 100MB (anonymous), 200MB (registered)
- Min duration: 10 seconds
- Max duration: 10 minutes

### Session Limits (Registered)

- Max 5 sessions
- Max 5 versions per session
- Max 5 folders
- Return 403 if limit exceeded with upgrade message

## Tech Stack

### Backend

- Framework: Next.js API routes
- Database: PostgreSQL
- ORM: Prisma
- Audio: Web Audio API (client-side processing)
- Auth: NextAuth or existing system

### Frontend

- Framework: Next.js + React
- Styling: Tailwind CSS
- Charts: Recharts or Chart.js
- State: React Context
- File Upload: react-dropzone
- Forms: React Hook Form

### Libraries

- LUFS: `loudness` or custom
- FFT: Web Audio API AnalyserNode
- PDF: jsPDF (Phase 2)
- Image: html-to-image

## Implementation Priority

### Week 1: Core Backend

1. Database schema + migrations
2. Audio analysis pipeline (LUFS + FFT)
3. Insights generation
4. API endpoints (analyze, sessions)
5. Test with cURL/Postman

### Week 2: Auth + Persistence

1. Anonymous session handling
2. User authentication (reuse existing)
3. Session CRUD operations
4. Folder management
5. Rate limiting

### Week 3: Basic UI

1. Welcome page
2. Login/signup modals
3. Upload interface
4. Dashboard (list sessions)
5. Session view (display data, basic layout)

### Week 4: Polish + Launch

1. Tabs and version switching
2. Frequency spectrum visualization
3. Insights styling
4. Export functionality (PNG)
5. Responsive design
6. Error handling
7. Deploy

## Testing Checklist

### Analysis Accuracy

- [ ] LUFS within ±0.5 dB of professional tools
- [ ] Frequency bands match spectrum analyzer
- [ ] Insights trigger correctly for test files

### User Flows

- [ ] Anonymous: upload → analyze → results → lose on refresh
- [ ] Signup: convert anonymous session to permanent
- [ ] Registered: create session → save → reopen → add version
- [ ] Folder organization works
- [ ] Export downloads file

### Edge Cases

- [ ] Invalid file format rejected
- [ ] File too large rejected
- [ ] Rate limits enforced
- [ ] Session limits enforced (5 sessions, 5 versions)
- [ ] Expired anonymous sessions cleaned up

## Deployment

### Environment Variables

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
REDIS_URL (for rate limiting)
```

### Cron Jobs

```
# Clean expired anonymous sessions
0 * * * * # Every hour
DELETE FROM anonymous_sessions WHERE expires_at < NOW()
```

## Success Metrics

### Launch Targets

- 100+ sessions analyzed (anonymous + registered)
- 50+ registered users
- 10+ saved sessions
- <5 second analysis time
- LUFS accuracy within ±0.5 dB

## Notes for Implementation

- Start with backend/data first (validate analysis works)
- Use Web Audio API client-side to avoid server costs
- Keep UI simple initially (no fancy animations)
- Hardcode insights (no ML for MVP)
- Test with real music files from various genres
- Compare results against professional tools (Youlean, etc.)
- Focus on core value: accurate analysis + helpful insights
