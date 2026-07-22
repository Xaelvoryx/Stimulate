# PromptVault Master Extraction Engine v1.0

Autonomous Prompt Extraction, Classification, Deduplication, and Knowledge Structuring System.

## Overview

PromptVault is a comprehensive system designed to crawl, analyze, extract, normalize, classify, validate, and store high-quality AI prompts from multiple repositories and datasets across the internet.

## Features

- **Multi-Repository Crawling**: Automatically clones and processes repositories from GitHub
- **Multi-Format Extraction**: Extracts prompts from Markdown, JSON, YAML, TXT, HTML, XML, and CSV files
- **Intelligent Classification**: Auto-categorizes prompts with tags, categories, and metadata
- **Deduplication**: Removes exact and near-duplicate prompts using similarity algorithms
- **Quality Scoring**: Assesses prompt quality and difficulty levels
- **Multiple Output Formats**: Generates JSON, Markdown, CSV, Parquet, and JSONL outputs
- **Search Indexes**: Creates category, tag, repository, and difficulty indexes
- **Statistics**: Comprehensive statistics and analytics on extracted prompts

## Installation

```bash
cd PromptVault
npm install
```

## Usage

### Full Extraction

```bash
npm run full
```

This will:
1. Clone all configured repositories
2. Extract prompts from all supported file formats
3. Generate metadata and classifications
4. Deduplicate prompts
5. Generate all output formats
6. Create search indexes
7. Generate statistics

### Individual Steps

```bash
# Extract only
npm run extract

# Process only
npm run process

# Generate outputs only
npm run generate
```

## Configuration

Edit `config.json` to customize:

- Repository tiers and URLs
- Output formats
- Categories and tags
- File extensions to process
- Ignore patterns
- Processing parameters

## Output Structure

```
output/
├── json/              # JSON files
├── markdown/          # Markdown documentation
├── csv/               # CSV files
├── parquet/           # Parquet files
├── jsonl/             # JSONL files (embeddings-ready)
└── indexes/           # Search indexes
```

## Repository Tiers

The system processes repositories in 17 tiers:

- **Tier 1**: Largest prompt libraries
- **Tier 2**: System prompts / AI tools
- **Tier 3**: Claude / Cursor / AI coding
- **Tier 4**: Copilot / Microsoft
- **Tier 5**: Gemini
- **Tier 6**: OpenAI
- **Tier 7**: Agents
- **Tier 8**: RAG
- **Tier 9**: Image prompts
- **Tier 10**: Prompt datasets
- **Tier 11**: ShareGPT / conversations
- **Tier 12**: LLM benchmarks
- **Tier 13**: Prompt optimization
- **Tier 14**: Awesome AI
- **Tier 15**: Chatbots
- **Tier 16**: MCP
- **Tier 17**: Security

## Prompt Schema

Each extracted prompt includes:

- `id`: Unique identifier
- `title`: Prompt title
- `description`: Description
- `prompt`: The actual prompt text
- `category`: Auto-assigned category
- `subcategory`: Subcategory
- `tags`: Auto-generated tags
- `models`: Detected AI models
- `tools`: Detected tools
- `frameworks`: Detected frameworks
- `languages`: Detected programming languages
- `variables`: Extracted variables
- `difficulty`: Difficulty level (beginner/expert)
- `qualityScore`: Quality score (0-100)
- `popularityScore`: Popularity score (0-100)
- `repository`: Source repository
- `repositoryUrl`: Repository URL
- `repositoryStars`: Repository star count
- `repositoryForks`: Repository fork count
- `embeddingText`: Text for embeddings
- `relatedPrompts`: Related prompt IDs
- `similarityHash`: Hash for similarity detection

## Error Handling

The system automatically:
- Skips repositories that fail to clone
- Continues processing if individual files fail
- Logs all errors for review
- Provides detailed statistics

## Statistics

After extraction, the system generates:

- Total prompt count
- Category distribution
- Tag distribution
- Repository distribution
- Difficulty distribution
- Quality distribution
- Average quality and popularity scores
- Total stars and forks

## License

MIT
