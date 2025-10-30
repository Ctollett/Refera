# Refera Frontend Hierarchy

## Overview

The frontend is a React application built with TypeScript, using React Router for navigation, Zustand for global state, and React Query for server state management. The interface is designed for both anonymous and registered users with shared components and different permission levels.

## Application Structure

```
src/
├── App.tsx                      # Root component, routing
├── main.tsx                     # Entry point
├── pages/                       # Page-level components
│   ├── WelcomePage.tsx
│   ├── DashboardPage.tsx
│   └── AnalysisPage.tsx
├── components/                  # Reusable components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   ├── auth/
│   │   ├── LoginModal.tsx
│   │   ├── SignupModal.tsx
│   │   └── AuthForm.tsx
│   ├── dashboard/
│   │   ├── SessionGrid.tsx
│   │   ├── SessionCard.tsx
│   │   ├── FolderFilter.tsx
│   │   ├── CreateSessionButton.tsx
│   │   └── DeleteSessionModal.tsx
│   ├── analysis/
│   │   ├── AudioDropzone.tsx
│   │   ├── ReferenceDropzone.tsx
│   │   ├── MixDropzone.tsx
│   │   ├── VersionSelector.tsx
│   │   ├── AnalysisTabs.tsx
│   │   ├── OverviewTab.tsx
│   │   ├── LoudnessTab.tsx
│   │   ├── FrequencyTab.tsx
│   │   ├── SpectrumTab.tsx
│   │   └── InsightsPanel.tsx
│   ├── charts/
│   │   ├── LoudnessChart.tsx
│   │   ├── FrequencyBarsChart.tsx
│   │   └── SpectrumChart.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
├── services/                    # API and audio services
│   ├── api/
│   │   ├── authService.ts
│   │   ├── sessionService.ts
│   │   ├── analysisService.ts
│   │   └── folderService.ts
│   └── audio/
│       ├── audioAnalyzer.ts    # Web Audio API wrapper
│       ├── lufsCalculator.ts   # LUFS implementation
│       ├── peakDetector.ts     # True peak calculation
│       └── frequencyAnalyzer.ts # FFT and band aggregation
├── stores/                      # Zustand stores
│   ├── authStore.ts
│   ├── sessionStore.ts
│   └── analysisStore.ts
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useAudioAnalysis.ts
│   ├── useSessions.ts
│   └── useAnonymousSession.ts
├── types/                       # TypeScript types
│   ├── audio.types.ts
│   ├── session.types.ts
│   └── user.types.ts
└── utils/                       # Utility functions
    ├── formatters.ts
    ├── validators.ts
    └── constants.ts
```

---

## Routing

### Route Structure

```typescript
<Routes>
  <Route path="/" element={<WelcomePage />} />
  <Route path="/analyze" element={<AnalysisPage anonymous />} />
  <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
  <Route path="/session/:id" element={<PrivateRoute><AnalysisPage /></PrivateRoute>} />
</Routes>
```

### Route Details

| Route          | Component       | Authentication | Description                                  |
| -------------- | --------------- | -------------- | -------------------------------------------- |
| `/`            | `WelcomePage`   | Public         | Landing page with signup/login/guest options |
| `/analyze`     | `AnalysisPage`  | Public         | Anonymous session analysis (no save)         |
| `/dashboard`   | `DashboardPage` | Required       | User's saved sessions and folders            |
| `/session/:id` | `AnalysisPage`  | Required       | Individual session with save capability      |

### Navigation Flow

```
Welcome Page (/)
    ├─ "Continue as Guest" → /analyze (anonymous)
    ├─ "Sign Up" → Modal → /dashboard
    └─ "Login" → Modal → /dashboard

Dashboard (/dashboard)
    ├─ "New Session" → Upload reference → Create session → /session/:id
    └─ Click session card → /session/:id

Analysis Page (/analyze or /session/:id)
    ├─ Upload reference
    ├─ Upload mix versions
    ├─ View analysis results
    └─ [Registered only] Save session
```

---

## Pages

### WelcomePage

**Location:** `src/pages/WelcomePage.tsx`

**Purpose:** Landing page explaining the app with authentication options

**Layout:**

