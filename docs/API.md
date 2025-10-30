# Refera API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.refera.com/api
```

## Authentication

Most endpoints require JWT authentication via Bearer token.

**Header Format:**

```
Authorization: Bearer <jwt_token>
```

**Token Payload:**

```typescript
{
  userId: string,
  iat: number,
  exp: number
}
```

**Anonymous Sessions:**

- Identified by cookie: `anon_session_id=<uuid>`
- Automatically created on first visit
- No authentication required

---

## Response Format

### Success Response

```json
{
  "message": "Success message",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": "Additional error information (optional)"
}
```

---

## Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions or limit exceeded
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Authentication:** None

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "profileAvatar": "https://example.com/avatar.jpg" // optional
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "profileAvatar": "https://example.com/avatar.jpg"
  }
}
```

**Errors:**

- `400` - Missing required fields or invalid data
- `409` - Email already exists

---

#### Login User

```http
POST /api/auth/login
```

**Authentication:** None

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "profileAvatar": "https://example.com/avatar.jpg"
  }
}
```

**Errors:**

- `400` - Missing required fields
- `401` - Invalid email or password

---

### Analysis

#### Analyze Audio

```http
POST /api/analyze
```

**Authentication:** Optional (works for both anonymous and registered users)

**Description:** Accepts audio analysis results from client-side Web Audio API processing. Handles both reference tracks and mix versions. Automatically calculates comparisons and generates insights for mix versions.

**Request Body:**

```json
{
  "type": "reference" | "mix",
  "analysis": {
    "filename": "my_track.mp3",
    "lufs_integrated": -10.2,
    "true_peak": -0.5,
    "frequency_bands": {
      "sub_bass": -15.2,
      "bass": -12.5,
      "low_mids": -10.8,
      "mids": -8.3,
      "high_mids": -9.1,
      "highs": -12.4
    },
    "spectrum_data": [0.1, 0.2, 0.3] // optional
  },
  "referenceAnalysis": { /* required if type='mix' */ },
  "sessionId": "uuid" // optional, for adding to existing session
}
```

**Response (200) - Reference:**

```json
{
  "message": "Reference analysis stored successfully",
  "sessionId": "uuid",
  "analysis": {
    "filename": "reference.mp3",
    "lufs_integrated": -10.2,
    "true_peak": -0.5,
    "frequency_bands": {
      "sub_bass": -15.2,
      "bass": -12.5,
      "low_mids": -10.8,
      "mids": -8.3,
      "high_mids": -9.1,
      "highs": -12.4
    }
  }
}
```

**Response (200) - Mix:**

```json
{
  "message": "Mix analysis completed",
  "versionId": "uuid",
  "versionNumber": 1,
  "analysis": {
    "filename": "my_mix_v1.mp3",
    "lufs_integrated": -12.5,
    "true_peak": -1.2,
    "frequency_bands": {
      "sub_bass": -16.4,
      "bass": -11.7,
      "low_mids": -11.3,
      "mids": -7.2,
      "high_mids": -9.4,
      "highs": -11.8
    }
  },
  "comparison": {
    "lufs_delta": 2.3,
    "frequency_deltas": {
      "sub_bass": 1.2,
      "bass": -0.8,
      "low_mids": 0.5,
      "mids": -1.1,
      "high_mids": 0.3,
      "highs": -0.6
    }
  },
  "insights": [
    {
      "severity": "moderate",
      "category": "loudness",
      "message": "Your mix is 2.3 dB quieter than reference",
      "recommendation": "Increase overall level or apply gentle limiting"
    },
    {
      "severity": "minor",
      "category": "bass",
      "message": "Bass is 0.8 dB louder",
      "recommendation": "Bass is too prominent, reduce kick/bass or use EQ cut"
    }
  ]
}
```

**Errors:**

- `400` - Invalid analysis data or missing required fields
- `403` - Rate limit exceeded or version limit reached
- `404` - Session not found (if sessionId provided)

**Rate Limits:**

- Anonymous: 5 analyses per hour per IP
- Registered: 50 analyses per day per user

---

### Sessions (Registered Users Only)

#### List User Sessions

```http
GET /api/sessions
```

**Authentication:** Required

**Query Parameters:**

- `folderId` (optional) - Filter by folder (use "null" for root level sessions)
- `limit` (optional, default: 50) - Number of sessions to return
- `offset` (optional, default: 0) - Pagination offset

**Response (200):**

```json
{
  "message": "Sessions retrieved successfully",
  "sessions": [
    {
      "id": "uuid",
      "name": "My Rock Mix Session",
      "folderId": "uuid",
      "referenceAnalysis": {
        "filename": "reference.mp3",
        "lufs_integrated": -10.2,
        "true_peak": -0.5,
        "frequency_bands": {
          "sub_bass": -15.2,
          "bass": -12.5,
          "low_mids": -10.8,
          "mids": -8.3,
          "high_mids": -9.1,
          "highs": -12.4
        }
      },
      "mixVersionCount": 3,
      "createdAt": "2025-10-29T12:00:00Z",
      "updatedAt": "2025-10-29T14:30:00Z"
    }
  ],
  "total": 5
}
```

**Errors:**

- `401` - Not authenticated

---

#### Get Session Details

```http
GET /api/sessions/:id
```

**Authentication:** Required

**Description:** Returns full session details including all mix versions with their analyses, comparisons, and insights.

**Response (200):**

```json
{
  "message": "Session retrieved successfully",
  "session": {
    "id": "uuid",
    "name": "My Rock Mix Session",
    "folderId": "uuid",
    "referenceAnalysis": {
      "filename": "reference.mp3",
      "lufs_integrated": -10.2,
      "true_peak": -0.5,
      "frequency_bands": {
        "sub_bass": -15.2,
        "bass": -12.5,
        "low_mids": -10.8,
        "mids": -8.3,
        "high_mids": -9.1,
        "highs": -12.4
      }
    },
    "mixVersions": [
      {
        "id": "uuid",
        "versionNumber": 1,
        "analysis": {
          "filename": "mix_v1.mp3",
          "lufs_integrated": -12.5,
          "true_peak": -1.2,
          "frequency_bands": {
            "sub_bass": -16.4,
            "bass": -11.7,
            "low_mids": -11.3,
            "mids": -7.2,
            "high_mids": -9.4,
            "highs": -11.8
          }
        },
        "comparison": {
          "lufs_delta": 2.3,
          "frequency_deltas": {
            "sub_bass": 1.2,
            "bass": -0.8,
            "low_mids": 0.5,
            "mids": -1.1,
            "high_mids": 0.3,
            "highs": -0.6
          }
        },
        "insights": [
          {
            "severity": "moderate",
            "category": "loudness",
            "message": "Your mix is 2.3 dB quieter than reference",
            "recommendation": "Increase overall level or apply gentle limiting"
          }
        ],
        "createdAt": "2025-10-29T12:30:00Z"
      }
    ],
    "createdAt": "2025-10-29T12:00:00Z",
    "updatedAt": "2025-10-29T14:30:00Z"
  }
}
```

**Errors:**

- `401` - Not authenticated
- `403` - Not authorized (not session owner)
- `404` - Session not found

---

#### Create Session

```http
POST /api/sessions
```

**Authentication:** Required

**Description:** Creates a new session with a reference track analysis. Mix versions are added separately via POST /api/sessions/:id/versions.

**Request Body:**

```json
{
  "name": "My New Mix Session",
  "folderId": "uuid", // optional
  "referenceAnalysis": {
    "filename": "reference.mp3",
    "lufs_integrated": -10.2,
    "true_peak": -0.5,
    "frequency_bands": {
      "sub_bass": -15.2,
      "bass": -12.5,
      "low_mids": -10.8,
      "mids": -8.3,
      "high_mids": -9.1,
      "highs": -12.4
    }
  }
}
```

**Response (201):**

```json
{
  "message": "Session created successfully",
  "session": {
    "id": "uuid",
    "name": "My New Mix Session",
    "folderId": "uuid",
    "referenceAnalysis": {
      "filename": "reference.mp3",
      "lufs_integrated": -10.2,
      "true_peak": -0.5,
      "frequency_bands": {
        "sub_bass": -15.2,
        "bass": -12.5,
        "low_mids": -10.8,
        "mids": -8.3,
        "high_mids": -9.1,
        "highs": -12.4
      }
    },
    "createdAt": "2025-10-29T12:00:00Z",
    "updatedAt": "2025-10-29T12:00:00Z"
  }
}
```

**Errors:**

- `400` - Invalid request data
- `401` - Not authenticated
- `403` - Session limit reached (max 5 per user)
- `404` - Folder not found

---

#### Update Session

```http
PATCH /api/sessions/:id
```

**Authentication:** Required

**Description:** Updates session name and/or folder assignment. Reference analysis cannot be updated (delete and recreate session instead).

**Request Body:**

```json
{
  "name": "Updated Session Name", // optional
  "folderId": "uuid" // optional, null to move to root level
}
```

**Response (200):**

```json
{
  "message": "Session updated successfully",
  "session": {
    "id": "uuid",
    "name": "Updated Session Name",
    "folderId": "uuid",
    "updatedAt": "2025-10-29T15:00:00Z"
  }
}
```

**Errors:**

- `400` - Invalid request data
- `401` - Not authenticated
- `403` - Not authorized (not session owner)
- `404` - Session or folder not found

---

#### Delete Session

```http
DELETE /api/sessions/:id
```

**Authentication:** Required

**Description:** Deletes session and all associated mix versions (cascade delete).

**Response (200):**

```json
{
  "message": "Session deleted successfully"
}
```

**Errors:**

- `401` - Not authenticated
- `403` - Not authorized (not session owner)
- `404` - Session not found

---

#### Add Mix Version to Session

```http
POST /api/sessions/:id/versions
```

**Authentication:** Required

**Description:** Adds a new mix version to an existing session. Backend automatically calculates comparison deltas and generates insights based on the session's reference analysis.

**Request Body:**

```json
{
  "analysis": {
    "filename": "my_mix_v3.mp3",
    "lufs_integrated": -12.5,
    "true_peak": -1.2,
    "frequency_bands": {
      "sub_bass": -16.4,
      "bass": -11.7,
      "low_mids": -11.3,
      "mids": -7.2,
      "high_mids": -9.4,
      "highs": -11.8
    }
  }
}
```

**Response (201):**

```json
{
  "message": "Mix version added successfully",
  "mixVersion": {
    "id": "uuid",
    "sessionId": "uuid",
    "versionNumber": 3,
    "analysis": {
      "filename": "my_mix_v3.mp3",
      "lufs_integrated": -12.5,
      "true_peak": -1.2,
      "frequency_bands": {
        "sub_bass": -16.4,
        "bass": -11.7,
        "low_mids": -11.3,
        "mids": -7.2,
        "high_mids": -9.4,
        "highs": -11.8
      }
    },
    "comparison": {
      "lufs_delta": 2.3,
      "frequency_deltas": {
        "sub_bass": 1.2,
        "bass": -0.8,
        "low_mids": 0.5,
        "mids": -1.1,
        "high_mids": 0.3,
        "highs": -0.6
      }
    },
    "insights": [
      {
        "severity": "moderate",
        "category": "loudness",
        "message": "Your mix is 2.3 dB quieter than reference",
        "recommendation": "Increase overall level or apply gentle limiting"
      }
    ],
    "createdAt": "2025-10-29T15:30:00Z"
  }
}
```

**Errors:**

- `400` - Invalid analysis data
- `401` - Not authenticated
- `403` - Not authorized or version limit reached (max 5 per session)
- `404` - Session not found

---

### Folders (Registered Users Only)

#### List User Folders

```http
GET /api/folders
```

**Authentication:** Required

**Description:** Returns all folders for the authenticated user, including session count per folder.

**Response (200):**

```json
{
  "message": "Folders retrieved successfully",
  "folders": [
    {
      "id": "uuid",
      "name": "Rock Mixes",
      "sessionCount": 3,
      "createdAt": "2025-10-29T10:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Electronic Music",
      "sessionCount": 1,
      "createdAt": "2025-10-29T11:00:00Z"
    }
  ],
  "total": 2
}
```

**Errors:**

- `401` - Not authenticated

---

#### Create Folder

```http
POST /api/folders
```

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Electronic Music"
}
```

