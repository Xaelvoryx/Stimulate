# Stimulate — The Complete AI Builder Catalog

A fast, searchable catalog of **AI skills, MCP servers, agents, and repositories** — all in one place. Built with Next.js and the App Router, statically generated for instant loads.

## Features

- **13,000+ curated entries** across skills, MCP servers, agents, and repositories
- **Instant search** by name, description, or link
- **Category tabs** — All / Skills / MCP / Agents / Repositories
- **Section filter** for fine-grained drill-down
- **Featured repositories** highlight
- Fully **static** and responsive UI

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
  app/            App Router entry, layout, global styles
  components/
    dashboard/    Hero, StatsGrid, TopRepositories
    explorer/     Searchable/filterable catalog table
    layout/       Site footer
  lib/data/       Dataset loader
  types/          Shared TypeScript types
data/             Catalog dataset (aggregated.json)
```

## License

MIT
