# Refera Data Model

## Overview

The data model supports two user types with different session management:

- **Anonymous Users:** Temporary sessions (24 hours) with limited features
- **Registered Users:** Permanent sessions with organization and management capabilities

## Entity Relationship Diagram

```
User
  ├─ has many → Sessions
  └─ has many → Folders

Folder
  ├─ belongs to → User
  └─ has many → Sessions

Session
  ├─ belongs to → User
  ├─ optionally belongs to → Folder
  └─ has many → MixVersions

MixVersion
  └─ belongs to → Session

AnonymousSession
  └─ (standalone, no relationships)
```

---

## Entities

### User

Manages authentication and authorization for registered users.

**Fields:**

- `id` (UUID, PK) - Unique identifier
- `name` (String) - User's display name
- `email` (String, unique) - Email address for authentication
- `password` (String) - Hashed password (bcrypt)
- `profileAvatar` (String, nullable) - Avatar URL or path
- `createdAt` (DateTime) - Account creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Relationships:**

- Has many `Session` (one-to-many)
- Has many `Folder` (one-to-many)

**Constraints:**

- Email must be unique
- Password must be hashed (never store plaintext)

**Limits:**

- Max 5 sessions per user
- Max 5 folders per user

---

### AnonymousSession

Stores temporary analysis sessions for non-registered users.

**Fields:**

- `id` (UUID, PK) - Unique identifier (also used as cookie value)
- `data` (JSON) - Complete session data including reference and mix versions
- `expiresAt` (DateTime) - Expiration timestamp (24 hours from creation)
- `createdAt` (DateTime) - Session creation timestamp

**JSON Structure (`data` field):**

```typescript
{
  referenceAnalysis: {
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
    spectrum_data?: number[]  // Optional, for visualization
  },
  mixVersions: [
    {
      versionNumber: number,
      analysis: {
        filename: string,
        lufs_integrated: number,
        true_peak: number,
        frequency_bands: { /* same structure */ },
        spectrum_data?: number[]
      },
      comparison: {
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
      insights: [
        {
          severity: 'minor' | 'moderate' | 'major',
          category: 'loudness' | 'bass' | 'low_mids' | 'mids' | 'high_mids' | 'highs',
          message: string,
          recommendation: string
        }
      ]
    }
  ]
}
```

**Indexes:**

- `expiresAt` - for efficient cleanup queries

**Constraints:**

- Automatically deleted after `expiresAt` timestamp (via cron job)
- Max 3 mix versions per anonymous session

**Notes:**

- No relationships to other tables
- Identified by cookie: `anon_session_id`
- All data stored in single JSON blob for simplicity

---

### Folder

Organizes sessions for registered users.

**Fields:**

- `id` (UUID, PK) - Unique identifier
- `userId` (UUID, FK) - Owner of the folder
- `name` (String) - User-defined folder name
- `createdAt` (DateTime) - Creation timestamp

**Relationships:**

- Belongs to `User` (many-to-one)
- Has many `Session` (one-to-many)

**Indexes:**

- `userId` - for efficient user folder queries

**Constraints:**

- Max 5 folders per user
- Folder names don't need to be unique (user can have duplicate names)

**Cascade Behavior:**

- On user deletion: Delete folder (cascade)
- On folder deletion: Sessions moved to root level (folderId set to null)

---

### Session

Stores permanent analysis sessions for registered users.

**Fields:**

- `id` (UUID, PK) - Unique identifier
- `userId` (UUID, FK) - Owner of the session
- `name` (String) - User-defined session name
- `folderId` (UUID, FK, nullable) - Optional folder assignment
- `referenceAnalysis` (JSON) - Reference track analysis data
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**JSON Structure (`referenceAnalysis` field):**

```typescript
{
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
  spectrum_data?: number[]  // Optional, for visualization
}
```

**Relationships:**

- Belongs to `User` (many-to-one)
- Optionally belongs to `Folder` (many-to-one)
- Has many `MixVersion` (one-to-many)

**Indexes:**

- `userId` - for efficient user session queries
- `folderId` - for folder organization queries

**Constraints:**

- Max 5 sessions per user
- Session names don't need to be unique

**Cascade Behavior:**

- On user deletion: Delete session and all mix versions (cascade)
- On folder deletion: Set folderId to null (session moves to root)
- On session deletion: Delete all associated mix versions (cascade)

---

### MixVersion

Stores individual mix versions within a session, including analysis, comparison, and insights.

**Fields:**

- `id` (UUID, PK) - Unique identifier
- `sessionId` (UUID, FK) - Parent session
- `versionNumber` (Int) - Version sequence number (1, 2, 3...)
- `analysis` (JSON) - Mix audio analysis data
- `comparison` (JSON) - Comparison deltas vs reference
- `insights` (JSON) - Generated insights array
- `createdAt` (DateTime) - Creation timestamp

**JSON Structure (`analysis` field):**

