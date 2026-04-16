# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GDPR Datamap visualization app — a frontend-only browser application that renders an interactive data map from a static list of system definitions (`sample_data.json`). It is a prototype-quality take-home challenge.

The app lives in `fides-dashboard/` and is built with React + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router.

## Commands

From `fides-dashboard/`:

```bash
npm run dev       # Start dev server
npm run build     # Production build (tsc + vite build)
npm run preview   # Preview production build
npm run lint      # ESLint
```

## E2E Testing

Use the `playwright-e2e-writer` agent to write e2e tests. It knows the project's Playwright setup, selector conventions, and test patterns. Playwright commands and config details are documented in the agent file at `.claude/agents/playwright-e2e-writer.md`.

## Data Model

`sample_data.json` at the repo root is the static data source. Each system has:

- `fides_key` — unique identifier used in `system_dependencies` references
- `system_type` — grouping key (`Application`, `Service`, `Database`, `Integration`)
- `privacy_declarations[]` — each has `data_use`, `data_categories[]`, `data_subjects[]`, `name`
- `system_dependencies[]` — array of `fides_key` strings pointing to other systems

Data category strings use dot-notation taxonomy (e.g. `user.derived.identifiable.location`). The UI should display only the final segment (`location`) for legibility. Full taxonomy reference: https://ethyca.github.io/fideslang/#1-data-categories

## Architecture

The map has two layout modes (toggled by user):
- **By system type** — systems grouped into columns/sections by `system_type`
- **By data use** — systems grouped by their `data_use` values (a system may appear in multiple groups)

Filtering (independent of layout):
- Filter by `data_use` — show only systems that have a matching `privacy_declaration`
- Filter by `data_categories` — show only systems that declare the selected categories

Arrows represent `system_dependencies` between nodes. These must be recomputed whenever the visible set of systems changes.

Data categories shown per system card should be deduplicated across all `privacy_declarations`.
