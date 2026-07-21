# Stimulate

Stimulate is a single catalog for discovering and comparing the AI builder ecosystem:

- Skills
- MCP servers
- Agents
- Prompts
- LLM apps, tooling, evaluation, RAG, and supporting infrastructure

The site keeps this material inside one product experience instead of splitting it across separate pages or redirecting users away to readmes and issue trackers.

## What This Repository Is

This project is a synthesized, curated directory built from the public repositories you provided. The content is normalized into a unified browsing experience and grouped by capability so users can scan the ecosystem quickly.

The site does not copy external README files verbatim. It aggregates the source material into a cleaner index, then presents the key ideas, categories, and linked projects in one place.

## Main Experience

1. Hero overview with live counts for skills, MCP servers, and agents
2. Featured skills, categories, and publishers
3. Explorer for Skills, MCP, Agents, and Prompts
4. Prompt modal viewer with full prompt text
5. Footer navigation and product summary

## Product Scope

### Skills

Task-oriented building blocks, agent skills, prompt-engineering guides, and reusable workflow assets.

### MCP Servers

Model Context Protocol servers, SDKs, connectors, and tool servers.

### Agents

Autonomous agents, coding agents, research agents, browser agents, multi-agent frameworks, and orchestration platforms.

### Prompts

Prompt libraries, system prompts, role prompts, prompt-engineering guides, and prompt patterns shown inside the same Explorer experience instead of a separate section.

### Adjacent Layers

RAG stacks, LLM apps, local model runtimes, evaluation tools, observability, guardrails, sandboxing, and workflow infrastructure.

## Why The Catalog Exists

The ecosystem is fragmented. This project brings together the most useful sources so builders can compare tools without jumping between dozens of repositories.

It is designed for:

- AI builders
- Prompt engineers
- Agent developers
- MCP builders
- Product teams exploring the AI stack

## How The Site Is Organized

### Browse

Use the Explorer to switch between the core tabs and filter by category.

### Inspect

Open an item to review the description, source metadata, and links.

### Read Prompts In Place

Prompt content is rendered in the UI and opened in a modal so users can read it without leaving the site.

### Compare Sources

Projects from the same family are grouped together so users can compare similar repos side by side.

## Data Model

The site is driven by generated local datasets:

- `data/aggregated.json` for the main catalog
- `data/prompts.json` for extracted prompt-library content

Prompt content is collected from curated public repositories, deduplicated locally, filtered for quality, and served through a local API.

## Architecture

```mermaid
flowchart LR
	subgraph Sources
		A[Public GitHub repositories]
		B[Curated prompt repositories]
	end

	# Stimulate

	Stimulate is a single catalog for browsing the AI builder ecosystem without leaving the site.

	It brings together:

	- Skills
	- MCP servers
	- Agents
	- Prompts
	- LLM apps, RAG stacks, local model tools, evaluation systems, guardrails, and workflow infrastructure

	## What This Repository Is

	This project is a synthesized directory built from the public repositories you provided. It does not copy external README files verbatim. Instead, it normalizes the source material into one browsing experience and groups it by capability so users can scan the ecosystem quickly.

	The goal is to keep the most useful builder resources visible inside the product, not scattered across dozens of separate repository pages.

	## Main Experience

	1. Hero overview with live catalog counts
	2. Featured skills, categories, and publishers
	3. Explorer for Skills, MCP, Agents, and Prompts
	4. Prompt modal viewer with full prompt text
	5. Footer navigation and product summary

	## Product Scope

	### Skills

	Task-oriented building blocks, agent skills, prompt-engineering guides, and reusable workflow assets.

	### MCP Servers

	Model Context Protocol servers, SDKs, connectors, and tool servers.

	### Agents

	Autonomous agents, coding agents, research agents, browser agents, multi-agent frameworks, and orchestration platforms.

	### Prompts

	Prompt libraries, system prompts, role prompts, prompt-engineering guides, and prompt patterns shown inside the same Explorer experience instead of a separate section.

	### Adjacent Layers

	RAG stacks, LLM apps, local model runtimes, evaluation tools, observability, guardrails, sandboxing, and workflow infrastructure.

	## Why The Catalog Exists

	The ecosystem is fragmented. This project brings together the most useful sources so builders can compare tools without jumping between dozens of repositories.

	It is designed for:

	- AI builders
	- Prompt engineers
	- Agent developers
	- MCP builders
	- Product teams exploring the AI stack

	## How The Site Is Organized

	### Browse

	Use the Explorer to switch between the core tabs and filter by category.

	### Inspect

	Open an item to review the description and source metadata.

	### Read Prompts In Place

	Prompt content is rendered in the UI and opened in a modal so users can read it without leaving the site.

	### Compare Sources

	Projects from the same family are grouped together so users can compare similar items side by side.

	## Data Model

	The site is driven by generated local datasets:

	- `data/aggregated.json` for the main catalog
	- `data/prompts.json` for extracted prompt-library content

	Prompt content is collected from curated public repositories, deduplicated locally, filtered for quality, and served through a local API.

	## Architecture

	```mermaid
