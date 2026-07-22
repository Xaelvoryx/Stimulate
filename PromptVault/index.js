#!/usr/bin/env node

import FullPipeline from './src/pipeline/fullPipeline.js';
import { getAllRepositories } from './config/repositories.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'run';

const options = {
  githubToken: process.env.GITHUB_TOKEN,
  outputDir: process.env.OUTPUT_DIR || './PromptVault/output',
  reposDir: process.env.REPOS_DIR || './PromptVault/repos',
  formats: (process.env.FORMATS || 'json,csv,jsonl,markdown').split(','),
  maxConcurrentRepos: parseInt(process.env.MAX_CONCURRENT_REPOS) || 3,
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY) || 1000
};

// Handle specific repository
if (command === 'single' && args[1]) {
  options.singleRepo = args[1];
}

async function main() {
  console.log('PromptVault Master Extraction Engine v1.0');
  console.log('=========================================\n');
  
  const pipeline = new FullPipeline(options);
  
  try {
    if (command === 'single' && options.singleRepo) {
      console.log(`Processing single repository: ${options.singleRepo}\n`);
      await pipeline.processSingleRepository(options.singleRepo);
    } else if (command === 'list') {
      const repos = getAllRepositories();
      console.log(`Found ${repos.length} repositories to process:\n`);
      repos.forEach((repo, index) => {
        console.log(`${index + 1}. ${repo}`);
      });
    } else if (command === 'run' || command === 'full') {
      await pipeline.run();
    } else {
      console.log('Usage:');
      console.log('  node index.js run              - Run full pipeline');
      console.log('  node index.js full             - Run full pipeline (alias)');
      console.log('  node index.js single <repo>    - Process single repository');
      console.log('  node index.js list             - List all repositories');
      console.log('\nEnvironment variables:');
      console.log('  GITHUB_TOKEN           - GitHub API token for rate limiting');
      console.log('  OUTPUT_DIR             - Output directory (default: ./PromptVault/output)');
      console.log('  REPOS_DIR              - Repositories clone directory (default: ./PromptVault/repos)');
      console.log('  FORMATS                - Output formats (default: json,csv,jsonl,markdown)');
      console.log('  MAX_CONCURRENT_REPOS   - Max concurrent repositories (default: 3)');
      console.log('  RATE_LIMIT_DELAY       - Rate limit delay in ms (default: 1000)');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
