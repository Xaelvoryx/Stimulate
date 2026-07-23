import PromptExtractor from './src/processors/promptExtractor.js';
import MetadataGenerator from './src/processors/metadataGenerator.js';
import fs from 'fs-extra';
import path from 'path';

const config = {
  fileExtensions: ['.md', '.txt', '.json', '.yaml', '.yml', '.xml', '.csv', '.html', '.mdx'],
  ignorePatterns: ['node_modules', '.git', 'dist', 'build'],
  categories: ['Programming', 'AI', 'Prompt Engineering']
};

const extractor = new PromptExtractor(config);
const metadataGenerator = new MetadataGenerator(config);

async function testExtraction() {
  const testRepoPath = path.join(process.cwd(), 'data', 'test-repo');
  const repoInfo = {
    owner: 'f',
    repo: 'awesome-chatgpt-prompts',
    fullName: 'f/awesome-chatgpt-prompts'
  };
  
  const repoData = {
    stars: 100000,
    forks: 20000,
    license: 'MIT'
  };

  console.log('Testing extraction from test repository...');
  
  const prompts = await extractor.extractFromDirectory(testRepoPath, repoInfo, repoData);
  
  console.log(`Extracted ${prompts.length} prompts`);
  
  const enrichedPrompts = metadataGenerator.processBatch(prompts);
  
  console.log('Sample prompt:');
  if (enrichedPrompts.length > 0) {
    console.log(JSON.stringify(enrichedPrompts[0], null, 2));
  }
  
  await fs.writeJson(path.join(process.cwd(), 'output', 'json', 'test-prompts.json'), enrichedPrompts, { spaces: 2 });
  console.log('Saved to output/json/test-prompts.json');
}

testExtraction().catch(console.error);
