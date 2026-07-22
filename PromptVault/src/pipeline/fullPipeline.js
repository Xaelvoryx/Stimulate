import fs from 'fs-extra';
import path from 'path';
import GitHubCrawler from '../github/crawler.js';
import PromptExtractor from '../extractors/promptExtractor.js';
import PromptDeduplicator from '../processors/deduplicator.js';
import MetadataGenerator from '../processors/metadataGenerator.js';
import OutputGenerator from '../generators/outputGenerator.js';
import { getAllRepositories, PROCESSABLE_EXTENSIONS, IGNORE_PATTERNS } from '../../config/repositories.js';
import { sleep, chunkArray } from '../utils/helpers.js';

class FullPipeline {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './PromptVault/output',
      reposDir: options.reposDir || './PromptVault/repos',
      formats: options.formats || ['json', 'csv', 'jsonl', 'markdown'],
      maxConcurrentRepos: options.maxConcurrentRepos || 3,
      rateLimitDelay: options.rateLimitDelay || 1000,
      ...options
    };
    
    this.crawler = new GitHubCrawler({
      token: this.options.githubToken,
      rateLimitDelay: this.options.rateLimitDelay
    });
    
    this.extractor = new PromptExtractor();
    this.deduplicator = new PromptDeduplicator();
    this.metadataGenerator = new MetadataGenerator();
    this.outputGenerator = new OutputGenerator({
      outputDir: this.options.outputDir,
      formats: this.options.formats
    });
    
    this.stats = {
      repositoriesProcessed: 0,
      repositoriesFailed: 0,
      filesProcessed: 0,
      promptsExtracted: 0,
      promptsAfterDeduplication: 0,
      startTime: null,
      endTime: null
    };
  }

  async run() {
    this.stats.startTime = new Date();
    console.log('Starting PromptVault Extraction Engine');
    console.log('=====================================');
    
    try {
      // Step 1: Get all repositories
      const repositories = getAllRepositories();
      console.log(`Found ${repositories.length} repositories to process`);
      
      // Step 2: Process repositories in batches
      const allPrompts = await this.processRepositories(repositories);
      
      console.log(`Total prompts extracted: ${allPrompts.length}`);
      
      // Step 3: Deduplicate prompts
      console.log('Starting deduplication...');
      const deduplicationResult = this.deduplicator.deduplicate(allPrompts);
      const deduplicatedPrompts = deduplicationResult.prompts;
      
      this.stats.promptsAfterDeduplication = deduplicatedPrompts.length;
      console.log(`Prompts after deduplication: ${deduplicatedPrompts.length}`);
      
      // Step 4: Generate metadata
      console.log('Generating metadata...');
      const enrichedPrompts = this.metadataGenerator.generateBatchMetadata(deduplicatedPrompts);
      
      // Step 5: Generate outputs
      console.log('Generating outputs...');
      await this.outputGenerator.generateAll(enrichedPrompts, this.options);
      
      // Step 6: Generate folder structure
      console.log('Generating folder structure...');
      await this.generateFolderStructure(enrichedPrompts);
      
      // Step 7: Generate final statistics
      this.stats.endTime = new Date();
      await this.generateFinalReport(enrichedPrompts, deduplicationResult.stats);
      
      console.log('=====================================');
      console.log('Pipeline completed successfully!');
      this.printStats();
      
      return {
        success: true,
        prompts: enrichedPrompts,
        stats: this.stats
      };
      
    } catch (error) {
      console.error('Pipeline failed:', error);
      this.stats.endTime = new Date();
      throw error;
    }
  }

  async processRepositories(repositories) {
    const allPrompts = [];
    const chunks = chunkArray(repositories, this.options.maxConcurrentRepos);
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing batch ${i + 1}/${chunks.length} (${chunks[i].length} repositories)`);
      
      const batchPrompts = await Promise.all(
        chunks[i].map(repo => this.processRepository(repo))
      );
      
      batchPrompts.forEach(prompts => {
        if (prompts) {
          allPrompts.push(...prompts);
        }
      });
      
      console.log(`Batch ${i + 1} complete. Total prompts so far: ${allPrompts.length}`);
      
      // Rate limiting between batches
      if (i < chunks.length - 1) {
        await sleep(this.options.rateLimitDelay * 2);
      }
    }
    
    this.stats.promptsExtracted = allPrompts.length;
    return allPrompts;
  }

  async processRepository(repoUrl) {
    try {
      console.log(`Processing: ${repoUrl}`);
      
      // Clone and process repository
      const result = await this.crawler.processRepository(repoUrl, {
        cloneDir: this.options.reposDir,
        extensions: PROCESSABLE_EXTENSIONS
      });
      
      if (!result.success) {
        console.error(`Failed to process ${repoUrl}: ${result.error}`);
        this.stats.repositoriesFailed++;
        return [];
      }
      
      this.stats.repositoriesProcessed++;
      
      // Extract prompts from files
      const prompts = [];
      for (const file of result.files) {
        try {
          const filePrompts = await this.extractor.extractFromFile(file.fullPath, result.repoInfo);
          prompts.push(...filePrompts);
          this.stats.filesProcessed++;
        } catch (error) {
          console.error(`Error extracting from ${file.path}:`, error.message);
        }
      }
      
      console.log(`Extracted ${prompts.length} prompts from ${repoUrl}`);
      
      // Cleanup cloned repository
      await this.crawler.cleanup(result.clonePath);
      
      return prompts;
      
    } catch (error) {
      console.error(`Error processing ${repoUrl}:`, error.message);
      this.stats.repositoriesFailed++;
      return [];
    }
  }

  async generateFolderStructure(prompts) {
    const baseDir = this.options.outputDir;
    
    // Create main category folders
    const categories = new Set(prompts.map(p => p.category || 'General'));
    
    for (const category of categories) {
      const categoryPath = path.join(baseDir, category.replace(/\s+/g, '_'));
      await fs.ensureDir(categoryPath);
    }
    
    // Create specialized folders
    const specializedFolders = [
      'AI',
      'Programming',
      'Frontend',
      'Backend',
      'Cloud',
      'DevOps',
      'Agents',
      'PromptEngineering',
      'Business',
      'Marketing',
      'Education',
      'Medical',
      'Legal',
      'ImageGeneration',
      'Datasets',
      'SystemPrompts',
      'DeveloperPrompts',
      'ToolPrompts',
      'WorkflowPrompts',
      'Reasoning',
      'FunctionCalling',
      'RAG',
      'MCP',
      'Cursor',
      'Claude',
      'Gemini',
      'GPT',
      'OpenAI',
      'Copilot'
    ];
    
    for (const folder of specializedFolders) {
      const folderPath = path.join(baseDir, folder);
      await fs.ensureDir(folderPath);
    }
    
    // Copy prompts to category folders
    for (const category of categories) {
      const categoryPrompts = prompts.filter(p => (p.category || 'General') === category);
      const categoryPath = path.join(baseDir, category.replace(/\s+/g, '_'));
      
      await this.outputGenerator.generateJSON(
        categoryPrompts,
        path.join(categoryPath, 'prompts.json')
      );
      
      await this.outputGenerator.generateMarkdown(
        categoryPrompts,
        path.join(categoryPath, 'prompts.md')
      );
    }
    
    console.log('Folder structure generated successfully');
  }

  async generateFinalReport(prompts, dedupStats) {
    const report = {
      generatedAt: new Date().toISOString(),
      pipeline: {
        startTime: this.stats.startTime.toISOString(),
        endTime: this.stats.endTime.toISOString(),
        duration: this.stats.endTime - this.stats.startTime
      },
      repositories: {
        total: this.stats.repositoriesProcessed + this.stats.repositoriesFailed,
        processed: this.stats.repositoriesProcessed,
        failed: this.stats.repositoriesFailed
      },
      files: {
        processed: this.stats.filesProcessed
      },
      prompts: {
        extracted: this.stats.promptsExtracted,
        afterDeduplication: this.stats.promptsAfterDeduplication,
        final: prompts.length
      },
      deduplication: dedupStats,
      metadata: this.metadataGenerator.getStats(prompts),
      outputs: {
        directory: this.options.outputDir,
        formats: this.options.formats
      }
    };
    
    const reportPath = path.join(this.options.outputDir, 'pipeline-report.json');
    await fs.writeJSON(reportPath, report, { spaces: 2 });
    console.log(`Pipeline report generated: ${reportPath}`);
    
    return reportPath;
  }

  printStats() {
    console.log('\n=== Pipeline Statistics ===');
    console.log(`Duration: ${Math.round((this.stats.endTime - this.stats.startTime) / 1000)}s`);
    console.log(`Repositories: ${this.stats.repositoriesProcessed} processed, ${this.stats.repositoriesFailed} failed`);
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Prompts extracted: ${this.stats.promptsExtracted}`);
    console.log(`Prompts after deduplication: ${this.stats.promptsAfterDeduplication}`);
    console.log(`========================\n`);
  }

  async processSingleRepository(repoUrl) {
    console.log(`Processing single repository: ${repoUrl}`);
    
    const prompts = await this.processRepository(repoUrl);
    
    if (prompts.length === 0) {
      console.log('No prompts extracted');
      return [];
    }
    
    // Deduplicate
    const deduplicationResult = this.deduplicator.deduplicate(prompts);
    const deduplicatedPrompts = deduplicationResult.prompts;
    
    // Generate metadata
    const enrichedPrompts = this.metadataGenerator.generateBatchMetadata(deduplicatedPrompts);
    
    // Generate outputs
    await this.outputGenerator.generateAll(enrichedPrompts, {
      formats: ['json', 'markdown']
    });
    
    console.log(`Processed ${enrichedPrompts.length} prompts from ${repoUrl}`);
    
    return enrichedPrompts;
  }
}

export default FullPipeline;