**Response (201):**

```json
{
  "message": "Folder created successfully",
  "folder": {
    "id": "uuid",
    "name": "Electronic Music",
    "createdAt": "2025-10-29T16:00:00Z"
  }
}
```

**Errors:**

- `400` - Missing folder name
- `401` - Not authenticated
- `403` - Folder limit reached (max 5 per user)

---

#### Update Folder

```http
PATCH /api/folders/:id
```

**Authentication:** Required

**Description:** Renames a folder. Folder names don't need to be unique.

**Request Body:**

```json
{
  "name": "Updated Folder Name"
}
```

**Response (200):**

```json
{
  "message": "Folder updated successfully",
  "folder": {
    "id": "uuid",
    "name": "Updated Folder Name"
  }
}
```

**Errors:**

- `400` - Missing folder name
- `401` - Not authenticated
- `403` - Not authorized (not folder owner)
- `404` - Folder not found

---

#### Delete Folder

```http
DELETE /api/folders/:id
```

**Authentication:** Required

**Description:** Deletes folder. Sessions in the folder are moved to root level (folderId set to null), not deleted.

**Response (200):**

```json
{
  "message": "Folder deleted successfully"
}
```

**Errors:**

- `401` - Not authenticated
- `403` - Not authorized (not folder owner)
- `404` - Folder not found

