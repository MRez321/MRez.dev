'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight, Save, RefreshCw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

const CHECKLIST_FILE = '/data/checklist-state.json';

export default function ProjectChecklist() {
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getStructuredChecklist = (): ChecklistSection[] => [
    {
      id: "A",
      title: "A. Core Infrastructure",
      items: [
        { id: "A-0", text: "Next.js app with App Router – TypeScript, Tailwind CSS, shadcn/ui.", checked: false },
        { id: "A-1", text: "Environment variables validation – Zod schema that validates all env vars at startup (src/lib/env.ts).", checked: false },
        { id: "A-2", text: "Database – Postgres, Drizzle ORM, connection pool, migration generation (drizzle-kit).", checked: false },
        { id: "A-3", text: "Redis – ioredis client, health check, used by rate limiter and queue.", checked: false },
        { id: "A-4", text: "Structured logging – pino logger with request ID middleware.", checked: false },
        { id: "A-5", text: "Global error handling – error.tsx, API error responses, Sentry (optional later).", checked: false },
        { id: "A-6", text: "Health check endpoints – /api/health (app), /api/health/db (pg), /api/health/redis.", checked: false },
      ]
    },
    {
      id: "B",
      title: "B. Authentication & Authorization",
      items: [
        { id: "B-0", text: "Auth.js v5 – providers: GitHub, Google, Credentials (email/password).", checked: false },
        { id: "B-1", text: "Database adapter – Drizzle adapter for Auth.js (users, accounts, sessions).", checked: false },
        { id: "B-2", text: "Email verification – Resend for magic link / OTP (build abstraction, start with mock).", checked: false },
        { id: "B-3", text: "Role‑based access – role field (admin, author, user). Middleware/guard that checks role.", checked: false },
        { id: "B-4", text: "Protected routes – proxy.ts checks session, redirects to signin.", checked: false },
        { id: "B-5", text: "Sign in / Sign up pages – forms with client‑side validation (react-hook-form + zod).", checked: false },
        { id: "B-6", text: "User menu & session – avatar, name, dropdown (uses auth()).", checked: false },
      ]
    },
    {
      id: "C",
      title: "C. Database Schema & ORM",
      items: [
        { id: "C-0", text: "Users – id, name, email, emailVerified, image, role, createdAt, stripeCustomerId, etc.", checked: false },
        { id: "C-1", text: "Accounts – for OAuth providers (Auth.js standard).", checked: false },
        { id: "C-2", text: "Sessions – database sessions.", checked: false },
        { id: "C-3", text: "VerificationTokens – for passwordless login.", checked: false },
        { id: "C-4", text: "Blog posts – id, title, slug, content (MDX string), excerpt, status (draft/published/scheduled), publishedAt, authorId, tags, etc.", checked: false },
        { id: "C-5", text: "Favorites – userId, itemType (blog/app), itemId, createdAt.", checked: false },
        { id: "C-6", text: "API keys – id, userId, name, key (hashed), scopes (array of appIds), usage limit, revoked, createdAt, lastUsedAt.", checked: false },
        { id: "C-7", text: "API usage logs – id, apiKeyId, appId, endpoint, timestamp, status, responseTime, ip.", checked: false },
        { id: "C-8", text: "Billing plans – id, name, price, features, stripePriceId (future).", checked: false },
        { id: "C-9", text: "Subscriptions – id, userId, planId, status, currentPeriodStart/End, stripeSubscriptionId.", checked: false },
        { id: "C-10", text: "Webhook endpoints – id, userId, url, events (array), secret, isActive.", checked: false },
        { id: "C-11", text: "Webhook delivery logs – id, webhookId, event, payload, status, createdAt.", checked: false },
        { id: "C-12", text: "GitHub projects (cached) – id, repoId, name, description, stars, language, url, updatedAt. (Could be fetched on‑the‑fly, but caching improves performance.)", checked: false },
      ]
    },
    {
      id: "D",
      title: "D. User Dashboard",
      items: [
        { id: "D-0", text: "Profile page – edit name, avatar, email preferences.", checked: false },
        { id: "D-1", text: "Favorites page – list favorite blog posts & apps, remove from list.", checked: false },
        { id: "D-2", text: "API keys management – create, revoke, copy to clipboard, see usage stats.", checked: false },
        { id: "D-3", text: "Billing page – show current plan (mock), upcoming invoice, usage (mock).", checked: false },
        { id: "D-4", text: "Quick access – a small floating panel or dropdown showing recent favorites for fast navigation.", checked: false },
      ]
    },
    {
      id: "E",
      title: "E. Admin Dashboard",
      items: [
        { id: "E-0", text: "User management – list all users, filter by role, change role, ban/delete.", checked: false },
        { id: "E-1", text: "Blog post management – list all posts, edit any, change status.", checked: false },
        { id: "E-2", text: "Analytics overview – integrate Google Analytics + Plausible stats (via their APIs), show page views, active users.", checked: false },
        { id: "E-3", text: "API metrics – total requests, per‑app usage, error rates (from usage logs).", checked: false },
      ]
    },
    {
      id: "F",
      title: "F. Blog",
      items: [
        { id: "F-0", text: "Post creation – MDX editor (@uiw/react-md-editor), title, slug generation, tags, set status (draft/publish/schedule).", checked: false },
        { id: "F-1", text: "Post listing – public page with pagination, filtering by tag.", checked: false },
        { id: "F-2", text: "Post detail – render MDX server‑side via next-mdx-remote, code highlighting (rehype).", checked: false },
        { id: "F-3", text: "Scheduled publishing – BullMQ job that checks every minute for posts with status='scheduled' and publishedAt <= now, sets to published.", checked: false },
        { id: "F-4", text: "SEO for each post – dynamic metadata (title, description, OG image generated using sharp or @vercel/og).", checked: false },
        { id: "F-5", text: "Author role – only users with role author or admin can create/edit their posts.", checked: false },
      ]
    },
    {
      id: "G",
      title: "G. Portfolio & GitHub Showcase",
      items: [
        { id: "G-0", text: "Portfolio page – static content about you, skills, projects (managed via MDX files or admin panel).", checked: false },
        { id: "G-1", text: "GitHub projects page – server‑side fetch from GitHub API (using a personal access token), cache in Redis (TTL 1 hour), display grid of repos.", checked: false },
        { id: "G-2", text: "Markdown renderer for any project descriptions.", checked: false },
      ]
    },
    {
      id: "H",
      title: "H. Mini‑Apps & Their APIs",
      items: [
        { id: "H-0", text: "App pages – listing of all mini‑apps, individual app page with description and link to use it.", checked: false },
        { id: "H-1", text: "Image optimizer – your previous work, integrated as a client‑side tool or server action.", checked: false },
        { id: "H-2", text: "Sub‑navigation – each app section can have its own nav bar (contextual).", checked: false },
        { id: "H-3", text: "Internal API for apps – use Next.js API routes or Server Actions, protected by session (for your own use).", checked: false },
      ]
    },
    {
      id: "I",
      title: "I. Premium Public API",
      items: [
        { id: "I-0", text: "API key authentication – validate x-api-key header against database (hashed), attach user & scopes to request.", checked: false },
        { id: "I-1", text: "Rate limiting – token bucket per API key using Redis, configurable per plan.", checked: false },
        { id: "I-2", text: "API versioning – all public routes under /api/v1/.", checked: false },
        { id: "I-3", text: "Usage tracking – log every request (api_usage_logs), aggregate hourly/daily for dashboard.", checked: false },
        { id: "I-4", text: "API documentation – auto‑generate OpenAPI spec from route definitions (using a library or manual spec), render with Scalar at /docs.", checked: false },
        { id: "I-5", text: "Developer portal – page where external devs can view docs, get API key (if registered), see usage.", checked: false },
      ]
    },
    {
      id: "J",
      title: "J. Webhooks (for premium API users)",
      items: [
        { id: "J-0", text: "Webhook registration – UI in dashboard for users to add endpoint URLs, choose events (e.g., quota.exceeded, payment.success).", checked: false },
        { id: "J-1", text: "Webhook signature – generate a secret per endpoint, compute HMAC signature on delivery.", checked: false },
        { id: "J-2", text: "Delivery mechanism – when an event occurs, push job to BullMQ, worker sends HTTP POST to all matching webhooks, retry on failure.", checked: false },
        { id: "J-3", text: "Delivery logs – store status and response, expose in dashboard.", checked: false },
      ]
    },
    {
      id: "K",
      title: "K. Favorites / Quick Access",
      items: [
        { id: "K-0", text: "Add to favorites – button on blog posts and apps, calls internal API.", checked: false },
        { id: "K-1", text: "Quick access component – global dropdown/sidebar that shows last 5 favorites, using client component with useSession and fetch.", checked: false },
        { id: "K-2", text: "Favorites list – full page in dashboard.", checked: false },
      ]
    },
    {
      id: "L",
      title: "L. Search (Postgres FTS)",
      items: [
        { id: "L-0", text: "Search index – create a materialized view or table search_index (id, type, title, body, tsvector).", checked: false },
        { id: "L-1", text: "Triggers – on blog insert/update, refresh the tsvector column.", checked: false },
        { id: "L-2", text: "Search endpoint – api/internal/search?q=... returns merged results (blog posts, maybe apps).", checked: false },
        { id: "L-3", text: "Search UI – input in global nav, results page.", checked: false },
      ]
    },
    {
      id: "M",
      title: "M. Billing (Mock → Stripe later)",
      items: [
        { id: "M-0", text: "Billing abstraction – BillingService interface: getPlans, getUserSubscription, createCheckoutSession, handleWebhook.", checked: false },
        { id: "M-1", text: "Mock implementation – returns static plans, always active free tier, no real charges.", checked: false },
        { id: "M-2", text: "Integration ready – environment variables for Stripe keys, webhook secret.", checked: false },
        { id: "M-3", text: "Future steps detailed – in the roadmap.", checked: false },
      ]
    },
    {
      id: "N",
      title: "N. Analytics (GA4 + Plausible)",
      items: [
        { id: "N-0", text: "Environment config – NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_PLAUSIBLE_DOMAIN.", checked: false },
        { id: "N-1", text: "Script injection – in root layout using next/script with strategies.", checked: false },
        { id: "N-2", text: "Custom events – track signups, blog views, API usage (optional).", checked: false },
        { id: "N-3", text: "Admin dashboard analytics – fetch GA4 data via Google Analytics Data API (server‑side) or embed reports; fetch Plausible stats via its API.", checked: false },
      ]
    },
    {
      id: "O",
      title: "O. Styling & Theming",
      items: [
        { id: "O-0", text: "Tailwind CSS – base config, shadcn/ui components.", checked: false },
        { id: "O-1", text: "Dark mode – next-themes, toggle in global nav.", checked: false },
        { id: "O-2", text: "Responsive design – mobile‑first, nav collapse.", checked: false },
      ]
    },
    {
      id: "P",
      title: "P. SEO",
      items: [
        { id: "P-0", text: "Metadata API – generateMetadata for all important pages.", checked: false },
        { id: "P-1", text: "Open Graph images – dynamic generation for blog posts using @vercel/og or sharp.", checked: false },
        { id: "P-2", text: "Sitemap – sitemap.ts at root that includes all public pages.", checked: false },
        { id: "P-3", text: "robots.txt – allow all, point to sitemap.", checked: false },
      ]
    },
    {
      id: "Q",
      title: "Q. CI/CD & Deployment",
      items: [
        { id: "Q-0", text: "Local development with Docker Compose – docker-compose.yml (Postgres, Redis, Next.js dev server with hot reload).", checked: false },
        { id: "Q-1", text: "Production Dockerfile – multi‑stage build, output standalone Next.js.", checked: false },
        { id: "Q-2", text: "Coolify setup – point to GitHub repo, set environment variables, auto‑deploy on push.", checked: false },
        { id: "Q-3", text: "GitHub Actions – optional, lint & test before deploy (can be integrated with Coolify).", checked: false },
        { id: "Q-4", text: "Database migrations in CI – run drizzle-kit migrate on deploy.", checked: false },
      ]
    },
    {
      id: "R",
      title: "R. Testing (Foundation)",
      items: [
        { id: "R-0", text: "Vitest configuration – unit tests for lib functions.", checked: false },
        { id: "R-1", text: "React Testing Library – smoke tests for critical pages (signin, blog).", checked: false },
        { id: "R-2", text: "API route tests – using testcontainers or in‑memory fetch.", checked: false },
        { id: "R-3", text: "E2E (optional) – Playwright for signup + blog creation flow.", checked: false },
      ]
    },
    {
      id: "S",
      title: "S. Background Jobs & Cron",
      items: [
        { id: "S-0", text: "BullMQ – job queue backed by Redis.", checked: false },
        { id: "S-1", text: "Worker process – separate container/process that handles email sending, webhook deliveries, scheduled publishing.", checked: false },
        { id: "S-2", text: "Cron – node-cron in worker to enqueue scheduled publishing checks, backup, etc.", checked: false },
      ]
    },
    {
      id: "T",
      title: "T. Backups",
      items: [
        { id: "T-0", text: "Database backup script – dump to file, upload to R2 using @aws-sdk/client-s3.", checked: false },
        { id: "T-1", text: "Cron schedule – daily at 3 AM via worker process or Coolify cron.", checked: false },
      ]
    },
  ];

  // Load state
  const loadState = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/checklist', { cache: 'no-store' });

      let initialSections = getStructuredChecklist();

      if (res.ok) {
        const saved = await res.json();
        if (saved?.sections?.length) {
          const stateMap = new Map<string, boolean>();
          saved.sections.forEach((sec: any) => {
            sec.items.forEach((item: any) => stateMap.set(item.id, item.checked));
          });

          initialSections = initialSections.map(section => ({
            ...section,
            items: section.items.map(item => ({
              ...item,
              checked: stateMap.get(item.id) ?? item.checked,
            })),
          }));
        }
      }

      setSections(initialSections);
      setExpandedSections(new Set(initialSections.map(s => s.id)));
    } catch (err) {
      setError('Failed to load saved state. Starting fresh.');
      const defaultSections = getStructuredChecklist();
      setSections(defaultSections);
      setExpandedSections(new Set(defaultSections.map(s => s.id)));
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async () => {
    if (!sections.length) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });

      if (res.ok) setLastSaved(new Date());
      else throw new Error();
    } catch {
      setError('Failed to save (only in-memory for now).');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          }
          : section
      )
    );
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalItems = sections.flatMap(s => s.items).length;
  const completedItems = sections.flatMap(s => s.items).filter(i => i.checked).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    const timer = setTimeout(saveState, 700);
    return () => clearTimeout(timer);
  }, [sections]);

  if (isLoading) return <div className="p-12 text-center text-xl">Loading full checklist...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-zinc-950 text-zinc-100 min-h-screen pb-20">
      <div className="flex justify-between items-end mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Next.js App Development Checklist</h1>
          <p className="text-zinc-400 mt-1">All items from your spec • Progress saved automatically</p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-mono font-bold text-emerald-400">{progress}%</div>
          <div className="text-sm text-zinc-500">{completedItems} / {totalItems} completed</div>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">{error}</div>}
      {lastSaved && <p className="text-xs text-zinc-500 mb-4">Last saved: {lastSaved.toLocaleTimeString()}</p>}

      <div className="space-y-6">
        {sections.map((section) => {
          const completed = section.items.filter(i => i.checked).length;
          const expanded = expandedSections.has(section.id);

          return (
            <div key={section.id} className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-zinc-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-emerald-500 font-semibold text-lg">{section.id}</span>
                  <h2 className="text-xl font-semibold">{section.title.slice(3)}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">{completed}/{section.items.length}</span>
                  {expanded ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                </div>
              </button>

              {expanded && (
                <div className="px-6 pb-6 space-y-1">
                  {section.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex gap-4 p-4 rounded-xl hover:bg-zinc-800/70 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(section.id, item.id)}
                        className="mt-1 w-5 h-5 accent-emerald-500 cursor-pointer"
                      />
                      <span className={`text-[15px] leading-relaxed ${item.checked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12 text-xs text-zinc-600">
        State is saved to <code className="bg-zinc-900 px-2 py-1 rounded">/data/checklist-state.json</code>
      </div>
    </div>
  );
}