```typescript
{
  filename: string,
  lufs_integrated: number,
  true_peak: number,
  frequency_bands: {
    sub_bass: number,
    bass: number,
    low_mids: number,
    mids: number,
    high_mids: number,
    highs: number
  },
  spectrum_data?: number[]
}
```

**JSON Structure (`comparison` field):**

```typescript
{
  lufs_delta: number,  // reference - mix (positive = mix quieter)
  frequency_deltas: {
    sub_bass: number,
    bass: number,
    low_mids: number,
    mids: number,
    high_mids: number,
    highs: number
  }
}
```

**JSON Structure (`insights` field):**

```typescript
[
  {
    severity: "minor" | "moderate" | "major",
    category: "loudness" | "bass" | "low_mids" | "mids" | "high_mids" | "highs",
    message: string,
    recommendation: string,
  },
];
```

**Relationships:**

- Belongs to `Session` (many-to-one)

**Indexes:**

- `sessionId` - for efficient session version queries

**Constraints:**

- Max 5 versions per session (registered users)
- `versionNumber` should increment sequentially per session

**Cascade Behavior:**

- On session deletion: Delete mix version (cascade)

---

## Key Design Decisions

### Why Store Reference in Session vs Separate Table?

**Decision:** Reference analysis stored as JSON field in `Session` table

**Rationale:**

- 1:1 relationship (one reference per session)
- Reference cannot exist without a session
- Reference never needs to be queried independently
- Simpler schema, fewer joins

### Why Separate MixVersion Table?

**Decision:** Mix versions stored in separate `MixVersion` table

**Rationale:**

- 1:many relationship (multiple mixes per session)
- Each mix can be added/removed independently
- Enables versioning with `versionNumber`
- Can query individual mix versions
- Better for updates (update one mix without touching others)

### Why Separate AnonymousSession Table?

**Decision:** Anonymous sessions in separate table with all data in JSON

**Rationale:**

- Different lifecycle (temporary vs permanent)
- Different constraints (no user, no folders, 3 mix limit)
- Simpler cleanup (delete entire row based on expiry)
- No need for normalization (data deleted in 24 hours anyway)
- Avoids nullable userId in Session table

### Why JSON for Audio Data?

**Decision:** Store analysis results as JSON/JSONB instead of normalized columns

**Rationale:**

- Flexible schema (can add new analysis metrics without migrations)
- Audio analysis data is always accessed together (no need to query individual bands)
- PostgreSQL JSONB provides good performance and indexing
- Matches the output format from Web Audio API
- Simplifies data transfer to frontend

---

## Business Rules & Constraints

### Registered User Limits

- **Sessions:** Max 5 per user
- **Folders:** Max 5 per user
- **Mix Versions:** Max 5 per session
- **Rate Limit:** 50 analyses per day

### Anonymous User Limits

- **Sessions:** 1 active session (24 hour TTL)
- **Mix Versions:** Max 3 per session
- **Rate Limit:** 5 analyses per hour (by IP address)

### Data Retention

- **Anonymous Sessions:** Automatically deleted after 24 hours
- **Registered Sessions:** Retained indefinitely unless user deletes

### Conversion Rules

When anonymous user signs up:

1. Create User account
2. Convert `AnonymousSession.data` → new `Session` + `MixVersion` rows
3. Delete anonymous session
4. Clear anonymous cookie

---

## Database Indexes

### Required Indexes

- `users.email` - Unique index for authentication lookups
- `anonymous_sessions.expiresAt` - For efficient cleanup queries
- `folders.userId` - For user folder queries
- `sessions.userId` - For user session queries
- `sessions.folderId` - For folder organization queries
- `mix_versions.sessionId` - For session version queries

### Future Optimization Indexes (if needed)

- `sessions.createdAt` - For sorting by creation date
- `mix_versions.createdAt` - For version chronology

---

## Sample Data Flow

### Anonymous User Workflow

1. User visits site → generate UUID → create `AnonymousSession` row
2. User uploads reference → analyze client-side → store in `data.referenceAnalysis`
3. User uploads mix v1 → analyze → calculate comparison → generate insights → append to `data.mixVersions`
4. User uploads mix v2, v3 → same process
5. After 24 hours → cron job deletes row

### Registered User Workflow

1. User logs in → query `Session` where `userId = user.id`
2. User creates session → insert `Session` row with `referenceAnalysis`
3. User uploads mix v1 → insert `MixVersion` row with `versionNumber = 1`
4. User uploads mix v2, v3 → insert additional `MixVersion` rows
5. User creates folder → insert `Folder` row
6. User moves session to folder → update `Session.folderId`
7. Sessions persist indefinitely

---

## Schema Validation

All JSON fields should be validated using Zod schemas (defined in `shared/` package):

- `ReferenceAnalysisSchema` - validates reference analysis structure
- `MixAnalysisSchema` - validates mix analysis structure
- `ComparisonSchema` - validates comparison deltas
- `InsightSchema` - validates insight object structure
- `AnonymousSessionDataSchema` - validates entire anonymous session data blob

These schemas ensure type safety across frontend and backend.