```
┌───────────────────────────────────────────┐
│  Header (logo, "About")                   │
├───────────────────────────────────────────┤
│                                           │
│  Hero Section                             │
│  "Compare your mixes against references"  │
│                                           │
│  [Continue as Guest]                      │
│  [Sign Up]  [Login]                       │
│                                           │
├───────────────────────────────────────────┤
│  Features Section                         │
│  - LUFS Analysis                          │
│  - Frequency Comparison                   │
│  - Actionable Insights                    │
├───────────────────────────────────────────┤
│  Footer                                   │
└───────────────────────────────────────────┘
```

**Components Used:**

- `Header`
- `Button`
- `LoginModal` (when "Login" clicked)
- `SignupModal` (when "Sign Up" clicked)
- `Footer`

**Interactions:**

- "Continue as Guest" → navigate to `/analyze`
- "Sign Up" → open `SignupModal` → on success → navigate to `/dashboard`
- "Login" → open `LoginModal` → on success → navigate to `/dashboard`

---

### DashboardPage

**Location:** `src/pages/DashboardPage.tsx`

**Purpose:** Display and manage user's saved sessions and folders

**Layout:**

```
┌───────────────────────────────────────────────────────────┐
│  Header (logo, user menu, "New Session")                  │
├───────────────────────────────────────────────────────────┤
│  Folder Filter: [All] [Rock] [Electronic] [+ New Folder] │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Session Grid (3 columns)                                │
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Session 1  │  │ Session 2  │  │ Session 3  │         │
│  │ Rock Mix   │  │ EDM Track  │  │ Pop Song   │         │
│  │            │  │            │  │            │         │
│  │ 3 versions │  │ 2 versions │  │ 5 versions │         │
│  │ 2 days ago │  │ 1 week ago │  │ 3 weeks ago│         │
│  │            │  │            │  │            │         │
│  │ [Open] [⋮] │  │ [Open] [⋮] │  │ [Open] [⋮] │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│                                                           │
│  ┌────────────┐  ┌────────────┐                          │
│  │ Session 4  │  │ + New      │                          │
│  │ Jazz Track │  │   Session  │                          │
│  └────────────┘  └────────────┘                          │
│                                                           │
├───────────────────────────────────────────────────────────┤
│  Footer                                                   │
└───────────────────────────────────────────────────────────┘
```

**Components Used:**

- `Header`
- `FolderFilter`
- `SessionGrid`
  - `SessionCard` (repeated)
  - `CreateSessionButton`
- `DeleteSessionModal` (when delete clicked)
- `Footer`

**State:**

- Current folder filter (from URL query param or state)
- Sessions list (from React Query)
- Folders list (from React Query)

**Interactions:**

- Click folder → filter sessions by folder
- Click "New Session" → open file picker → upload reference → create session → navigate to `/session/:id`
- Click session card → navigate to `/session/:id`
- Click card menu (⋮) → show options: Rename, Move to Folder, Delete
- Delete → open `DeleteSessionModal` → confirm → delete session → refresh list

**Data Loading:**

```typescript
// Fetch sessions and folders
const { data: sessions } = useQuery({
  queryKey: ["sessions", folderId],
  queryFn: () => sessionService.list({ folderId }),
});

const { data: folders } = useQuery({
  queryKey: ["folders"],
  queryFn: () => folderService.list(),
});
```

---

### AnalysisPage

**Location:** `src/pages/AnalysisPage.tsx`

**Purpose:** Upload audio files, view analysis results, and insights

**Props:**

```typescript
interface AnalysisPageProps {
  anonymous?: boolean; // true for /analyze, false for /session/:id
}
```

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Header (logo, back to dashboard, [Save] for registered)   │
├─────────────────────────────────────────────────────────────┤
│  Session Name: "My Rock Mix"  [Rename] [Export]            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Reference Track                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Drop reference track here or click to browse       │   │
│  │  (Displays filename + analysis when uploaded)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Mix Versions                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [v1] [v2] [v3] [+ Upload New Mix]                  │   │
│  │                                                      │   │
│  │  Drop mix version here or click to browse           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Analysis Tabs                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Overview] [Loudness] [Frequency] [Spectrum]       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  (Tab content displays here)                        │   │
│  │                                                      │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Insights                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚠ MODERATE: Your mix is 2.3 dB quieter            │   │
│  │  💡 Increase overall level or apply gentle limiting │   │
│  │                                                      │   │
│  │  ⚠ MINOR: Bass is 0.8 dB louder                     │   │
│  │  💡 Bass is too prominent, reduce kick/bass         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

