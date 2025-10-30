# Refera Architecture

## Overview

Refera is a client-side audio analysis application with a backend API for data persistence and business logic. The architecture prioritizes privacy (no audio file uploads), scalability (client-side processing), and maintainability (server-side business rules).

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           React Application (Frontend)              │   │
│  │  - File Upload UI (react-dropzone)                  │   │
│  │  - Audio Analysis Engine (Web Audio API)            │   │
│  │  - State Management (Zustand + React Query)         │   │
│  │  - Data Visualization (Recharts)                    │   │
│  │  - Authentication (JWT storage)                     │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │ HTTP/REST (JSON)
                      │ Analysis results only
                      │ (no audio files)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Express Server)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Authentication Middleware (JWT validation)         │   │
│  └──────────────────┬──────────────────────────────────┘   │
│  ┌─────────────────▼──────────────────────────────────┐   │
│  │  Rate Limiting (express-rate-limit)                 │   │
│  └──────────────────┬──────────────────────────────────┘   │
│  ┌─────────────────▼──────────────────────────────────┐   │
│  │  Request Validation (Zod schemas)                   │   │
│  └──────────────────┬──────────────────────────────────┘   │
│  ┌─────────────────▼──────────────────────────────────┐   │
│  │  Controllers                                        │   │
│  │  - Auth Controller (register, login)               │   │
│  │  - Analysis Controller (calculate deltas/insights) │   │
│  │  - Session Controller (CRUD operations)            │   │
│  │  - Folder Controller (organization)                │   │
│  └──────────────────┬──────────────────────────────────┘   │
│  ┌─────────────────▼──────────────────────────────────┐   │
│  │  Prisma ORM                                         │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (RDS)                      │
│  - Users                                                    │
│  - Sessions (permanent, registered users)                  │
│  - MixVersions                                             │
│  - Folders                                                 │
│  - AnonymousSessions (temporary, 24hr TTL)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Frontend (React Application)

**Responsibilities:**

- User interface and interactions
- Audio file handling (local only, never uploaded)
- Audio analysis using Web Audio API
- State management for UI and server data
- Data visualization (charts, graphs)
- Client-side routing

**Key Technologies:**

- React 19.1 + TypeScript
- Zustand (global UI state)
- React Query (server state caching)
- Web Audio API (audio processing)
- Recharts (visualization)
- Axios (HTTP client)

**Does NOT:**

- Upload audio files to server
- Calculate comparison deltas
- Generate insights
- Store data persistently

---

### 2. Audio Analysis Engine (Web Audio API)

**Responsibilities:**

- Decode audio files (MP3, WAV, AIFF)
- Calculate LUFS (ITU-R BS.1770-4 standard)
- Calculate True Peak
- Perform FFT analysis
- Aggregate frequency data into 6 bands

**Implementation:**

- Runs entirely in browser
- Uses native Web Audio API
- Custom JavaScript implementations of:
  - LUFS calculation
  - True Peak detection
  - Frequency band aggregation (20Hz-20kHz → 6 bands)

**Output Format:**

```typescript
{
  filename: string,
  lufs_integrated: number,
  true_peak: number,
  frequency_bands: {
    sub_bass: number,    // 20-60Hz
    bass: number,        // 60-250Hz
    low_mids: number,    // 250-500Hz
    mids: number,        // 500-2000Hz
    high_mids: number,   // 2000-6000Hz
    highs: number        // 6000-20000Hz
  },
  spectrum_data?: number[] // Optional
}
```

---

### 3. Backend API (Express Server)

**Responsibilities:**

- Receive and validate analysis results
- Calculate comparison deltas (reference - mix)
- Generate insights using hardcoded rules
- Store sessions, mix versions, and user data
- Authenticate users (JWT)
- Enforce rate limits
- Manage anonymous sessions

**Architecture Layers:**

#### Middleware Layer

- `auth.middleware.ts` - JWT validation
- `validation.middleware.ts` - Zod schema validation
- Rate limiting (express-rate-limit)
- CORS configuration
- Cookie parsing (anonymous sessions)

#### Controller Layer

- `auth.controller.ts` - User registration/login
- `analysis.controller.ts` - Analysis storage, comparison, insights
- `session.controller.ts` - Session CRUD
- `folder.controller.ts` - Folder management
- `anonymous.controller.ts` - Anonymous session handling

#### Service Layer (Business Logic)

- **Comparison Service:**
  - Calculate LUFS delta
  - Calculate frequency band deltas
  - Format comparison object

- **Insights Service:**
  - Apply hardcoded rules (from spec)
  - Determine severity (minor/moderate/major)
  - Generate recommendation messages
  - Return insights array

- **Session Service:**
  - Create/update/delete sessions
  - Enforce limits (5 sessions per user)
  - Handle folder assignment