---

### Anonymous Sessions

#### Get Anonymous Session

```http
GET /api/anonymous/session
```

**Authentication:** Cookie (`anon_session_id`)

**Description:** Retrieves the current anonymous session data. If no session exists, returns a new session ID for the client to set as a cookie.

**Response (200) - Existing Session:**

```json
{
  "message": "Anonymous session retrieved",
  "session": {
    "id": "uuid",
    "data": {
      "referenceAnalysis": {
        "filename": "reference.mp3",
        "lufs_integrated": -10.2,
        "true_peak": -0.5,
        "frequency_bands": {
          "sub_bass": -15.2,
          "bass": -12.5,
          "low_mids": -10.8,
          "mids": -8.3,
          "high_mids": -9.1,
          "highs": -12.4
        }
      },
      "mixVersions": [
        {
          "versionNumber": 1,
          "analysis": {
            "filename": "mix_v1.mp3",
            "lufs_integrated": -12.5,
            "true_peak": -1.2,
            "frequency_bands": {
              "sub_bass": -16.4,
              "bass": -11.7,
              "low_mids": -11.3,
              "mids": -7.2,
              "high_mids": -9.4,
              "highs": -11.8
            }
          },
          "comparison": {
            "lufs_delta": 2.3,
            "frequency_deltas": {
              "sub_bass": 1.2,
              "bass": -0.8,
              "low_mids": 0.5,
              "mids": -1.1,
              "high_mids": 0.3,
              "highs": -0.6
            }
          },
          "insights": [
            {
              "severity": "moderate",
              "category": "loudness",
              "message": "Your mix is 2.3 dB quieter than reference",
              "recommendation": "Increase overall level or apply gentle limiting"
            }
          ]
        }
      ]
    },
    "expiresAt": "2025-10-30T12:00:00Z",
    "createdAt": "2025-10-29T12:00:00Z"
  }
}
```

