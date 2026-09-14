# App Store Landing Page & Admin CMS

A production-ready, responsive web application inspired by the information hierarchy of modern Google Play Store app detail pages, accompanied by a full-featured, secure Admin CMS Dashboard. Built with React, Vite, TypeScript, Tailwind CSS, Lucide React, and Supabase.

---

## Features Overview

### 1. Public App Store Details Page
- **App Hero Section**: Displays App Icon, verified developer checkmark, title, star rating score, review count, download count, Editors' Choice ribbon, 18+ age rating badge, category, and multi-device support banner.
- **Smart 4-Mode Install CTA**:
  1. **APK Download Mode**: Direct Android package download with "unknown sources" guidance and iOS device protection guards.
  2. **External URL Mode**: Secure HTTPS external destination redirect with optional confirmation modal in same or new tab.
  3. **PWA Mode**: Native browser installation prompt on Android/Chrome/Edge, plus an elegant 3-step "Add to Home Screen" visual guide on iOS Safari.
  4. **Smart Auto Mode**: Automatically detects client device OS (Android, iOS, Desktop) and serves the ideal install flow.
- **Screenshot / Media Gallery**: Horizontal swipe carousel on mobile/tablets, desktop navigation arrows, and full-screen lightbox modal with keyboard navigation.
- **About This App**: Expandable description with bulleted feature lists, version number, and last-updated timestamps.
- **Data Safety**: Security disclosure cards (No data shared, no personal data collected, TLS 1.3 encryption, and account deletion requests) with full details dialog.
- **Ratings & Reviews**: 5-star distribution green progress bars, verified reviews badge, user review cards with "Was this helpful? (Yes/No)" interaction, and official developer response boxes.
- **What's New**: Version-tagged changelogs and release notes history.
- **Developer Contact**: Collapsible accordion with official website, email, address, and privacy policy links.
- **Responsive & Accessible**: Pixel-perfect layout from 360px up to 1920px+, touch-friendly targets (minimum 44px), semantic HTML, and ARIA labels.

### 2. Secure Admin CMS Dashboard
- **Protected Routing**: Guards `/admin/*` routes with Supabase Authentication (and seamless 1-click demo access for local evaluation).
- **Dashboard Telemetry**: Real-time summary counters (Install clicks, APK downloads, External redirects, PWA prompts, Reviews moderation, Media counts) and anonymous event logs.
- **App Information Management**: Complete editing of App title, developer name, category, rating, download count, version, badges, icon image uploader, and feature highlights.
- **Install Settings Management**: Switch between APK, External URL, PWA, and Smart Auto modes. Upload `.apk` packages, set HTTPS destination URLs, toggle confirmation dialogs, and edit custom device messages.
- **Media & Screenshot Management**: Upload, preview in full-screen, toggle visibility, and reorder screenshots via intuitive up/down order controls.
- **Reviews Moderation & Replies**: Review table with status filters, create/edit review dialogs, toggle featured status, publish/unpublish, and write official developer responses.
- **Appearance & SEO**: Custom page titles, meta descriptions, Open Graph social share image URLs, and header visibility controls.

---

## Technology Stack

- **Frontend**: React 18, Vite 6, TypeScript, Tailwind CSS 3, Lucide React icons, React Router v6
- **Backend & Database**: Supabase (PostgreSQL, Storage, Authentication, Row Level Security)
- **Offline / Fallback Resilience**: Embedded fallback store in `src/services/dataService.ts` allowing immediate testing without live credentials.
- **Deployment**: Static build compatible with Netlify, Vercel, and Cloudflare Pages.

---

## Directory Architecture

```
/
├── public/
│   ├── _redirects             # Netlify SPA routing rewrites
│   ├── manifest.webmanifest   # PWA manifest
│   └── sw.js                  # PWA offline service worker
├── src/
│   ├── components/
│   │   └── public/            # Header, AppHero, InstallModal, ScreenshotGallery, etc.
│   ├── layouts/
│   │   ├── PublicLayout.tsx   # Public store layout with navigation and footer
│   │   └── AdminLayout.tsx    # Left sidebar admin console layout
│   ├── hooks/
│   │   └── useInstallFlow.ts  # Multi-mode install orchestration & analytics
│   ├── lib/
│   │   └── supabase.ts        # Supabase client initializer
│   ├── pages/
│   │   ├── public/            # LandingPage, InstallGuidePage, PrivacyPolicyPage, TermsPage
│   │   └── admin/             # AdminDashboard, AdminContent, AdminInstall, AdminMedia, AdminReviews, AdminSettings
│   ├── services/
│   │   ├── authService.ts     # Supabase Auth & session manager
│   │   ├── dataService.ts     # Unified database, storage, and fallback service
│   │   └── mockData.ts        # Default neutral seed content
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & models
│   ├── utils/
│   │   └── deviceDetector.ts  # Device & browser detection utility
│   ├── App.tsx                # Client-side router configuration
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind directives & design tokens
├── supabase/
│   └── schema.sql             # Complete PostgreSQL schema, RLS policies, and seed data
├── netlify.toml               # Netlify deployment configuration
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Supabase Setup Guide

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings** > **API**, copy your **Project URL** and **anon / public** API key.

### 2. Run Database Migration SQL
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Copy and paste the contents of `supabase/schema.sql` and run the script.
3. This creates:
   - `app_settings`
   - `content_sections`
   - `media`
   - `reviews`
   - `install_settings`
   - `release_notes`
   - `developer_settings`
   - `privacy_settings`
   - `analytics_events`
   - Configures Row Level Security (RLS) policies and seeds initial data.

### 3. Create Storage Buckets
In the Supabase Dashboard under **Storage**, create 4 public buckets:
- `app-assets` (Public)
- `screenshots` (Public)
- `banners` (Public)
- `apk` (Public)

### 4. Create an Admin User
1. In the Supabase Dashboard, open **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Enter your admin email and password.
4. You can now use these credentials to log in at `/admin/login`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

> **Note**: If environment variables are omitted, the application automatically functions in **Local Storage Fallback Mode**, allowing complete testing and editing with full browser persistence!

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

---

## Netlify Deployment Instructions

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. In Netlify, click **Add new site** > **Import an existing project**.
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Under **Site configuration** > **Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Netlify will build the static frontend and use `public/_redirects` to handle Single Page Application client routing.
