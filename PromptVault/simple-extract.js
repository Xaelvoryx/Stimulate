import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

async function simpleExtract() {
  const reposDir = path.join(process.cwd(), 'repos');
  const allPrompts = [];
  
  const repoDirs = fs.readdirSync(reposDir).filter(name => 
    fs.statSync(path.join(reposDir, name)).isDirectory()
  );
  
  console.log(`Found ${repoDirs.length} cloned repositories`);
  
  for (const repoDir of repoDirs) {
    const repoPath = path.join(reposDir, repoDir);
    console.log(`\nProcessing ${repoDir}...`);
    
    const mdFiles = await glob('**/*.md', {
      cwd: repoPath,
      ignore: ['node_modules', '.git', 'dist', 'build', '**/*_meta*'],
      absolute: true
    });
    
    console.log(`Found ${mdFiles.length} markdown files`);
    
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
              
              allPrompts.push({
                id: `${repoDir}-${path.basename(mdFile)}-${allPrompts.length}`,
                slug: `${repoDir}-${path.basename(mdFile)}-${allPrompts.length}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
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
                author: repoDir,
                repository: repoDir,
                repositoryUrl: `https://github.com/${repoDir}`,
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
    
    console.log(`Extracted ${allPrompts.length} prompts so far`);
  }
  
  console.log(`\nTotal prompts extracted: ${allPrompts.length}`);
  
  if (allPrompts.length > 0) {
    await fs.writeJson(path.join(process.cwd(), 'output', 'json', 'prompts.json'), allPrompts, { spaces: 2 });
    console.log('Saved to output/json/prompts.json');
  }
}

simpleExtract().catch(console.error);
