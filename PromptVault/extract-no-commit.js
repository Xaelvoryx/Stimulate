import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const execAsync = promisify(exec);

const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf-8'));

async function extractNoCommit() {
  const reposDir = path.join(process.cwd(), 'repos');
  await fs.ensureDir(reposDir);
  
  let totalPrompts = [];
  
  for (const [tierName, repos] of Object.entries(config.tiers)) {
    console.log(`\n=== Processing ${tierName} ===`);
    
    for (const repoUrl of repos) {
      const urlParts = repoUrl.replace('https://github.com/', '').split('/');
      const repoName = urlParts.join('_');
      const repoPath = path.join(reposDir, repoName);
      
      console.log(`\nCloning ${repoName}...`);
      
      try {
        // Remove existing repo if exists
        if (await fs.pathExists(repoPath)) {
          await fs.remove(repoPath);
        }
        
        // Clone repository
        await execAsync(`git clone --depth 1 ${repoUrl} "${repoPath}"`, {
          timeout: 180000
        });
        
        console.log(`Cloned ${repoName} successfully`);
        
        // Extract prompts
        const prompts = await extractFromRepo(repoPath, repoName);
        console.log(`Extracted ${prompts.length} prompts from ${repoName}`);
        
        totalPrompts.push(...prompts);
        console.log(`Total prompts so far: ${totalPrompts.length}`);
        
        // Save incrementally
        await fs.writeJson(path.join(process.cwd(), 'output', 'json', 'prompts.json'), totalPrompts, { spaces: 2 });
        
        // Remove repo to save space
        await fs.remove(repoPath);
        
        // Stop if we have enough prompts
        if (totalPrompts.length >= 3000) {
          console.log(`\nReached ${totalPrompts.length} prompts. Stopping extraction.`);
          break;
        }
        
      } catch (error) {
        console.error(`Failed to process ${repoName}:`, error.message);
        
        // Clean up failed clone
        if (await fs.pathExists(repoPath)) {
          try {
            await fs.remove(repoPath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }
    
    // Stop if we have enough prompts
    if (totalPrompts.length >= 3000) {
      break;
    }
  }
  
  console.log(`\n=== Total prompts extracted: ${totalPrompts.length} ===`);
  
  // Save final result
  await fs.writeJson(path.join(process.cwd(), 'output', 'json', 'prompts.json'), totalPrompts, { spaces: 2 });
  console.log('Saved to output/json/prompts.json');
}

async function extractFromRepo(repoPath, repoName) {
  const prompts = [];
  
  try {
    const mdFiles = await glob('**/*.md', {
      cwd: repoPath,
      ignore: ['node_modules', '.git', 'dist', 'build', '**/*_meta*'],
      absolute: true
    });
    
    for (const mdFile of mdFiles) {
      try {
        const content = fs.readFileSync(mdFile, 'utf-8');
        const sections = content.split(/\n#{1,3}\s+/);
        
        for (const section of sections) {
          const trimmed = section.trim();
          if (trimmed.length > 100 && trimmed.length < 10000) {
            const hasPromptIndicators = /act as|you are|you're|i want you to|please|can you|write|create|generate|make|help me|explain|describe|analyze/i.test(trimmed);
            if (hasPromptIndicators) {
              const titleMatch = trimmed.match(/^([^\n]+)/);
              const title = titleMatch ? titleMatch[1].substring(0, 50).trim() : 'Prompt';
              
              prompts.push({
                id: `${repoName}-${path.basename(mdFile)}-${prompts.length}`,
                slug: `${repoName}-${path.basename(mdFile)}-${prompts.length}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                title: title,
                description: trimmed.substring(0, 200),
                prompt: trimmed,
                systemPrompt: '',
                developerPrompt: '',
                userPrompt: trimmed,
                category: 'Prompt Engineering',
                subcategory: 'General',
                tags: ['prompt', 'ai', 'llm'],
                models: ['GPT-4', 'Claude'],
                tools: [],
                frameworks: [],
                languages: [],
                variables: [],
                difficulty: 'intermediate',
                qualityScore: 70,
                popularityScore: 50,
                embeddingText: trimmed,
                exampleInput: '',
                exampleOutput: '',
                author: repoName,
                repository: repoName,
                repositoryUrl: `https://github.com/${repoName.replace('_', '/')}`,
                repositoryStars: 0,
                repositoryForks: 0,
                repositoryLicense: 'Unknown',
                filePath: mdFile,
                commitHash: '',
                sourceUrl: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastVerified: new Date().toISOString(),
                relatedPrompts: [],
                similarityHash: '',
                duplicates: [],
                vectorReady: true,
                searchReady: true
              });
            }
          }
        }
      } catch (error) {
        // Skip file errors
      }
    }
  } catch (error) {
    console.error(`Error extracting from ${repoName}:`, error.message);
  }
  
  return prompts;
}

extractNoCommit().catch(console.error);