#### Data Layer

- Prisma ORM for database queries
- Type-safe database operations
- Transaction support for complex operations

---

### 4. Database (PostgreSQL)

**Responsibilities:**

- Persistent storage of all application data
- Relational data integrity
- JSONB storage for analysis results

**Schema Overview:**

- `users` - Registered user accounts
- `sessions` - Permanent sessions with reference analysis
- `mix_versions` - Mix versions with analysis, comparison, insights
- `folders` - Session organization
- `anonymous_sessions` - Temporary sessions (24hr TTL)

**Key Indexes:**

- `users.email` (unique)
- `sessions.userId`, `sessions.folderId`
- `mix_versions.sessionId`
- `folders.userId`
- `anonymous_sessions.expiresAt`

---

### 5. Authentication System

**Implementation:**

- JWT-based authentication
- Tokens expire after 24 hours
- Passwords hashed with bcrypt (10 rounds)

**Flow:**

```
Registration:
1. User submits email/password
2. Backend hashes password
3. Store user in database
4. Generate JWT token
5. Return token + user object

Login:
1. User submits email/password
2. Backend finds user by email
3. Compare password with bcrypt
4. Generate JWT token
5. Return token + user object

Protected Routes:
1. Client sends JWT in Authorization header
2. Middleware validates token
3. Decode userId from token
4. Attach user to request object
5. Continue to controller
```

**Anonymous Sessions:**

- Cookie-based: `anon_session_id=<uuid>`
- No authentication required
- Automatically created on first visit
- Expires after 24 hours

---

### 6. Rate Limiting

**Implementation:**

- In-memory rate limiting (express-rate-limit)
- Separate limits for anonymous and registered users

**Anonymous Users:**

- 5 analyses per hour
- Tracked by IP address
- Returns 429 when exceeded

**Registered Users:**

- 50 analyses per day
- Tracked by user ID
- Returns 429 when exceeded

**Future Scaling:**

- Can migrate to Redis for distributed rate limiting
- Current approach sufficient for MVP

---

## Data Flow Diagrams

### Reference Track Upload

```
┌──────────┐                                    ┌──────────┐
│  User    │                                    │ Frontend │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. Select audio file                         │
     │──────────────────────────────────────────────>
     │                                               │
     │                                               │ 2. Web Audio API
     │                                               │    analyzes file
     │                                               │    (LUFS, peaks,
     │                                               │     freq bands)
     │                                               │
     │                                               │ 3. POST /api/analyze
     │                                               │    { type: "reference",
     │                                               │      analysis: {...} }
     │                                               │
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │ Backend │
     │                                          └────┬────┘
     │                                               │
     │                                               │ 4. Store in
     │                                               │    Session or
     │                                               │    AnonymousSession
     │                                               │
     │                                               ▼
     │                                          ┌──────────┐
     │                                          │ Database │
     │                                          └────┬─────┘
     │                                               │
     │                                               │ 5. Return success
     │                                               │
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │ Backend │
     │                                          └────┬────┘
     │                                               │
     │ 6. Display "reference ready"                  │
     │<──────────────────────────────────────────────┤
     │                                               │
     ▼                                               ▼
```

### Mix Version Upload

```
┌──────────┐                                    ┌──────────┐
│  User    │                                    │ Frontend │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. Select mix file                            │
     │──────────────────────────────────────────────>
     │                                               │
     │                                               │ 2. Web Audio API
     │                                               │    analyzes file
     │                                               │
     │                                               │ 3. POST /api/analyze
     │                                               │    { type: "mix",
     │                                               │      analysis: {...} }
     │                                               │
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │ Backend │
     │                                          └────┬────┘
     │                                               │
     │                                               │ 4. Fetch reference
     │                                               │    from database
     │                                               │
     │                                               ▼
     │                                          ┌──────────┐
     │                                          │ Database │
     │                                          └────┬─────┘
     │                                               │
     │                                               │ 5. Calculate deltas
     │                                               │    (ref - mix)
     │                                               │
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │ Backend │
     │                                          └────┬────┘
     │                                               │
     │                                               │ 6. Generate insights
     │                                               │    (hardcoded rules)
     │                                               │
     │                                               │ 7. Store MixVersion
     │                                               │
     │                                               ▼
     │                                          ┌──────────┐
     │                                          │ Database │
     │                                          └────┬─────┘
     │                                               │
     │                                               │ 8. Return:
     │                                               │    - analysis
     │                                               │    - comparison
     │                                               │    - insights
     │                                               │
     │ 9. Display insights to user                   │
     │<──────────────────────────────────────────────┤
     │                                               │
     ▼                                               ▼
```

### Anonymous to Registered Conversion

