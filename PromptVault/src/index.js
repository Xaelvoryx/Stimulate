import fs from 'fs-extra';
import path from 'path';
import RepoCrawler from './crawlers/repoCrawler.js';
import PromptExtractor from './processors/promptExtractor.js';
import MetadataGenerator from './processors/metadataGenerator.js';
import Deduplicator from './processors/deduplicator.js';
import OutputGenerator from './generators/outputGenerator.js';

class PromptVaultEngine {
  constructor(configPath) {
    this.config = this.loadConfig(configPath);
    this.crawler = new RepoCrawler(this.config);
    this.extractor = new PromptExtractor(this.config);
    this.metadataGenerator = new MetadataGenerator(this.config);
    this.deduplicator = new Deduplicator(this.config);
    this.outputGenerator = new OutputGenerator(this.config);
    this.allPrompts = [];
    this.processingStats = {
      reposProcessed: 0,
      reposFailed: 0,
      promptsExtracted: 0,
      promptsDeduplicated: 0,
      startTime: null,
      endTime: null
    };
  }

  loadConfig(configPath) {
    try {
      const config = fs.readJsonSync(configPath);
      console.log('Configuration loaded successfully');
      return config;
    } catch (error) {
      console.error('Error loading config:', error.message);
      process.exit(1);
    }
  }

  async initialize() {
    console.log('=== PromptVault Master Extraction Engine v1.0 ===\n');
    this.processingStats.startTime = new Date();
    await this.crawler.initialize();
  }

  async runFullExtraction() {
    console.log('\n=== Starting Full Extraction Process ===\n');
    
    await this.initialize();
    
    const crawlResults = await this.crawler.processAllTiers();
    
    for (const [tierName, results] of Object.entries(crawlResults)) {
      await this.processTierResults(tierName, results);
    }

    console.log('\n=== Processing Complete ===');
    console.log(`Total prompts extracted: ${this.allPrompts.length}`);

    await this.postProcess();
    await this.generateOutputs();
    await this.finalize();

    return this.processingStats;
  }

  async processTierResults(tierName, results) {
    console.log(`\n=== Processing ${tierName} Results ===`);
    
    for (const result of results) {
      if (result.status === 'success') {
        await this.processRepository(result);
        this.processingStats.reposProcessed++;
      } else {
        this.processingStats.reposFailed++;
        console.log(`Skipping failed repo: ${result.repoInfo?.fullName}`);
      }
    }
  }

  async processRepository(result) {
    console.log(`\nProcessing repository: ${result.repoInfo.fullName}`);
    
    try {
      const prompts = await this.extractor.extractFromDirectory(
        result.path,
        result.repoInfo,
        result.repoData
      );

      if (prompts.length > 0) {
        this.allPrompts.push(...prompts);
        this.processingStats.promptsExtracted += prompts.length;
        console.log(`Extracted ${prompts.length} prompts from ${result.repoInfo.fullName}`);
      }
    } catch (error) {
      console.error(`Error processing ${result.repoInfo.fullName}:`, error.message);
    }
  }

  async postProcess() {
    console.log('\n=== Post-Processing ===');
    
    console.log('Generating metadata...');
    this.allPrompts = this.metadataGenerator.processBatch(this.allPrompts);
    
    console.log('Generating related prompts...');
    this.allPrompts = this.allPrompts.map(prompt => ({
      ...prompt,
      relatedPrompts: this.metadataGenerator.generateRelatedPrompts(prompt, this.allPrompts)
    }));

    console.log('Deduplicating...');
    const originalCount = this.allPrompts.length;
    this.allPrompts = this.deduplicator.deduplicate(this.allPrompts);
    this.processingStats.promptsDeduplicated = originalCount - this.allPrompts.length;
    
    const dedupStats = this.deduplicator.getStats(originalCount, this.allPrompts.length);
    console.log(`Deduplication stats:`, dedupStats);
  }

  async generateOutputs() {
    console.log('\n=== Generating Outputs ===');
    await this.outputGenerator.generateAll(this.allPrompts);
  }

  async finalize() {
    this.processingStats.endTime = new Date();
    const duration = (this.processingStats.endTime - this.processingStats.startTime) / 1000;
    
    console.log('\n=== Extraction Complete ===');
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(`Repositories processed: ${this.processingStats.reposProcessed}`);
    console.log(`Repositories failed: ${this.processingStats.reposFailed}`);
    console.log(`Prompts extracted: ${this.processingStats.promptsExtracted}`);
    console.log(`Prompts deduplicated: ${this.processingStats.promptsDeduplicated}`);
    console.log(`Final prompt count: ${this.allPrompts.length}`);

    await this.saveProcessingStats();
    await this.crawler.cleanup();
  }

  async saveProcessingStats() {
    const statsFile = path.join(process.cwd(), 'logs', 'processing_stats.json');
    await fs.ensureDir(path.dirname(statsFile));
    await fs.writeJson(statsFile, this.processingStats, { spaces: 2 });
    console.log(`Processing stats saved to ${statsFile}`);
  }
}

async function main() {
  console.log('Starting PromptVault...');
  const configPath = path.join(process.cwd(), 'config.json');
  console.log('Config path:', configPath);
  const engine = new PromptVaultEngine(configPath);
  
  try {
    console.log('Running full extraction...');
    await engine.runFullExtraction();
    console.log('\n✓ PromptVault extraction completed successfully');
  } catch (error) {
    console.error('\n✗ Extraction failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

console.log('Script loaded');
main();

export default PromptVaultEngine;