**Components Used:**

- `Header`
- `ReferenceDropzone`
- `MixDropzone`
- `VersionSelector`
- `AnalysisTabs`
  - `OverviewTab`
  - `LoudnessTab`
  - `FrequencyTab`
  - `SpectrumTab`
- `InsightsPanel`
- `Footer`

**State:**

- Session data (reference analysis, mix versions)
- Current selected mix version
- Current active tab
- Loading states for file processing
- Analysis results

**User Flow:**

1. **Upload Reference:**
   - User drops/selects audio file
   - `audioAnalyzer.analyze(file)` runs (Web Audio API)
   - Loading state shows progress
   - Results displayed in reference section
   - If registered: auto-save to session
   - If anonymous: store in local state + cookie session

2. **Upload Mix Version:**
   - User drops/selects audio file
   - `audioAnalyzer.analyze(file)` runs
   - Send analysis to backend via `POST /api/analyze`
   - Backend calculates deltas + generates insights
   - Display results in tabs
   - Show insights panel
   - If registered: auto-save as new MixVersion

3. **Switch Between Versions:**
   - Click version tab (v1, v2, v3...)
   - Update displayed analysis data
   - Update insights panel
   - Charts re-render with new data

4. **Navigate Tabs:**
   - Click tab (Overview, Loudness, etc.)
   - Display corresponding content
   - Insights remain visible below

**Anonymous vs Registered Differences:**

| Feature          | Anonymous                       | Registered                  |
| ---------------- | ------------------------------- | --------------------------- |
| **Session Name** | "Anonymous Session" (read-only) | Editable name               |
| **Save Button**  | Hidden                          | Visible, auto-saves changes |
| **Export**       | PNG only                        | PNG (PDF in Phase 2)        |
| **Mix Limit**    | 3 versions                      | 5 versions                  |
| **Persistence**  | 24 hours                        | Permanent                   |
| **Back Button**  | Goes to "/"                     | Goes to "/dashboard"        |

---

## Component Details

### Layout Components

#### Header

**Location:** `src/components/layout/Header.tsx`

**Props:**

```typescript
interface HeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode; // For page-specific buttons
}
```

**Displays:**

- Logo (links to `/` or `/dashboard` based on auth)
- Back button (if `showBackButton`)
- User menu (if authenticated)
  - Profile
  - Settings
  - Logout
- Guest CTA (if anonymous)

---

### Dashboard Components

#### SessionCard

**Location:** `src/components/dashboard/SessionCard.tsx`

**Props:**

```typescript
interface SessionCardProps {
  session: {
    id: string;
    name: string;
    mixVersionCount: number;
    createdAt: string;
    updatedAt: string;
  };
  onOpen: () => void;
  onDelete: () => void;
  onRename: () => void;
}
```

**Layout:**

```
┌────────────────────┐
│ Session Name       │
│                    │
│ 3 versions         │
│ 2 days ago         │
│                    │
│ [Open]      [⋮]    │
└────────────────────┘
```

**Interactions:**

- Click card or "Open" → `onOpen()`
- Click menu (⋮) → show dropdown
  - Rename → `onRename()`
  - Move to Folder → show folder picker
  - Delete → `onDelete()`

---

#### FolderFilter

**Location:** `src/components/dashboard/FolderFilter.tsx`

**Props:**

```typescript
interface FolderFilterProps {
  folders: Folder[];
  currentFolderId: string | null;
  onFilterChange: (folderId: string | null) => void;
  onCreateFolder: () => void;
}
```

**Layout:**

```
[All] [Rock] [Electronic] [+ New Folder]
```

**Behavior:**

- Clicking folder filters sessions
- "All" shows sessions in all folders + root level
- "+ New Folder" opens modal to create folder

---

### Analysis Components

#### AudioDropzone

**Base component for both reference and mix uploads**

**Location:** `src/components/analysis/AudioDropzone.tsx`

**Props:**

```typescript
interface AudioDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string; // ".mp3,.wav,.aiff"
  maxSize: number; // 100MB or 200MB
  disabled?: boolean;
  label: string;
}
```

**States:**

