# Refera Tech Stack

## Architecture

**Monorepo Structure** (npm workspaces)

- `client/` - React frontend
- `server/` - Express backend
- `shared/` - Shared types & validation schemas

---

## Frontend (Client)

### Core Framework

- **React** 19.1
- **TypeScript** 5.9
- **Vite** 7 (build tool + dev server)

### Styling

- **Tailwind CSS** 4.1 (utility-first, custom design system)
- **PostCSS** + Autoprefixer
- **Custom CSS** (complex animations, audio visualizations)

### State Management

- **Zustand** 5.0 (global state)
- **React Query / TanStack Query** 5.90 (server state, caching)

### Routing

- **React Router** 7.9

### Audio Processing

- **Web Audio API** (native browser API - all audio analysis happens here)
  - File decoding (MP3, WAV, AIFF)
  - LUFS calculation (JavaScript implementation)
  - True Peak detection
  - FFT analysis (AnalyserNode)
  - Frequency band aggregation (20Hz-20kHz → 6 bands)

### Forms & Validation

- **React Hook Form** (form handling)
- **Zod** (schema validation, shared with backend)

### File Upload

- **react-dropzone** (drag-and-drop UI)

### Data Visualization

- **Recharts** (frequency spectrum charts, LUFS comparisons)

### Export

- **html-to-canvas** (PNG reports)
- **jsPDF** (PDF reports - Phase 2)

### HTTP Client

- **Axios** 1.12

### Auth

- **jwt-decode** (decode JWT tokens)

---

## Backend (Server)

### Runtime & Framework

- **Node.js**
- **Express.js** 4.21
- **TypeScript** 5.7
- **tsx** (TypeScript execution + hot reload)

### Database

- **PostgreSQL**
- **Prisma** 6.1 (ORM + migrations)
- **@prisma/client**

### Authentication

- **jsonwebtoken** (JWT generation/verification)
- **bcryptjs** (password hashing)

### Security & Middleware

- **cors** (cross-origin requests)
- **cookie-parser** (anonymous session cookies)
- **helmet** (security headers)
- **express-rate-limit** (rate limiting: 5/hr anon, 50/day registered)
- **compression** (gzip responses)

### Validation

- **Zod** 3.23 (shared schemas)

### Utilities

- **dotenv** (environment variables)
- **morgan** (HTTP request logging)
- **node-cron** (cleanup expired anonymous sessions)

### Optional (already installed)

- **Socket.io** 4.8 (real-time updates - not required for MVP)

---

## Shared Package

### Type Safety & Validation

- **TypeScript**
- **Zod** (shared schemas for API requests/responses)
- **Shared types:** User, Session, MixVersion, Analysis, Insights

---

## Database

### Database

- **PostgreSQL**

### Schema (via Prisma)

- `User` - registered users
- `AnonymousSession` - temporary 24hr sessions
- `Session` - permanent analysis sessions
- `MixVersion` - mix versions within sessions
- `Folder` - session organization

---

## Testing & Quality

### Testing

- **Vitest** 3.2 (unit/integration tests)
- **@testing-library/react** (component testing)
- **@testing-library/jest-dom** (DOM matchers)
- **happy-dom** (DOM simulation)

### Code Quality

- **ESLint** 9.36 (linting)
- **Prettier** 3.6 (formatting)
- **TypeScript** strict mode
- **Husky** + **lint-staged** (pre-commit hooks)

---

## Deployment (AWS)

### AWS Services

#### Frontend Hosting

- **AWS Amplify**
  - Automatic builds from Git repository
  - Integrated CDN (CloudFront)
  - Free SSL certificates via AWS Certificate Manager
  - Custom domain support
  - Environment variables for build configuration

#### Backend Hosting

- **AWS Elastic Beanstalk**
  - Node.js platform environment
  - Auto-scaling and load balancing
  - Integrated with RDS
  - Easy deployment via EB CLI
  - Built-in monitoring via CloudWatch

#### Database

- **AWS RDS PostgreSQL**
  - Managed database service
  - Automated backups (7-day retention)
  - Multi-AZ option for high availability
  - Security groups for network isolation
  - Instance: db.t3.micro (production), db.t2.micro (free tier eligible)

#### Additional AWS Services

- **CloudFront** - CDN for frontend (included with Amplify)
- **Route 53** - DNS management and custom domain routing
- **Certificate Manager** - Free SSL/TLS certificates
- **CloudWatch** - Application logging and monitoring
- **Systems Manager Parameter Store** - Secure environment variable storage
- **IAM** - Access management and service roles

### Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  Route 53 (DNS)                             │
│  refera.com → CloudFront/Amplify            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────┐  ┌───────────────────────────┐
│  AWS Amplify             │  │  Elastic Beanstalk        │
│  (Frontend - React)      │  │  (Backend - Express)      │
│  - Auto build from Git   │  │  - Node.js platform       │
│  - CDN included          │◄─┤  - Auto-scaling           │
│  - SSL automatic         │  │  - Load balancer          │
└──────────────────────────┘  └──────────┬────────────────┘
                                         │
                                         ▼
                              ┌────────────────────────┐
                              │  RDS PostgreSQL        │
                              │  (Database)            │
                              │  - Automated backups   │
                              │  - Security groups     │
                              └────────────────────────┘
```

### Environment Variables

#### Backend (Elastic Beanstalk)

- `DATABASE_URL` - PostgreSQL connection string from RDS
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (production)
- `CORS_ORIGIN` - Frontend URL for CORS configuration

#### Frontend (Amplify)

- `VITE_API_URL` - Backend API URL (Elastic Beanstalk endpoint)
- `VITE_ENV` - Environment identifier

### Deployment Commands

#### Backend (Elastic Beanstalk)

```bash
# Install EB CLI globally
npm install -g aws-eb-cli

# Initialize Elastic Beanstalk
cd server
eb init -p node.js-18 refera-api

# Create environment
eb create refera-api-prod

# Set environment variables
eb setenv DATABASE_URL="..." JWT_SECRET="..." NODE_ENV="production"

# Deploy application
eb deploy

# View logs
eb logs

# Check status
eb status
```

#### Frontend (Amplify)

```bash
# Deploy via AWS Console (recommended)
# 1. Connect GitHub repository
# 2. Configure build settings (Vite)
# 3. Set environment variables
# 4. Deploy

# Or use Amplify CLI
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

#### Database (RDS)

```bash
# Create via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier refera-db-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 20 \
  --backup-retention-period 7

# Run Prisma migrations
cd server
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Estimated AWS Costs (Monthly)

| Service                 | Configuration                        | Estimated Cost    |
| ----------------------- | ------------------------------------ | ----------------- |
| **RDS PostgreSQL**      | db.t3.micro, 20GB storage, single-AZ | ~$15              |
| **Elastic Beanstalk**   | t3.micro instance (1x)               | ~$10              |
| **Amplify Hosting**     | 5GB served, 100 build minutes        | ~$1               |
| **Route 53**            | 1 hosted zone                        | $0.50             |
| **Data Transfer**       | Moderate traffic                     | ~$1-2             |
| **CloudWatch**          | Basic logging                        | Free tier         |
| **Certificate Manager** | SSL certificates                     | Free              |
| **Total (estimated)**   |                                      | **~$27-30/month** |

**AWS Free Tier (First 12 Months):**

- RDS: 750 hours/month db.t2.micro
- EC2: 750 hours/month t2.micro (for Beanstalk)
- Amplify: 1000 build minutes, 15GB served
- **Estimated cost with free tier: ~$5-10/month**

### Cron Jobs

- **EventBridge (CloudWatch Events)** - Trigger Lambda function hourly to clean expired anonymous sessions
- **Alternative:** node-cron running in Elastic Beanstalk application

---

## Key Technical Decisions

| Decision             | Choice                          | Rationale                                             |
| -------------------- | ------------------------------- | ----------------------------------------------------- |
| **Audio Processing** | Client-side (Web Audio API)     | No server load, instant analysis, infinitely scalable |
| **State Management** | Zustand + React Query           | Lightweight, great DX, automatic caching              |
| **Styling**          | Tailwind CSS + Custom CSS       | Fast prototyping + full design control                |
| **Rate Limiting**    | express-rate-limit (in-memory)  | Simple, no Redis needed for MVP                       |
| **Charts**           | Recharts                        | React-native, perfect for audio visualizations        |
| **Monorepo**         | npm workspaces                  | Simple, native, no extra tools                        |
| **Auth**             | JWT (custom)                    | Already implemented, flexible                         |
| **No Python/FFmpeg** | Web Audio API only              | Simpler stack, client-side processing                 |
| **Deployment**       | AWS (Amplify + Beanstalk + RDS) | Industry-standard, scalable, great for portfolio      |

---

## Packages to Install

### Backend additions

```bash
npm install --workspace=server cookie-parser express-rate-limit node-cron helmet compression
```

### Frontend additions

```bash
npm install --workspace=client react-dropzone recharts react-hook-form html-to-canvas
```

### Dev dependencies

```bash
npm install --workspace=client -D @types/react-dropzone
```

---

## Audio Analysis Flow

```
User uploads audio file (client)
         ↓
Web Audio API decodes + analyzes (client)
         ↓
Sends JSON results to backend
         ↓
Backend calculates deltas + generates insights
         ↓
Stores in PostgreSQL
         ↓
Returns insights to client for display
```

**Note:** No audio files ever touch the server - all processing happens client-side via Web Audio API.
