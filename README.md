# Stimulate

Stimulate is a curated AI skills directory that brings together skills, MCP servers, agents, and prompt libraries into a single, fast, searchable site.

The goal is simple: keep the most useful builder resources visible inside the site itself, with clean cards, direct access, and a practical workflow for discovery.

## What It Contains

- Skills: curated AI skills and tool recipes
- MCP servers: Model Context Protocol tools and integrations
- Agents: autonomous and multi-agent systems
- Prompts: extracted prompt libraries and system-prompt collections rendered directly inside the site

## Key Sections

- Hero overview with live catalog counts
- Featured skills, categories, and publisher highlights
- Skills / MCP / Agents explorer with search and filtering
- Prompt library with on-site prompt cards and a full prompt viewer
- Site footer navigation and summary links

## Prompt Library

The prompt library is built from cloned source repositories, deduplicated locally, and surfaced in the UI without sending users away to GitHub.

Each prompt entry includes:

- Title
- Short English summary
- Full prompt content
- Source repository
- Source path inside the repository
- Tier label

## Data Pipeline

The site uses local generated datasets:

- `data/aggregated.json` for the main catalog
- `data/prompts.json` for extracted prompt entries

Prompt content is ingested from the repositories you provided, normalized, deduplicated, and then served through a local API for browsing.

## Notable Features

- Fast local browsing with search and filters
- English-only display for card content
- On-site prompt viewing with a modal overlay
- Square, consistent UI controls
- Responsive layout for desktop, tablet, and mobile

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4 + custom CSS

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Ingestion Commands

- `npm run ingest` - existing catalog ingestion flow
- `npm run ingest:master` - existing master list ingestion flow
- `npm run ingest:prompts` - prompt extraction from curated repositories

## Repository Layout

- `src/app` - routes, layout, and API endpoints
- `src/components` - UI sections and dashboard widgets
- `src/lib/data` - dataset loaders
- `scripts/ingest` - local extraction and ingestion scripts
- `data` - generated datasets consumed by the site

## Notes

This site is intentionally focused on builder resources. The content is designed to stay inside the site experience, with prompt text rendered directly rather than redirecting users away from the catalog.