**Response (404) - No Session:**

```json
{
  "message": "No active anonymous session",
  "sessionId": "new-uuid-here"
}
```

**Note:** Client should set cookie: `anon_session_id=<sessionId>`

---

#### Convert Anonymous to Registered

```http
POST /api/anonymous/convert
```

**Authentication:** Required (JWT) + Cookie (`anon_session_id`)

**Description:** Converts an anonymous session to a permanent registered session. Creates a new Session and MixVersion rows from the anonymous session data, then deletes the anonymous session.

**Response (200):**

```json
{
  "message": "Anonymous session converted successfully",
  "session": {
    "id": "uuid",
    "name": "Converted Session",
    "referenceAnalysis": {
      "filename": "reference.mp3",
      "lufs_integrated": -10.2,
      "true_peak": -0.5,
      "frequency_bands": {
        "sub_bass": -15.2,
        "bass": -12.5,
        "low_mids": -10.8,
        "mids": -8.3,
        "high_mids": -9.1,
        "highs": -12.4
      }
    },
    "mixVersions": [
      {
        "id": "uuid",
        "versionNumber": 1,
        "analysis": {
          /* ... */
        },
        "comparison": {
          /* ... */
        },
        "insights": [
          /* ... */
        ],
        "createdAt": "2025-10-29T16:30:00Z"
      }
    ],
    "createdAt": "2025-10-29T16:30:00Z"
  }
}
```