- Idle: "Drop file here or click to browse"
- Hover: Highlight border
- Processing: Loading spinner + "Analyzing..."
- Complete: Show filename + checkmark
- Error: Show error message

---

#### VersionSelector

**Location:** `src/components/analysis/VersionSelector.tsx`

**Props:**

```typescript
interface VersionSelectorProps {
  versions: MixVersion[];
  currentVersionId: string;
  onVersionSelect: (id: string) => void;
  onUploadNew: () => void;
  maxVersions: number; // 3 or 5
}
```

**Layout:**

```
[v1] [v2] [v3] [+ Upload New]
```

**Behavior:**

- Click version tab → load that version's data
- "+ Upload New" → trigger file picker
- Disable "+ Upload New" when limit reached

---

#### AnalysisTabs

**Location:** `src/components/analysis/AnalysisTabs.tsx`

**Props:**

```typescript
interface AnalysisTabsProps {
  mixVersion: MixVersion;
  referenceAnalysis: ReferenceAnalysis;
}
```

**Tabs:**

1. **Overview** - Summary of all metrics
2. **Loudness** - LUFS and true peak details
3. **Frequency** - 6-band comparison
4. **Spectrum** - Full frequency visualization

**Layout:**

```
┌─────────────────────────────────────────┐
│ [Overview] [Loudness] [Frequency] [...] │
├─────────────────────────────────────────┤
│                                         │
│  (Active tab content)                   │
│                                         │
└─────────────────────────────────────────┘
```

---

#### OverviewTab

**Location:** `src/components/analysis/OverviewTab.tsx`

**Displays:**

- LUFS comparison (reference vs mix)
- True peak comparison
- Quick frequency band summary (all 6 bands at a glance)
- Top 3 most critical insights

**Layout:**

```
┌─────────────────────────────────────┐
│  Loudness                           │
│  Reference: -10.2 LUFS              │
│  Your Mix:  -12.5 LUFS              │
│  Delta:     -2.3 dB (quieter) ⚠️    │
├─────────────────────────────────────┤
│  True Peak                          │
│  Reference: -0.5 dBTP               │
│  Your Mix:  -1.2 dBTP               │
├─────────────────────────────────────┤
│  Frequency Balance (at a glance)    │
│  Sub Bass:  +1.2 dB                 │
│  Bass:      -0.8 dB                 │
│  Low Mids:  +0.5 dB                 │
│  Mids:      -1.1 dB                 │
│  High Mids: +0.3 dB                 │
│  Highs:     -0.6 dB                 │
└─────────────────────────────────────┘
```

---

#### LoudnessTab

**Location:** `src/components/analysis/LoudnessTab.tsx`

**Displays:**

- Detailed LUFS comparison with chart
- True peak comparison with chart
- Loudness history (if multiple versions)

**Uses:**

- `LoudnessChart` component (Recharts bar chart)

---

#### FrequencyTab

**Location:** `src/components/analysis/FrequencyTab.tsx`

**Displays:**

- 6-band frequency comparison
- Bar chart showing deltas
- Detailed dB values for each band

**Uses:**

- `FrequencyBarsChart` component (Recharts bar chart)

**Layout:**

```
┌─────────────────────────────────────┐
│  Frequency Band Comparison          │
│                                     │
│  [Bar Chart - 6 bands]              │
│   Sub Bass: +1.2 dB                 │
│   Bass:     -0.8 dB                 │
│   ...                               │
│                                     │
├─────────────────────────────────────┤
│  Detailed Values                    │
│  Sub Bass (20-60Hz)                 │
│    Reference: -15.2 dB              │
│    Your Mix:  -16.4 dB              │
│    Delta:     +1.2 dB               │
└─────────────────────────────────────┘
```

---

#### SpectrumTab

**Location:** `src/components/analysis/SpectrumTab.tsx`

**Displays:**

- Full frequency spectrum visualization
- Overlay of reference vs mix
- Interactive frequency range selector

**Uses:**

- `SpectrumChart` component (Recharts line chart)

---

#### InsightsPanel

**Location:** `src/components/analysis/InsightsPanel.tsx`

**Props:**

```typescript
interface InsightsPanelProps {
  insights: Insight[];
}
```

**Layout:**