```
┌──────────┐                                    ┌──────────┐
│  User    │                                    │ Frontend │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. Has been using anonymously                 │
     │    (cookie: anon_session_id)                  │
     │                                               │
     │ 2. Click "Sign Up"                            │
     │──────────────────────────────────────────────>
     │                                               │
     │                                               │ 3. POST /api/auth/register
     │                                               │
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │ Backend │
     │                                          └────┬────┘
     │                                               │
     │                                               │ 4. Create user
     │                                               │
     │                                               ▼
     │                                          ┌──────────┐
     │                                          │ Database │
     │                                          └────┬─────┘
     │                                               │
     │                                               │ 5. Return JWT token
     │                                               │
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │ Backend │
     │                                          └────┬────┘
     │                                               │
     │ 6. Receive token                              │
     │<──────────────────────────────────────────────┤
     │                                               │
     │ 7. POST /api/anonymous/convert                │
     │    (with JWT + cookie)                        │
     │──────────────────────────────────────────────>
     │                                               │
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │ Backend │
     │                                          └────┬────┘
     │                                               │
     │                                               │ 8. Fetch anonymous
     │                                               │    session data
     │                                               │
     │                                               ▼
     │                                          ┌──────────┐
     │                                          │ Database │
     │                                          └────┬─────┘
     │                                               │
     │                                               │ 9. Create Session
     │                                               │    + MixVersions
     │                                               │    from anon data
     │                                               │
     │                                               │ 10. Delete anon
     │                                               │     session
     │                                               │
     │                                               ▼
     │                                          ┌──────────┐
     │                                          │ Database │
     │                                          └────┬─────┘
     │                                               │
     │                                               │ 11. Return new
     │                                               │     Session
     │                                               │
     │ 12. Clear cookie, redirect to dashboard       │
     │<──────────────────────────────────────────────┤
     │                                               │
     ▼                                               ▼
```

---

## Key Design Decisions

### 1. Client-Side Audio Processing

**Decision:** All audio analysis happens in the browser using Web Audio API

**Rationale:**

- **Privacy:** Audio files never leave user's computer
- **Scalability:** No server CPU/storage costs, infinite horizontal scaling
- **Performance:** No upload time, instant analysis
- **Reduced Complexity:** No server-side audio processing infrastructure

**Tradeoffs:**

- Requires modern browser with Web Audio API support
- Analysis accuracy depends on client-side implementation
- Can't leverage server-side optimization libraries (e.g., Python librosa)

---

### 2. Server-Side Business Logic

**Decision:** Comparison calculations and insight generation happen on the backend

**Rationale:**

- **Single Source of Truth:** Business rules centralized
- **Easy Updates:** Change insight rules without redeploying frontend
- **Security:** Client can't manipulate insights
- **Consistency:** All users get same insights for same data

**Tradeoffs:**

