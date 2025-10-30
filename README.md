# Refera

A browser-based audio analysis tool for music producers to compare their mixes against professional reference tracks. Get instant insights on loudness and frequency balance to improve your mixes.

## What is Refera?

Refera analyzes audio files directly in your browser and compares your mix against professional reference tracks. Upload a reference track, then upload multiple versions of your mix to see detailed comparisons of loudness (LUFS) and frequency spectrum across 6 bands. Get actionable insights like "your bass is 3dB too loud" or "your mix is 2dB quieter than the reference."

No audio files are uploaded to servers - all processing happens client-side using the Web Audio API for instant results and complete privacy.

## Key Features

- **Client-Side Audio Analysis**: All processing happens in your browser using Web Audio API
- **LUFS Measurement**: Industry-standard loudness analysis (ITU-R BS.1770-4)
- **6-Band Frequency Analysis**: Compare sub-bass, bass, low-mids, mids, high-mids, and highs
- **Automated Insights**: Get actionable recommendations based on hardcoded rules
- **Version Tracking**: Compare up to 5 mix versions against your reference
- **Anonymous Sessions**: Try it instantly without signup (24-hour sessions)
- **Save & Organize**: Registered users can save sessions and organize into folders
- **Export Reports**: Download analysis results as PNG (PDF in Phase 2)

## Use Cases

- Compare your mix against commercial releases in your genre
- Track improvements across multiple mix versions
- Identify frequency imbalances before mastering
- Learn mixing by analyzing professional tracks
- Validate your mix translates across different systems

## Tech Stack

### Frontend

- React 19.1 with TypeScript
- Vite 7 for development and builds
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state caching
- Web Audio API for audio analysis
- Recharts for data visualization
- react-dropzone for file uploads

### Backend

- Node.js with Express.js
- TypeScript 5.7
- PostgreSQL with Prisma ORM
- JWT authentication with bcrypt
- express-rate-limit for API protection
- Zod for validation

### Audio Processing

- Web Audio API (native browser API)
- Custom JavaScript implementations of:
  - LUFS calculation (ITU-R BS.1770-4)
  - True Peak detection
  - FFT-based frequency band aggregation
  - Comparison delta calculations
  - Insight generation

### Deployment

- AWS Amplify (frontend)
- AWS Elastic Beanstalk (backend)
- AWS RDS PostgreSQL (database)
- AWS CloudFront (CDN)
- AWS Route 53 (DNS)

## Project Structure

```
Refera/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and Zod schemas
└── docs/            # Project documentation
```

## Documentation

- [Tech Stack](docs/TECH_STACK.md) - Complete technology choices and deployment details
- [Data Model](docs/DATA_MODEL.md) - Database schema and relationships
- [API Documentation](docs/API.md) - Complete REST API reference
- Architecture (coming soon) - System design and data flow
- Frontend Hierarchy (coming soon) - Component structure and routing

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Modern browser with Web Audio API support

### Installation

```bash
# Clone the repository
git clone https://github.com/Ctollett/Refera.git
cd Refera

# Install dependencies
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your database URL and JWT secret

# Generate Prisma client
npm run db:generate --workspace=server

# Run database migrations
npm run db:migrate --workspace=server

# Start development servers
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Development

This is a monorepo using npm workspaces. Frontend, backend, and shared types are separate packages with shared dependencies.

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=client
npm test --workspace=server
```

### Building for Production

```bash
# Build both client and server
npm run build

# Build specific workspace
npm run build --workspace=client
npm run build --workspace=server
```

### Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate --workspace=server

# Create and run a new migration
npm run db:migrate --workspace=server

# Open Prisma Studio (database GUI)
npm run db:studio --workspace=server

# Push schema changes without migration (dev only)
npm run db:push --workspace=server
```

## Architecture Highlights

### Client-Side Processing

All audio analysis happens in the browser using Web Audio API. No audio files are uploaded to the server - only the analysis results (JSON) are sent to the backend. This approach provides:

- Instant analysis (no upload/download time)
- Complete privacy (audio never leaves your computer)
- Infinite scalability (no server CPU usage)
- Lower costs (no storage or processing fees)

### Type Safety End-to-End

TypeScript throughout with Prisma-generated types, Zod schemas shared between client and server, and runtime validation on all API endpoints.

### Freemium Model

- Anonymous users: 1 session, 3 mix versions, 24-hour TTL, 5 analyses/hour
- Registered users: 5 sessions, 5 versions each, 5 folders, 50 analyses/day
- All limits enforced at API level with clear upgrade messaging

### Audio Analysis Accuracy

LUFS calculation follows ITU-R BS.1770-4 standard. Results validated against professional tools like Youlean Loudness Meter. Frequency analysis uses Web Audio API's AnalyserNode with custom band aggregation logic.

## How It Works

### For Anonymous Users

1. Visit site → automatic session creation (cookie-based)
2. Upload reference track → Web Audio API analyzes → results stored temporarily
3. Upload mix versions → analyze → calculate deltas → generate insights
4. View results with frequency charts and actionable recommendations
5. Session expires after 24 hours

### For Registered Users

1. Sign up / login → JWT authentication
2. Create named session with reference track
3. Add mix versions (up to 5 per session)
4. Organize sessions into folders
5. Sessions saved permanently
6. Export reports as PNG

### Anonymous to Registered Conversion

Anonymous users can sign up and convert their current session to a permanent saved session with one click.

## User Limits

### Anonymous

- 1 active session (24 hour expiry)
- 3 mix versions per session
- 5 analyses per hour (rate limit by IP)
- 100MB max file size

### Registered

- 5 sessions (permanent)
- 5 folders for organization
- 5 mix versions per session
- 50 analyses per day (rate limit by user)
- 200MB max file size

## Project Status

Currently in development. This is a portfolio and learning project demonstrating:

- Digital Signal Processing (DSP) concepts in JavaScript
- Advanced browser API usage (Web Audio API)
- Full-stack TypeScript development
- AWS deployment and infrastructure
- Freemium product design
- Audio engineering domain knowledge

## Roadmap

### Phase 1 (Current)

- Core audio analysis (LUFS + 6-band frequency)
- Anonymous and registered user flows
- Session management and folder organization
- Basic insights generation
- PNG report export

### Phase 2

- PDF report generation with all data
- Spectrum visualization improvements
- Stereo field analysis
- Dynamic range comparison
- Public sample analysis page

### Phase 3

- Batch analysis
- Custom insight rules
- A/B listening mode
- Real-time collaboration (share sessions)
- Mobile responsive improvements

## Contributing

This is a personal learning project, but feedback and suggestions are welcome. Feel free to open an issue to discuss features, bugs, or architectural decisions.

## License

MIT

## Author

**Carson Tollett**
[GitHub](https://github.com/Ctollett)

## Acknowledgments

- ITU-R BS.1770-4 standard for LUFS measurement
- Web Audio API specification and MDN documentation
- Music production community for feature inspiration and feedback
