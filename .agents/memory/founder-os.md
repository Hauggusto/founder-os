---
name: Founder OS
description: Personal dashboard for Hauggusto — cockpit-style, 100% local, no backend
---

# Founder OS

## Stack
- React + Vite at `artifacts/founder-os/`
- Zustand store at `src/store/useAppStore.ts` — single source of truth, persists to localStorage key `founder-os-data`
- Seed data at `src/store/seed.ts` — loaded only on first visit (empty localStorage)
- recharts for all charts (RadarChart, AreaChart, BarChart)
- framer-motion for animations
- wouter for routing with BASE_URL prefix

## Key types in store
ModuleType: metric | project | financial_account | task | note | link | habit | goal
New types added: HabitEntry, AgendaItem, LifeArea, RiskItem
New store fields: habits, agenda, lifeAreas, risks, nextActions, weekSummary, energyLevel, focusLevel, disciplineLevel, clarityLevel, sidebarCollapsed

## Routes
/ → Cockpit (Overview.tsx) — full cockpit with all blocks
/financeiro, /projetos → partial pages
/comercial, /habitos, /identidade, /aprendizado, /relacoes, /recursos, /analises, /canais, /agentes, /biblioteca → Placeholder

## Layout
- Sidebar: 220px expanded / 60px collapsed, state in store (sidebarCollapsed)
- BottomBar: fixed bottom, left offset tracks sidebar width, capture + 4 shortcuts
- Layout.tsx: reads sidebarCollapsed from store for animated margin

## Overview page blocks
CockpitHeader, KPICards (4 financial cards), LifeRadarChart, WeeklyChart (area), ProjectsBlock, HabitsBlock, AgendaBlock (main col 2/3), RiskBlock, NextActionsBlock, WeekSummaryBlock (right col 1/3)

**Why:** No backend by design — all persistence is local. Keep this decision unless user explicitly requests server sync.

**How to apply:** When adding new data types, extend AppData interface, add actions following existing pattern (set + saveToStorage), add defaults in loadInitialData fallbacks, seed in seed.ts.
