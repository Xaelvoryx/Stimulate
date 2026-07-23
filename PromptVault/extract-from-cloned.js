import PromptExtractor from './src/processors/promptExtractor.js';
import MetadataGenerator from './src/processors/metadataGenerator.js';
import Deduplicator from './src/processors/deduplicator.js';
import OutputGenerator from './src/generators/outputGenerator.js';
import fs from 'fs-extra';
import path from 'path';

const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf-8'));

const extractor = new PromptExtractor(config);
const metadataGenerator = new MetadataGenerator(config);
const deduplicator = new Deduplicator(config);
const outputGenerator = new OutputGenerator(config);

async function extractFromClonedRepos() {
  const reposDir = path.join(process.cwd(), 'repos');
  const allPrompts = [];
  
  const repoDirs = fs.readdirSync(reposDir).filter(name => 
    fs.statSync(path.join(reposDir, name)).isDirectory()
  );
  
  console.log(`Found ${repoDirs.length} cloned repositories`);
  
  for (const repoDir of repoDirs) {
    const repoPath = path.join(reposDir, repoDir);
    console.log(`\nProcessing ${repoDir}...`);
    
    const repoInfo = {
      owner: 'unknown',
      repo: repoDir,
      fullName: repoDir
    };
    
    const repoData = {
      stars: 0,
      forks: 0,
      license: 'Unknown'
    };
    
    try {
      const prompts = await extractor.extractFromDirectory(repoPath, repoInfo, repoData);
      
      // Filter out prompts from _meta.json files
      const filteredPrompts = prompts.filter(p => !p.filePath.includes('_meta.json'));
      
      console.log(`Extracted ${filteredPrompts.length} prompts from ${repoDir}`);
      allPrompts.push(...filteredPrompts);
    } catch (error) {
      console.error(`Error processing ${repoDir}:`, error.message);
    }
  }
  
  console.log(`\nTotal prompts extracted: ${allPrompts.length}`);
  
  if (allPrompts.length === 0) {
    console.log('No prompts extracted. Exiting.');
    return;
  }
  
  console.log('Generating metadata...');
  const enrichedPrompts = metadataGenerator.processBatch(allPrompts);
  
  console.log('Deduplicating...');
  const deduplicatedPrompts = deduplicator.deduplicate(enrichedPrompts);
  console.log(`After deduplication: ${deduplicatedPrompts.length} unique prompts`);
  
  console.log('Generating outputs...');
  await outputGenerator.generateAll(deduplicatedPrompts, {
    categories: {},
    tags: {},
    difficulties: {},
    qualityDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
    averageQuality: 0,
    averagePopularity: 0,
    totalStars: 0,
    totalForks: 0
  });
  
  console.log('Extraction complete!');
}

extractFromClonedRepos().catch(console.error);