flowchart LR
subgraph Sources
A[Public GitHub repositories]
B[Curated prompt repositories]
end

subgraph Ingestion
C[Clone and normalize]
D[Deduplicate and filter]
E["data/aggregated.json"]
F["data/prompts.json"]
end

subgraph App
G["src/app/page.tsx"]
H["src/components/explorer/Explorer.tsx"]
I["src/app/api/prompts/route.ts"]
end

A --> C
B --> C
C --> D
D --> E
D --> F
E --> G
F --> I
I --> H
G --> H
	```

	## Prompt Flow

	```mermaid
flowchart LR
A[Prompt repository] --> B[Local extraction]
B --> C[Deduplication]
C --> D[Quality filtering]
D --> E["data/prompts.json"]
E --> F["/api/prompts"]
F --> G[Explorer prompt tab]
G --> H[Full prompt modal]
	```

	## Source Families Represented

	### Awesome AI Agents And General Lists

	Curated discovery lists covering agents, CLI coding agents, LLM agents, AI agents, and app catalogs.

	### MCP And Tooling

	The official Model Context Protocol organization, SDKs, server collections, and popular MCP server implementations.

	### Prompt Libraries And Prompt Engineering

	Prompt repositories, prompt-engineering guides, system prompt collections, and prompt safety resources.

	### LLM Apps, Frameworks, And Agent Builders

	Frameworks and app builders such as LangChain, LangGraph, AutoGen, Semantic Kernel, CrewAI, MetaGPT, ChatDev, OpenHands, OpenDevin, Flowise, Dify, and related projects.

	### RAG, Search, And Knowledge Systems

	RAG pipelines, retrieval frameworks, search assistants, document parsers, memory systems, and knowledge engines such as llama_index, Haystack, ragflow, txtai, mem0, zep, Jina, Weaviate tools, GraphRAG, LightRAG, and similar projects.

	### Local Models And Inference

	Local model runtimes, inference servers, open model tooling, and training utilities such as Ollama, llama.cpp, vLLM, TGI, FastChat, Open WebUI, Jan, LocalAI, MLC-LLM, Exo, transformers, PEFT, TRL, and Unsloth.

	### Browser, Web, And Automation Agents

	Browser automation, web agents, and site interaction tools such as browser-use, BrowserGym, Playwright, Puppeteer, Stagehand, Firecrawl, Crawl4AI, Skyvern, Selenium, and similar projects.

	### Voice, Vision, And Multimodal Agents

	Voice agents, transcription, TTS, and multimodal tooling such as LiveKit Agents, Pipecat, Whisper, Whisper.cpp, Coqui TTS, OpenVoice, Piper, Smolagents, and vision agents.

	### Monitoring, Evaluation, Guardrails, And LLMOps

	Observability, evals, guardrails, red teaming, and tracing tools such as Langfuse, Phoenix, DeepEval, Ragas, promptfoo, Braintrust, Helicone, Guardrails, NeMo Guardrails, and related projects.

	### Platform, Infrastructure, And Tooling

	SDKs, orchestration, sandboxing, app frameworks, vector databases, and infra tools such as Composio, Unstructured, E2B, Daytona, Modal examples, n8n, Chainlit, Gradio, Streamlit, FastAPI, Reflex, Vanna, DB-GPT, DuckDB, Chroma, Qdrant, Weaviate, Milvus, pgvector, Redis, Vespa, Marqo, Turbopuffer, LanceDB, and FAISS.

	## Site Behavior

	- Skills, MCP servers, and agents are shown through the catalog explorer.
	- Prompts are available in the same explorer experience as a dedicated tab.
	- Prompt cards open a modal overlay with the full prompt text.
	- The prompt feed is filtered to English-like, higher-quality entries.
	- The UI avoids forcing the user out to GitHub for every item.

	## User Experience Notes

	The UI is designed to stay focused and practical:

	- Square, consistent controls
	- Fast filtering and search
	- Prompt cards with a full-view modal
	- English-only visible card copy
	- Responsive layout for desktop, tablet, and mobile

	## Tech Stack

	- Next.js 16
	- React 19
	- TypeScript
	- Tailwind CSS v4 + custom CSS

	## Development

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
	- `src/components` - dashboard sections and explorer UI
	- `src/lib/data` - dataset loaders
	- `scripts/ingest` - local extraction and ingestion scripts
	- `data` - generated datasets used by the site

	## Notes

	This repository is intentionally focused on browsing, comparison, and reuse. The content is normalized, deduplicated, and surfaced directly inside the product instead of remaining as scattered repository links.