```
┌──────────────────────────────────────────┐
│  Insights                                │
├──────────────────────────────────────────┤
│  ⚠️ MAJOR: Your mix is 3.2 dB quieter    │
│  💡 Increase overall level or apply      │
│     gentle limiting                      │
├──────────────────────────────────────────┤
│  ⚠️ MODERATE: Bass is 2.1 dB louder      │
│  💡 Bass is too prominent, reduce        │
│     kick/bass or use EQ cut              │
├──────────────────────────────────────────┤
│  ✅ MINOR: Your mix is very close!       │
│  💡 Great work! Only minor tweaks needed │
└──────────────────────────────────────────┘
```

**Severity Colors:**

- Major: Red
- Moderate: Orange
- Minor: Yellow/Green

---

## State Management

### Global State (Zustand)

#### authStore

**Location:** `src/stores/authStore.ts`

**State:**

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

#### analysisStore

**Location:** `src/stores/analysisStore.ts`

**State:**

```typescript
interface AnalysisState {
  currentVersion: string | null;
  currentTab: "overview" | "loudness" | "frequency" | "spectrum";
  isProcessing: boolean;
  setCurrentVersion: (id: string) => void;
  setCurrentTab: (tab: string) => void;
}
```

---

### Server State (React Query)

**Key Queries:**

```typescript
// Fetch user sessions
useQuery({
  queryKey: ["sessions", folderId],
  queryFn: () => sessionService.list({ folderId }),
});

// Fetch single session
useQuery({
  queryKey: ["session", sessionId],
  queryFn: () => sessionService.get(sessionId),
});

// Fetch folders
useQuery({
  queryKey: ["folders"],
  queryFn: () => folderService.list(),
});

// Get anonymous session
useQuery({
  queryKey: ["anonymousSession"],
  queryFn: () => anonymousService.get(),
});
```

**Key Mutations:**

```typescript
// Create session
useMutation({
  mutationFn: (data) => sessionService.create(data),
  onSuccess: () => queryClient.invalidateQueries(["sessions"]),
});

// Upload mix version
useMutation({
  mutationFn: ({ sessionId, analysis }) => sessionService.addVersion(sessionId, analysis),
  onSuccess: () => queryClient.invalidateQueries(["session", sessionId]),
});

// Delete session
useMutation({
  mutationFn: (sessionId) => sessionService.delete(sessionId),
  onSuccess: () => queryClient.invalidateQueries(["sessions"]),
});
```

---

## Services

### Audio Analysis Service

**Location:** `src/services/audio/audioAnalyzer.ts`

**Key Functions:**

```typescript
/**
 * Analyzes an audio file and returns complete analysis data
 */
export async function analyzeAudioFile(file: File): Promise<AnalysisResult> {
  // TODO: Implement
  // 1. Decode audio file using Web Audio API
  // 2. Calculate LUFS
  // 3. Calculate true peak
  // 4. Run FFT analysis
  // 5. Aggregate into 6 frequency bands
  // 6. Return analysis object
}
```

**Sub-modules:**

#### lufsCalculator.ts

```typescript
/**
 * Calculates LUFS (ITU-R BS.1770-4)
 */
export function calculateLUFS(audioBuffer: AudioBuffer): number {
  // TODO: Implement LUFS calculation
}
```

#### peakDetector.ts

```typescript
/**
 * Calculates true peak value
 */
export function calculateTruePeak(audioBuffer: AudioBuffer): number {
  // TODO: Implement true peak detection
}
```

#### frequencyAnalyzer.ts

```typescript
/**
 * Performs FFT and aggregates into 6 bands
 */
export function analyzeFrequencyBands(audioBuffer: AudioBuffer): FrequencyBands {
  // TODO: Implement FFT analysis and band aggregation
}
```

---

### API Service

**Location:** `src/services/api/`

**authService.ts:**

```typescript
export const authService = {
  register: (data: RegisterData) => axios.post("/api/auth/register", data),
  login: (data: LoginData) => axios.post("/api/auth/login", data),
};
```

**sessionService.ts:**

```typescript
export const sessionService = {
  list: (params?: { folderId?: string }) => axios.get("/api/sessions", { params }),
  get: (id: string) => axios.get(`/api/sessions/${id}`),
  create: (data: CreateSessionData) => axios.post("/api/sessions", data),
  update: (id: string, data: UpdateSessionData) => axios.patch(`/api/sessions/${id}`, data),
  delete: (id: string) => axios.delete(`/api/sessions/${id}`),
  addVersion: (id: string, analysis: AnalysisData) =>
    axios.post(`/api/sessions/${id}/versions`, { analysis }),
};
```