- Backend does more work (but it's lightweight math)
- One extra roundtrip vs pure client-side

---

### 3. JSON Storage for Analysis Data

**Decision:** Store analysis results as JSONB in PostgreSQL instead of normalized columns

**Rationale:**

- **Flexibility:** Can add new metrics without migrations
- **Atomic Access:** Analysis data always accessed together
- **Matches API Output:** Direct mapping from Web Audio API
- **Performance:** PostgreSQL JSONB is fast and indexable

**Tradeoffs:**

- Can't query individual frequency bands efficiently
- Larger storage footprint vs normalized approach

---

### 4. Separate Anonymous Session Table

**Decision:** AnonymousSessions in separate table with all data in JSON blob

**Rationale:**

- **Different Lifecycle:** Temporary vs permanent
- **Different Constraints:** 3 versions vs 5 versions
- **Simpler Cleanup:** Delete entire row on expiry
- **Schema Clarity:** No nullable userId in main Session table

**Tradeoffs:**

- Slight duplication of logic (conversion process)
- Can't easily query all sessions (anon + registered) together

---

### 5. JWT Authentication

**Decision:** JWT tokens with 24-hour expiry, stored client-side

**Rationale:**

- **Stateless:** No server-side session storage
- **Scalable:** Works across multiple backend instances
- **Standard:** Well-understood pattern with good tooling

**Tradeoffs:**

- Can't revoke tokens before expiry
- Tokens can be larger than session IDs
- Refresh token flow adds complexity (not implemented in MVP)

---

### 6. In-Memory Rate Limiting

**Decision:** Use express-rate-limit (in-memory) instead of Redis

**Rationale:**

- **Simplicity:** No additional infrastructure for MVP
- **Sufficient:** Works for single-instance deployment
- **Fast:** In-memory lookups

**Tradeoffs:**

- Won't work across multiple backend instances
- Resets on server restart
- Should migrate to Redis for production scale

---

## Security Considerations

### Authentication

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with strong secret
- Tokens expire after 24 hours
- Protected routes validate token on every request

### Input Validation

- All API inputs validated with Zod schemas
- File size limits enforced (100MB anonymous, 200MB registered)
- SQL injection prevented by Prisma parameterized queries
- XSS prevented by React's built-in escaping

### Rate Limiting

- Anonymous: 5 analyses/hour (by IP)
- Registered: 50 analyses/day (by user)
- 429 response when limits exceeded

### CORS

- Restricted to specific origins (localhost dev, production domain)
- Credentials enabled for cookie-based anonymous sessions

### Data Privacy

- Audio files never uploaded to server
- Analysis results stored with user consent
- Anonymous sessions auto-deleted after 24 hours

---

## Performance Considerations

### Client-Side

- Audio processing runs on user's CPU (no server load)
- React Query caches API responses (reduces backend calls)
- Lazy loading for heavy components
- Optimistic UI updates for better perceived performance

### Backend

- Database indexes on foreign keys and query columns
- Prisma connection pooling
- JSONB storage for fast read/write of analysis data
- Stateless architecture (horizontal scaling ready)

### Database

- Indexed foreign keys (userId, sessionId, folderId)
- JSONB indexes on anonymous_sessions.expiresAt for cleanup
- Connection pooling via Prisma
- Periodic cleanup job for expired anonymous sessions (cron)

---

## Error Handling

### Client-Side

- Try/catch around Web Audio API operations
- User-friendly error messages for common failures:
  - Unsupported file format
  - File too large
  - Browser doesn't support Web Audio API
- Retry logic for network failures (React Query)

### Backend

- Global error handler middleware
- Consistent error response format
- Detailed logging with morgan
- Validation errors return specific field errors
- Database errors caught and sanitized

### Common Error Scenarios

- **Rate limit exceeded:** 429 with retry-after header
- **Session limit reached:** 403 with upgrade message
- **Invalid JWT:** 401 with re-login prompt
- **Session not found:** 404 with helpful message
- **Validation failure:** 400 with field-specific errors

---

## Deployment Architecture (AWS)

```
                    ┌──────────────┐
                    │   Route 53   │
                    │     (DNS)    │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   AWS Amplify    │      │     Elastic      │
    │   (Frontend)     │      │    Beanstalk     │
    │                  │      │    (Backend)     │
    │ - CloudFront CDN │      │                  │
    │ - Auto builds    │◄─────┤  - Node.js       │
    │ - SSL/TLS        │ API  │  - Auto-scaling  │
    └──────────────────┘      │  - Load balancer │
                              └─────────┬────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │    RDS           │
                              │  PostgreSQL      │
                              │                  │
                              │ - Automated      │
                              │   backups        │
                              │ - Multi-AZ       │
                              └──────────────────┘
```

**Components:**

- **Amplify:** Frontend hosting with CDN
- **Elastic Beanstalk:** Backend API with auto-scaling
- **RDS:** Managed PostgreSQL database
- **CloudFront:** CDN for frontend assets
- **Route 53:** DNS management
- **Certificate Manager:** Free SSL certificates

---

## Future Improvements

### Phase 1 Enhancements

- Redis for distributed rate limiting
- CloudWatch alarms for monitoring
- Automated database backups to S3
- CI/CD pipeline (GitHub Actions)

### Phase 2 Features

- PDF report generation (jsPDF)
- Stereo field analysis
- Dynamic range comparison
- Batch analysis support
- Real-time collaboration on sessions

### Phase 3 Scaling

- CDN caching for static assets
- Database read replicas
- Microservices architecture (separate analysis service)
- GraphQL API alternative to REST
- WebSocket support for real-time updates

---

## Monitoring & Observability

### Current (MVP)

- Morgan HTTP request logging
- Console error logging
- AWS CloudWatch basic metrics

### Future

- Structured logging (Winston or Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic or DataDog)
- User analytics (PostHog or Plausible)
- Custom metrics dashboard

---

## Testing Strategy

### Frontend

- Unit tests: Audio analysis functions (Vitest)
- Component tests: React components (Testing Library)
- Integration tests: API interactions (MSW mocking)

### Backend

- Unit tests: Controllers, services (Vitest)
- Integration tests: API endpoints with test database
- E2E tests: Complete user flows (Playwright)

### Audio Analysis Validation

- Compare LUFS results against professional tools
- Validate frequency analysis against spectrum analyzers
- Test with various audio formats and edge cases
- Ensure accuracy within ±0.5 dB for LUFS

---

## Conclusion

Refera's architecture prioritizes privacy, scalability, and maintainability through client-side audio processing and server-side business logic. The separation of concerns allows for easy iteration on insight rules while maintaining instant analysis performance. The freemium model and AWS deployment provide a clear path from MVP to production scale.
