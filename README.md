# StrategyRoom.ai

AI-powered investment research workspace that blends live web intelligence, structured financial analysis, portfolio watchlisting, and sector-wide scanning.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=0B1220)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=0A192F)
![Supabase](https://img.shields.io/badge/Supabase-Platform-3ECF8E?style=for-the-badge&logo=supabase&logoColor=0E1A17)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Firecrawl](https://img.shields.io/badge/Firecrawl-Research-FF6B35?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Analytics-22C55E?style=for-the-badge)
![Vitest](https://img.shields.io/badge/Vitest-Tests-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-SPA_Rewrites-000000?style=for-the-badge&logo=vercel&logoColor=white)

## Quick Navigation

- [Experience Snapshot](#experience-snapshot)
- [What and Why](#what-and-why)
- [Interactive Architecture Map](#interactive-architecture-map)
- [Feature Tour](#feature-tour)
- [Tech Stack Ribbons](#tech-stack-ribbons)
- [Run Locally](#run-locally)
- [Environment and Secrets](#environment-and-secrets)
- [Data Model and Security](#data-model-and-security)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment Notes](#deployment-notes)

## Experience Snapshot

StrategyRoom.ai behaves like a compact research command center:

1. Search any company or ticker.
2. Watch a live two-agent timeline as research and analysis run.
3. Inspect a structured report with verdict, confidence, fundamentals, sentiment, risks, reasoning chain, and citations.
4. Save to watchlist, set alert rules, compare multiple names, and export reports.
5. Re-research runs on schedule and notifies you when key signals change.

## What and Why

### What it does

It converts a plain-language query into an explainable investment report with consistent structure:

- Verdict: Buy, Hold, Sell
- Confidence score plus confidence breakdown factors
- Executive summary
- Fundamentals and data visualizations
- Sentiment analysis and analyst consensus signal
- Risk factors
- Source links and AI reasoning chain

### Why it exists

Equity research is often fragmented across news sites, reports, and dashboards. StrategyRoom.ai is designed to close that gap by making research:

- Faster: automated source collection and synthesis
- More explainable: reasoning chain and confidence decomposition
- More actionable: watchlist persistence, alerts, and comparison views
- More continuous: scheduled re-research and notifications

## Interactive Architecture Map

```mermaid
flowchart LR
    A[User Query] --> B[Frontend Dashboard]
    B --> C[Research API Orchestrator]
    C --> D[Edge Function: researcher]
    D --> E[Firecrawl Search]
    C --> F[Edge Function: analyst]
    F --> G[Gemini 2.5 Flash]
    F --> H[Structured Report JSON]
    H --> I[Report UI and Charts]
    I --> J[Watchlist and Alerts]
    J --> K[Supabase Postgres]
    K --> L[Cron Re-Research]
    L --> D
    L --> F
    L --> M[Alert Notifications]
```

## Feature Tour

### Core flows

- Auth flow with Google OAuth and email/password
- Company research and structured report generation
- Sector scan across top companies with confidence ranking
- Watchlist cards with quick refresh and compare actions
- Alert settings for verdict change, sentiment shift, confidence drop
- Notification bell with unread tracking
- Export as PDF and PNG, plus quick summary copy

### Primary app routes

- App shell and protected routing: src/App.tsx
- Main dashboard: src/pages/Index.tsx
- Comparison mode: src/pages/ComparisonView.tsx
- Sector analysis: src/pages/SectorView.tsx
- Login flow: src/pages/LoginPage.tsx

### Key feature modules

- Report composition: src/components/ReportPanel.tsx
- Live activity timeline: src/components/AgentActivityFeed.tsx
- Watchlist interaction: src/components/WatchlistPanel.tsx
- Alert controls: src/components/AlertSettings.tsx
- Notifications panel: src/components/NotificationBell.tsx
- Export controls: src/components/ExportToolbar.tsx

## Tech Stack Ribbons

### Frontend ribbon

![React](https://img.shields.io/badge/React_UI-18-61DAFB?style=flat-square&logo=react&logoColor=0B1220)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_Bundler-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=0A192F)
![shadcn-ui](https://img.shields.io/badge/shadcn_ui-Radix-111827?style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-22C55E?style=flat-square)

### Backend and AI ribbon

![Supabase Auth](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=0E1A17)
![Postgres](https://img.shields.io/badge/Postgres-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Edge Functions](https://img.shields.io/badge/Supabase-Edge_Functions-3ECF8E?style=flat-square&logo=supabase&logoColor=0E1A17)
![Gemini](https://img.shields.io/badge/Gemini-Analysis-4285F4?style=flat-square&logo=google&logoColor=white)
![Firecrawl](https://img.shields.io/badge/Firecrawl-Source_Retrieval-FF6B35?style=flat-square)

### Quality and delivery ribbon

![Vitest](https://img.shields.io/badge/Vitest-Unit_Tests-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-UI_Tests-E33332?style=flat-square&logo=testinglibrary&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Auto_Update-5A0FC8?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-SPA_Rewrites-000000?style=flat-square&logo=vercel&logoColor=white)

Note on Python: this repository is TypeScript-first across frontend and edge functions, with no Python runtime used in the current codebase.

## Run Locally

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project (cloud or local)
- Firecrawl and Gemini API keys

### Quick start

```bash
npm install
npm run dev
```

Default local app port is 8080.

## Environment and Secrets

### Frontend environment variables

Create a .env file in project root:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Supabase edge function secrets

- FIRECRAWL_API_KEY
- GOOGLE_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- CRON_SECRET (recommended)

## Data Model and Security

### Tables

- research_history
- watchlist
- alert_settings
- alert_notifications

### Security model

- Row-Level Security is enabled on user-owned tables.
- Policies ensure each user can only read and write their own records.
- Unique constraints prevent duplicate ticker entries per user in watchlist and alert settings.

### Migrations

- supabase/migrations/20260220_research_history.sql
- supabase/migrations/20260222_watchlist.sql
- supabase/migrations/20260223_alerts.sql

## Scripts

- npm run dev: start development server
- npm run build: production build
- npm run build:dev: development-mode build
- npm run preview: preview production output
- npm run lint: run ESLint
- npm run test: run tests once
- npm run test:watch: run tests in watch mode

## Testing

Current tests validate:

- Financial parsing logic for chart metrics
- Glossary term completeness and lookup normalization

Test files:

- src/test/charts.test.ts
- src/test/glossary.test.ts

## Deployment Notes

- SPA rewrite is configured in vercel.json.
- PWA support is enabled with vite-plugin-pwa.
- Current function config includes verify_jwt = false for several edge functions; production hardening should enforce stricter invocation controls and secret-gated cron access.

## Final Product Summary

StrategyRoom.ai is an explainable AI research cockpit for equity decisions. It does not just generate one-off output; it supports the full lifecycle of research, monitoring, and signal-change awareness.
