---
name: Fides Dashboard project context
description: Key facts about the fides-dashboard Playwright test setup, app structure, and data
type: project
---

Single-page GDPR datamap visualisation app (React + Vite + Framer Motion + Tailwind).

**Why:** Testing the GridView component that renders system cards grouped by system type or data use.

**How to apply:** Use these facts when writing or maintaining tests for this repo.

## Test setup

- Test dir: `e2etests/`
- Config: `playwright.config.ts` — targets chromium/firefox/webkit, baseURL `http://localhost:5177`
- Dev server started automatically by Playwright's `webServer` config
- No auth, no API calls — all data is static from `sample_data.json` at `/Users/dommuldoon/projects/ethyca/sample_data.json`
- Dark mode on by default (localStorage key `fides-dark-mode = "true"`)

## App structure

- `src/App.tsx` — FilterProvider wraps DataMap; DataMap renders Header + Toolbar + GridView or GraphView
- `src/store.tsx` — FilterContext: selectedDataUses, selectedCategories, layoutMode, viewMode, showArrows, darkMode
- `src/data.ts` — normalises raw JSON; exports systems (10 unique after dedup), allDataUses, allDataCategories, allSystemTypes
- `src/components/GridView.tsx` — renders columns via groupBy(); wraps ArrowOverlay when showArrows=true
- `src/components/ArrowOverlay.tsx` — SVG overlay with <line> elements; returns null when no arrows
- `src/components/SystemCard.tsx` — shows name, type badge, categories (leaf only), data uses, expandable description
- `src/components/Toolbar.tsx` — SegmentedControl for Grid/Graph + System type/Data use; FilterPill per use/category
- `src/components/Header.tsx` — shows "{n} systems" or "{filtered} of {total} systems"

## Data summary (10 unique systems)

- Application (3): Example.com Online Storefront, Example.com Checkout, Ethyca
- Service (1): Orders Management
- Database (2): Example.com Database, Example.com Search Engine
- Integration (4): Stripe, Mailchimp, Google Ads, Google Analytics
- Data uses (5, sorted): advertising.first_party, advertising.third_party, improve.system, provide.system, provide.system.operations.support
- Categories (5 full paths, leaf labels): cookie_id, ip_address, location, email, financial
- Systems with dependencies: Storefront, Checkout, Orders Management, Ethyca

## data-testid gaps (suggested additions to source)

- `<main>` → `data-testid="grid-view"`
- Column wrapper div → `data-testid="column-{groupName}"`
- Column header `<h2>` → `data-testid="column-header-{groupName}"`
- Per-column count `<p>` → `data-testid="column-count-{groupName}"`
- SystemCard root div → `data-testid="system-card-{fidesKey}"`
- ArrowOverlay `<svg>` → `data-testid="arrow-overlay"`
- Header count badge → `data-testid="system-count-badge"`