**analysisService.ts:**

```typescript
export const analysisService = {
  analyze: (data: AnalyzeData) => axios.post("/api/analyze", data),
};
```

---

## Custom Hooks

### useAuth

**Location:** `src/hooks/useAuth.ts`

**Purpose:** Provides authentication state and actions

```typescript
export function useAuth() {
  const { user, token, isAuthenticated, login, register, logout } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
```

---

### useAudioAnalysis

**Location:** `src/hooks/useAudioAnalysis.ts`

**Purpose:** Handles audio file analysis

```typescript
export function useAudioAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFile = async (file: File): Promise<AnalysisResult> => {
    // TODO: Implement
    // 1. Validate file format and size
    // 2. Call audioAnalyzer.analyzeAudioFile()
    // 3. Handle errors
    // 4. Return results
  };

  return { analyzeFile, isProcessing, error };
}
```

---

### useSessions

**Location:** `src/hooks/useSessions.ts`

**Purpose:** Manages session data fetching and mutations

```typescript
export function useSessions(folderId?: string) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", folderId],
    queryFn: () => sessionService.list({ folderId }),
  });

  const createMutation = useMutation({
    mutationFn: sessionService.create,
    onSuccess: () => queryClient.invalidateQueries(["sessions"]),
  });

  return {
    sessions,
    isLoading,
    createSession: createMutation.mutate,
  };
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Single column layout */
  /* Stack dropzones vertically */
  /* Full-width session cards */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 2 column grid for sessions */
  /* Side-by-side dropzones */
}

/* Desktop */
@media (min-width: 1025px) {
  /* 3 column grid for sessions */
  /* Full layout as designed */
}
```

### Mobile Considerations

- Collapsible version selector (drawer)
- Swipe between tabs
- Compact insights panel
- Touch-friendly dropzones
- Simplified charts for small screens

---

## Accessibility

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for tab navigation
- Escape to close modals

### Screen Readers

- Proper ARIA labels on all interactive elements
- Alt text for charts (describe data)
- Live regions for analysis status updates
- Semantic HTML (header, nav, main, footer)

### Visual Accessibility

- High contrast mode support
- Focus indicators on all interactive elements
- Color is not the only indicator (use icons + text)
- Minimum font size 16px
- Adequate spacing between clickable elements (44px minimum)

---

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
```

### Memoization

```typescript
// Memoize expensive chart components
const LoudnessChart = memo(LoudnessChartComponent);

// Memoize heavy computations
const frequencyData = useMemo(() => processFrequencyBands(mixVersion.analysis), [mixVersion]);
```

### Audio Processing

- Use Web Workers for heavy audio calculations
- Process audio in chunks to avoid blocking UI
- Show progress indicators during analysis

---

## Error Boundaries

### Global Error Boundary

Wraps entire app to catch rendering errors

### Analysis Error Boundary

Wraps analysis page to handle audio processing errors

**Error States:**

- File format not supported
- File too large
- Browser doesn't support Web Audio API
- Network error during save
- Session not found (404)
- Rate limit exceeded (429)

---

## Future Enhancements

### Phase 2

- PDF export functionality
- Stereo field visualization
- Dynamic range analysis
- History view (compare multiple sessions)
- Keyboard shortcuts

### Phase 3

- Real-time collaboration (share sessions)
- Custom insight rules
- Batch analysis
- A/B listening mode
- Dark mode support
- Mobile app (React Native)

---

## Development Guidelines

### Component Guidelines

- One component per file
- Use TypeScript for all components
- Props interface defined at top of file
- Export component as default
- Keep components under 300 lines (split if larger)

### Naming Conventions

- Components: PascalCase (e.g., `SessionCard.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useAuth.ts`)
- Services: camelCase (e.g., `authService.ts`)
- Stores: camelCase with "Store" suffix (e.g., `authStore.ts`)

### File Organization

- Group by feature, not by type
- Keep related components together
- Shared components in `/common`
- Feature-specific components in feature folder

### Testing

- Unit tests for audio analysis functions
- Component tests for UI components
- Integration tests for user flows
- E2E tests for critical paths (signup, analysis, save)
