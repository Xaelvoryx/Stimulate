# PromptVault Master Extraction Engine v1.0

Autonomous Prompt Extraction, Classification, Deduplication, and Knowledge Structuring System.

## Overview

PromptVault is a comprehensive system designed to crawl, analyze, extract, normalize, classify, validate, and store every high-quality AI prompt from hundreds of repositories and datasets across the internet.

## Features

- **Multi-Repository Crawling**: Automatically processes 100+ GitHub repositories
- **Multi-Format Extraction**: Extracts prompts from Markdown, JSON, YAML, XML, CSV, HTML, TXT
- **Advanced Deduplication**: Uses exact matching and similarity-based deduplication
- **Metadata Generation**: Auto-generates tags, categories, embeddings, quality scores
- **Multiple Output Formats**: JSON, CSV, JSONL, Markdown, Parquet
- **Search Index**: Built-in search index for fast prompt discovery
- **Category Organization**: Automatic categorization and folder structure generation
- **Quality Scoring**: Intelligent quality assessment for each prompt
- **Statistics & Analytics**: Comprehensive statistics and rankings

## Installation

```bash
cd PromptVault
npm install
```

## Configuration

Set environment variables:

```bash
export GITHUB_TOKEN="your_github_token"
export OUTPUT_DIR="./PromptVault/output"
export REPOS_DIR="./PromptVault/repos"
export FORMATS="json,csv,jsonl,markdown"
export MAX_CONCURRENT_REPOS="3"
export RATE_LIMIT_DELAY="1000"
```

## Usage

### Run Full Pipeline

Process all configured repositories:

```bash
npm start
# or
node index.js run
```

### Process Single Repository

Process a specific repository:

```bash
node index.js single https://github.com/f/awesome-chatgpt-prompts
```

### List All Repositories

View all configured repositories:

```bash
node index.js list
```

## Repository Tiers

The system processes repositories organized by tiers:

- **Tier 1**: Largest prompt libraries (awesome-chatgpt-prompts, etc.)
- **Tier 2**: System prompts / AI tools
- **Tier 3**: Claude / Cursor / AI coding tools
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
- **Tier 18**: Role prompts
- **Tier 19**: Categories
- **Tier 20**: Hugging Face datasets

## Output Structure

```
PromptVault/
├── output/
│   ├── prompts.json              # Main JSON output
│   ├── prompts.jsonl             # JSONL for streaming
│   ├── prompts.csv               # CSV format
│   ├── prompts.md                # Markdown documentation
│   ├── search-index.json         # Search index
│   ├── category-index.json       # Category organization
│   ├── statistics.json           # Statistics and rankings
│   ├── pipeline-report.json      # Pipeline execution report
│   ├── AI/                       # Category folders
│   ├── Programming/
│   ├── Frontend/
│   ├── Backend/
│   ├── Cloud/
│   ├── DevOps/
│   ├── Agents/
│   ├── PromptEngineering/
│   ├── Business/
│   ├── Marketing/
│   ├── Education/
│   ├── Medical/
│   ├── Legal/
│   ├── ImageGeneration/
│   ├── Datasets/
│   ├── SystemPrompts/
│   ├── DeveloperPrompts/
│   ├── ToolPrompts/
│   ├── WorkflowPrompts/
│   ├── Reasoning/
│   ├── FunctionCalling/
│   ├── RAG/
│   ├── MCP/
│   ├── Cursor/
│   ├── Claude/
│   ├── Gemini/
│   ├── GPT/
│   ├── OpenAI/
│   └── Copilot/
└── repos/                        # Temporary clone directory
```

## Prompt Schema

Each prompt includes the following fields:

