'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, CheckCircle, Clock,
  Calendar, Target, Award
} from 'lucide-react';

interface RoadmapPhase {
  id: number;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  items: string[];
}

export default function ProjectRoadmap() {
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());

  const roadmapData: RoadmapPhase[] = [
    {
      id: 0,
      title: "Phase 0: Project Setup & Tooling",
      status: "completed",
      description: "Initialize the foundation with modern tooling and development environment",
      items: [
        "Run scaffolding script to create the structure",
        "Initialize Git, install all core dependencies",
        "Set up TypeScript, ESLint, Prettier, Husky",
        "Configure Drizzle + create initial migration",
        "Environment validation with Zod",
        "Docker Compose for local dev (Postgres + Redis)",
        "Production Dockerfile and Coolify setup",
        "Test dev server + DB/Redis connectivity"
      ]
    },
    {
      id: 1,
      title: "Phase 1: Database & Auth",
      status: "in-progress",
      description: "Core authentication system and database schema",
      items: [
        "Design Drizzle schema for Auth.js",
        "Implement Auth.js with multiple providers",
        "Create sign-in/sign-up pages with validation",
        "Protected routes + middleware",
        "Role-based access control",
        "Global navigation with user menu"
      ]
    },
    {
      id: 2,
      title: "Phase 2: User & Admin Dashboards",
      status: "pending",
      description: "Skeleton for user and admin interfaces",
      items: [
        "Dashboard layout with sidebar navigation",
        "Profile page with editing capabilities",
        "API Keys management (CRUD)",
        "Mock Billing page",
        "Admin section - User management",
        "Basic Posts management UI"
      ]
    },
    {
      id: 3,
      title: "Phase 3: Blog System",
      status: "pending",
      description: "Full-featured blog with MDX and scheduling",
      items: [
        "Blog schema + Drizzle models",
        "MDX Editor with live preview",
        "Public blog listing + filtering",
        "Dynamic MDX rendering + SEO",
        "Scheduled publishing with BullMQ",
        "Author role restrictions"
      ]
    },
    {
      id: 4,
      title: "Phase 4: Portfolio & GitHub Showcase",
      status: "pending",
      description: "Personal branding and GitHub integration",
      items: [
        "Static Portfolio page",
        "GitHub repos fetch + Redis cache",
        "Beautiful project cards grid",
        "Dark/light theme consistency"
      ]
    },
    {
      id: 5,
      title: "Phase 5: Mini-Apps & Navigation",
      status: "pending",
      description: "Showcase and internal tools",
      items: [
        "Apps listing page",
        "Individual app pages",
        "Image Optimizer integration",
        "Contextual sub-navigation"
      ]
    },
    {
      id: 6,
      title: "Phase 6: Premium Public API",
      status: "pending",
      description: "Production-grade external API",
      items: [
        "API Key authentication middleware",
        "Redis-based rate limiting",
        "Versioned API routes (/api/v1)",
        "Usage tracking & logging",
        "OpenAPI + Scalar documentation",
        "Developer portal"
      ]
    },
    {
      id: 7,
      title: "Phase 7: Webhooks",
      status: "pending",
      description: "Real-time event delivery system",
      items: [
        "Webhook schema + management UI",
        "HMAC signature verification",
        "BullMQ delivery worker with retries",
        "Delivery logs dashboard"
      ]
    },
    {
      id: 8,
      title: "Phase 8: Favorites / Quick Access",
      status: "pending",
      description: "User engagement features",
      items: [
        "Add to favorites functionality",
        "Quick access dropdown in nav",
        "Full favorites management page"
      ]
    },
    {
      id: 9,
      title: "Phase 9: Search (Postgres FTS)",
      status: "pending",
      description: "Powerful full-text search",
      items: [
        "Search index with tsvector",
        "Database triggers",
        "Search API endpoint",
        "Global search UI"
      ]
    },
    {
      id: 10,
      title: "Phase 10: Billing Integration",
      status: "pending",
      description: "Prepare for monetization",
      items: [
        "Mock billing service",
        "Stripe integration readiness",
        "Detailed migration documentation",
        "Plan-based rate limits"
      ]
    },
    {
      id: 11,
      title: "Phase 11: Analytics Integration",
      status: "pending",
      description: "Track usage and performance",
      items: [
        "Plausible + GA4 setup",
        "Custom event tracking",
        "Admin analytics dashboard"
      ]
    },
    {
      id: 12,
      title: "Phase 12: SEO & Polishing",
      status: "pending",
      description: "Final user experience improvements",
      items: [
        "Dynamic sitemap & robots.txt",
        "Open Graph image generation",
        "Structured data (JSON-LD)",
        "Full responsive polish"
      ]
    },
    {
      id: 13,
      title: "Phase 13: Testing & CI/CD",
      status: "pending",
      description: "Production readiness",
      items: [
        "Unit + integration tests",
        "GitHub Actions pipeline",
        "Coolify deployment setup",
        "Database migrations on deploy"
      ]
    },
    {
      id: 14,
      title: "Phase 14: Extras & Continuous Improvement",
      status: "pending",
      description: "Future enhancements",
      items: [
        "Email notifications (Resend)",
        "WebSocket real-time features",
        "Advanced admin analytics",
        "Iterate based on user feedback"
      ]
    }
  ];

  useEffect(() => {
    setPhases(roadmapData);
    // Auto-expand first 3 phases
    setExpandedPhases(new Set([0, 1, 2]));
  }, []);

  const togglePhase = (id: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleComplete = (id: number) => {
    setCompletedPhases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPhases = phases.length;
  const completedCount = completedPhases.size;
  const progress = Math.round((completedCount / totalPhases) * 100);

  return (
    <div className="max-w-5xl mx-auto p-8 bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <Target className="w-10 h-10 text-emerald-500" />
            <h1 className="text-5xl font-bold tracking-tighter">Development Roadmap</h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Structured build plan for your full-featured Next.js application
          </p>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3">
            <div className="text-6xl font-mono font-bold text-emerald-400">{progress}</div>
            <div className="text-2xl text-zinc-500">%</div>
          </div>
          <div className="text-sm text-zinc-500">
            {completedCount} of {totalPhases} phases completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 bg-zinc-900 rounded-full mb-12 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-6">
        {phases.map((phase, index) => {
          const isExpanded = expandedPhases.has(phase.id);
          const isCompleted = completedPhases.has(phase.id);
          const actualStatus = isCompleted ? 'completed' : phase.status;

          return (
            <div
              key={phase.id}
              className={`border rounded-3xl overflow-hidden transition-all duration-300 group
                ${actualStatus === 'completed' ? 'border-emerald-800 bg-emerald-950/30' : 'border-zinc-800 bg-zinc-900'}
              `}
            >
              {/* Phase Header */}
              <div
                onClick={() => togglePhase(phase.id)}
                className="px-8 py-6 flex items-center justify-between cursor-pointer hover:bg-zinc-800/70"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {actualStatus === 'completed' ? (
                      <CheckCircle className="w-9 h-9 text-emerald-500" />
                    ) : actualStatus === 'in-progress' ? (
                      <Clock className="w-9 h-9 text-amber-500 animate-pulse" />
                    ) : (
                      <div className="w-9 h-9 rounded-2xl border-2 border-zinc-700 flex items-center justify-center text-zinc-500 font-mono text-lg">
                        {phase.id}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold">{phase.title}</h2>
                      {actualStatus === 'in-progress' && (
                        <span className="px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full">In Progress</span>
                      )}
                    </div>
                    <p className="text-zinc-400 mt-1 pr-8">{phase.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleComplete(phase.id); }}
                    className={`text-sm px-4 py-2 rounded-xl transition border flex items-center gap-2
                      ${isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark Done'}
                  </button>
                  {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-8 pb-8 border-t border-zinc-800 pt-6">
                  <ul className="space-y-4 text-[15px]">
                    {phase.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-zinc-300">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center text-sm text-zinc-600">
        Built with ❤️ for your Next.js project • Progress is tracked locally
      </div>
    </div>
  );
}