**Errors:**

- `400` - No anonymous session found
- `401` - Not authenticated
- `403` - Session limit reached (max 5 per user)

---

## Rate Limiting

### Anonymous Users

- **Limit:** 5 analyses per hour
- **Identifier:** IP address
- **Header:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Response (429):**

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600,
  "limit": 5,
  "remaining": 0
}
```

### Registered Users

- **Limit:** 50 analyses per day
- **Identifier:** User ID
- **Header:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Response (429):**

```json
{
  "error": "Daily analysis limit reached",
  "retryAfter": 43200,
  "limit": 50,
  "remaining": 0
}
```

---

## Resource Limits

### Anonymous Users

- **Sessions:** 1 active (24 hour TTL)
- **Mix Versions:** 3 per session
- **File Size:** 100MB max (enforced client-side)

### Registered Users

- **Sessions:** 5 max
- **Folders:** 5 max
- **Mix Versions:** 5 per session
- **File Size:** 200MB max (enforced client-side)

**Limit Exceeded Response (403):**

```json
{
  "error": "Resource limit reached",
  "limit": 5,
  "current": 5,
  "message": "Delete a session to create a new one"
}
```

---

## Validation

All requests are validated using Zod schemas from the `shared` package.

**Validation Error (400):**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## CORS Configuration

**Allowed Origins:**

- `http://localhost:5173` (development)
- `https://refera.com` (production)

**Allowed Methods:**

- `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`

**Allowed Headers:**

- `Content-Type`, `Authorization`

**Credentials:**

- Enabled (required for cookie-based anonymous sessions)

---

## Example Workflows

### Anonymous User Workflow

```javascript
// 1. Client generates session ID and sets cookie
const sessionId = crypto.randomUUID();
document.cookie = `anon_session_id=${sessionId}`;

// 2. User uploads and analyzes reference
const referenceAnalysis = await analyzeAudio(referenceFile);
await fetch("/api/analyze", {
  method: "POST",
  body: JSON.stringify({
    type: "reference",
    analysis: referenceAnalysis,
  }),
});

// 3. User uploads and analyzes mix v1
const mixAnalysis = await analyzeAudio(mixFile);
const response = await fetch("/api/analyze", {
  method: "POST",
  body: JSON.stringify({
    type: "mix",
    analysis: mixAnalysis,
    referenceAnalysis: referenceAnalysis,
  }),
});
// Backend returns comparison + insights

// 4. Retrieve session data
const session = await fetch("/api/anonymous/session");
```

### Registered User Workflow

```javascript
// 1. Login
const { token } = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
}).then((r) => r.json());

// 2. Create session with reference
const referenceAnalysis = await analyzeAudio(referenceFile);
const { session } = await fetch("/api/sessions", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    name: "My Rock Mix",
    referenceAnalysis,
  }),
}).then((r) => r.json());

// 3. Add mix versions
const mixAnalysis = await analyzeAudio(mixFile);
await fetch(`/api/sessions/${session.id}/versions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ analysis: mixAnalysis }),
});

// 4. List all sessions
const { sessions } = await fetch("/api/sessions", {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// 5. Organize into folder
const { folder } = await fetch("/api/folders", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ name: "Rock Mixes" }),
}).then((r) => r.json());

await fetch(`/api/sessions/${session.id}`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ folderId: folder.id }),
});
```

### Anonymous to Registered Conversion

```javascript
// 1. User has been using app anonymously
// Cookie: anon_session_id=<uuid>

// 2. User signs up
const { token } = await fetch("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ name, email, password }),
}).then((r) => r.json());

// 3. Convert anonymous session
const { session } = await fetch("/api/anonymous/convert", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  credentials: "include", // sends cookie
}).then((r) => r.json());

// 4. Clear cookie and redirect
document.cookie = "anon_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
window.location.href = "/dashboard";
```