```json
{
  "id": "unique-identifier",
  "slug": "prompt-slug",
  "title": "Prompt Title",
  "description": "Prompt description",
  "prompt": "Actual prompt text",
  "systemPrompt": "System prompt if available",
  "developerPrompt": "Developer prompt if available",
  "userPrompt": "User prompt if available",
  "category": "Primary category",
  "subcategory": "Secondary category",
  "tags": ["tag1", "tag2"],
  "models": ["gpt-4", "claude-3"],
  "tools": ["langchain", "cursor"],
  "frameworks": ["react", "nextjs"],
  "languages": ["javascript", "python"],
  "variables": ["variable1", "variable2"],
  "difficulty": "intermediate",
  "qualityScore": 85,
  "popularityScore": 7.5,
  "embeddingText": "Text for embeddings",
  "exampleInput": "Example input",
  "exampleOutput": "Example output",
  "author": "Author name",
  "repository": "Repository name",
  "repositoryUrl": "https://github.com/...",
  "repositoryStars": 1000,
  "repositoryForks": 200,
  "repositoryLicense": "MIT",
  "filePath": "path/to/file.md",
  "commitHash": "abc123",
  "sourceUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "lastVerified": "2024-01-01T00:00:00Z",
  "relatedPrompts": ["id1", "id2"],
  "similarityHash": "md5hash",
  "duplicates": ["id3"],
  "vectorReady": true,
  "searchReady": true
}
```

## Pipeline Architecture

1. **Repository Discovery**: Identify and fetch repository information
2. **Repository Cloning**: Clone repositories locally
3. **File Scanning**: Scan for processable file types
4. **Prompt Extraction**: Extract prompts using multiple strategies
5. **Deduplication**: Remove exact and near-duplicates
6. **Metadata Generation**: Generate comprehensive metadata
7. **Quality Scoring**: Calculate quality and popularity scores
8. **Output Generation**: Generate multiple output formats
9. **Index Creation**: Create search and category indexes
10. **Statistics**: Generate comprehensive statistics

## Advanced Features

### Deduplication

- **Exact Duplication**: MD5 hash-based exact duplicate removal
- **Near Duplication**: Jaccard, Cosine, and Levenshtein similarity
- **Metadata Merging**: Merge metadata from duplicate prompts
- **Relationship Tracking**: Track related prompts and duplicates

### Metadata Generation

- **Automatic Categorization**: Content-based category assignment
- **Tag Generation**: Automatic tag extraction from content
- **Language Detection**: Programming language detection
- **Model Detection**: AI model detection (GPT, Claude, etc.)
- **Tool Detection**: Framework and tool detection
- **Variable Extraction**: Extract template variables
- **Quality Scoring**: Multi-factor quality assessment
- **Popularity Scoring**: Repository-based popularity calculation

### Quality Scoring Factors

- Prompt length and structure
- Content indicators (examples, steps)
- Technical complexity
- Code block presence
- Repository popularity
- User engagement metrics

## Development

### Project Structure

```
PromptVault/
├── config/
│   └── repositories.js          # Repository configuration
├── src/
│   ├── github/
│   │   └── crawler.js          # GitHub API crawler
│   ├── extractors/
│   │   └── promptExtractor.js  # Prompt extraction logic
│   ├── processors/
│   │   ├── deduplicator.js     # Deduplication system
│   │   └── metadataGenerator.js # Metadata generation
│   ├── generators/
│   │   └── outputGenerator.js  # Output generation
│   ├── pipeline/
│   │   └── fullPipeline.js     # Main pipeline orchestration
│   └── utils/
│       └── helpers.js          # Utility functions
├── index.js                    # Main entry point
├── package.json                # Dependencies
└── README.md                   # This file
```

### Adding New Repositories

Edit `config/repositories.js` to add new repositories to the appropriate tier:

```javascript
TIER_1: [
  'https://github.com/your/new-repo'
]
```

### Custom Extraction Patterns

Modify `src/extractors/promptExtractor.js` to add custom extraction patterns for specific file formats or content structures.

## Performance

- **Concurrent Processing**: Configurable concurrent repository processing
- **Rate Limiting**: Built-in rate limiting for GitHub API
- **Memory Efficient**: Stream processing for large datasets
- **Progress Tracking**: Real-time progress updates

## Statistics

The system generates comprehensive statistics including:

- Total prompts processed
- Deduplication statistics
- Category distribution
- Quality score distribution
- Popular repositories
- Top prompts by quality
- Top prompts by popularity
- Tag frequency analysis
- Language distribution
- Model distribution
- Tool distribution

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

## Support

For issues and questions, please open an issue on the repository.

## Acknowledgments

Built for the AI builder community to help organize and structure the world's AI prompts.
