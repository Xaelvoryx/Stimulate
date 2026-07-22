import fs from 'fs-extra';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { Parser } from 'json2csv';

class OutputGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './output';
    this.formats = options.formats || ['json', 'csv', 'jsonl', 'markdown'];
  }

  async ensureOutputDir() {
    await fs.ensureDir(this.outputDir);
  }

  async generateJSON(prompts, filename = 'prompts.json') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    const data = {
      generatedAt: new Date().toISOString(),
      totalPrompts: prompts.length,
      prompts: prompts
    };
    
    await fs.writeJSON(filepath, data, { spaces: 2 });
    console.log(`Generated JSON output: ${filepath}`);
    
    return filepath;
  }

  async generateJSONL(prompts, filename = 'prompts.jsonl') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    const lines = prompts.map(prompt => JSON.stringify(prompt)).join('\n');
    await fs.writeFile(filepath, lines);
    console.log(`Generated JSONL output: ${filepath}`);
    
    return filepath;
  }

  async generateCSV(prompts, filename = 'prompts.csv') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    if (prompts.length === 0) {
      console.log('No prompts to generate CSV');
      return filepath;
    }
    
    // Flatten nested objects for CSV
    const flattenedPrompts = prompts.map(prompt => this.flattenObject(prompt));
    
    // Get all unique keys
    const allKeys = new Set();
    flattenedPrompts.forEach(prompt => {
      Object.keys(prompt).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: headers.map(h => ({ id: h, title: h }))
    });
    
    await csvWriter.writeRecords(flattenedPrompts);
    console.log(`Generated CSV output: ${filepath}`);
    
    return filepath;
  }

  async generateMarkdown(prompts, filename = 'prompts.md') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    let markdown = `# PromptVault - Extracted Prompts\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n`;
    markdown += `Total Prompts: ${prompts.length}\n\n`;
    markdown += `---\n\n`;
    
    prompts.forEach((prompt, index) => {
      markdown += `## ${index + 1}. ${prompt.title || 'Untitled'}\n\n`;
      
      if (prompt.description) {
        markdown += `**Description:** ${prompt.description}\n\n`;
      }
      
      if (prompt.category) {
        markdown += `**Category:** ${prompt.category}\n`;
      }
      
      if (prompt.subcategory) {
        markdown += `**Subcategory:** ${prompt.subcategory}\n`;
      }
      
      if (prompt.tags && prompt.tags.length > 0) {
        markdown += `**Tags:** ${prompt.tags.join(', ')}\n`;
      }
      
      if (prompt.difficulty) {
        markdown += `**Difficulty:** ${prompt.difficulty}\n`;
      }
      
      if (prompt.qualityScore) {
        markdown += `**Quality Score:** ${prompt.qualityScore}\n`;
      }
      
      markdown += `\n`;
      
      markdown += `### Prompt\n\n`;
      markdown += `\`\`\`\n${prompt.prompt}\n\`\`\`\n\n`;
      
      if (prompt.systemPrompt) {
        markdown += `### System Prompt\n\n`;
        markdown += `\`\`\`\n${prompt.systemPrompt}\n\`\`\`\n\n`;
      }
      
      if (prompt.variables && prompt.variables.length > 0) {
        markdown += `### Variables\n\n`;
        markdown += `${prompt.variables.map(v => `- \`${v}\``).join('\n')}\n\n`;
      }
      
      if (prompt.examples && prompt.examples.length > 0) {
        markdown += `### Examples\n\n`;
        prompt.examples.forEach(example => {
          markdown += `- ${example}\n`;
        });
        markdown += `\n`;
      }
      
      if (prompt.repository) {
        markdown += `### Source\n\n`;
        markdown += `- Repository: [${prompt.repository}](${prompt.repositoryUrl})\n`;
        if (prompt.repositoryStars) {
          markdown += `- Stars: ${prompt.repositoryStars}\n`;
        }
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
    
    await fs.writeFile(filepath, markdown);
    console.log(`Generated Markdown output: ${filepath}`);
    
    return filepath;
  }

  async generateParquet(prompts, filename = 'prompts.parquet') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    try {
      // Note: This requires parquet-writer or similar library
      // For now, we'll use a simple JSON approach as parquet support is limited in Node.js
      console.log('Parquet generation not fully implemented, using JSON instead');
      return this.generateJSON(prompts, filename.replace('.parquet', '.json'));
    } catch (error) {
      console.error('Error generating Parquet:', error.message);
      throw error;
    }
  }

  async generateSearchIndex(prompts, filename = 'search-index.json') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    const searchIndex = {
      generatedAt: new Date().toISOString(),
      totalPrompts: prompts.length,
      index: prompts.map(prompt => ({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        category: prompt.category,
        tags: prompt.tags,
        embeddingText: prompt.embeddingText,
        qualityScore: prompt.qualityScore,
        popularityScore: prompt.popularityScore,
        difficulty: prompt.difficulty,
        models: prompt.models,
        tools: prompt.tools,
        languages: prompt.languages
      }))
    };
    
    await fs.writeJSON(filepath, searchIndex, { spaces: 2 });
    console.log(`Generated search index: ${filepath}`);
    
    return filepath;
  }

  async generateCategoryIndex(prompts, filename = 'category-index.json') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    const categoryIndex = {
      generatedAt: new Date().toISOString(),
      totalPrompts: prompts.length,
      categories: {}
    };
    
    prompts.forEach(prompt => {
      const category = prompt.category || 'Uncategorized';
      
      if (!categoryIndex.categories[category]) {
        categoryIndex.categories[category] = {
          count: 0,
          prompts: []
        };
      }
      
      categoryIndex.categories[category].count++;
      categoryIndex.categories[category].prompts.push({
        id: prompt.id,
        title: prompt.title,
        qualityScore: prompt.qualityScore,
        popularityScore: prompt.popularityScore
      });
    });
    
    await fs.writeJSON(filepath, categoryIndex, { spaces: 2 });
    console.log(`Generated category index: ${filepath}`);
    
    return filepath;
  }

  async generateStatistics(prompts, filename = 'statistics.json') {
    await this.ensureOutputDir();
    const filepath = path.join(this.outputDir, filename);
    
    const stats = {
      generatedAt: new Date().toISOString(),
      totalPrompts: prompts.length,
      categories: {},
      difficulties: {},
      avgQualityScore: 0,
      avgPopularityScore: 0,
      totalTags: 0,
      uniqueTags: new Set(),
      totalLanguages: 0,
      uniqueLanguages: new Set(),
      totalModels: 0,
      uniqueModels: new Set(),
      totalTools: 0,
      uniqueTools: new Set(),
      repositories: {},
      topPromptsByQuality: [],
      topPromptsByPopularity: []
    };
    
    prompts.forEach(prompt => {
      // Categories
      if (prompt.category) {
        stats.categories[prompt.category] = (stats.categories[prompt.category] || 0) + 1;
      }
      
      // Difficulties
      if (prompt.difficulty) {
        stats.difficulties[prompt.difficulty] = (stats.difficulties[prompt.difficulty] || 0) + 1;
      }
      
      // Quality scores
      if (prompt.qualityScore) {
        stats.avgQualityScore += prompt.qualityScore;
      }
      
      // Popularity scores
      if (prompt.popularityScore) {
        stats.avgPopularityScore += prompt.popularityScore;
      }
      
      // Tags
      if (prompt.tags) {
        stats.totalTags += prompt.tags.length;
        prompt.tags.forEach(tag => stats.uniqueTags.add(tag));
      }
      
      // Languages
      if (prompt.languages) {
        stats.totalLanguages += prompt.languages.length;
        prompt.languages.forEach(lang => stats.uniqueLanguages.add(lang"));
      }
      
      // Models
      if (prompt.models) {
        stats.totalModels += prompt.models.length;
        prompt.models.forEach(model => stats.uniqueModels.add(model));
      }
      
      // Tools
      if (prompt.tools) {
        stats.totalTools += prompt.tools.length;
        prompt.tools.forEach(tool => stats.uniqueTools.add(tool));
      }
      
      // Repositories
      if (prompt.repository) {
        if (!stats.repositories[prompt.repository]) {
          stats.repositories[prompt.repository] = {
            url: prompt.repositoryUrl,
            stars: prompt.repositoryStars,
            forks: prompt.repositoryForks,
            count: 0
          };
        }
        stats.repositories[prompt.repository].count++;
      }
    });
    
    // Calculate averages
    if (stats.totalPrompts > 0) {
      stats.avgQualityScore = stats.avgQualityScore / stats.totalPrompts;
      stats.avgPopularityScore = stats.avgPopularityScore / stats.totalPrompts;
    }
    
    // Convert sets to arrays
    stats.uniqueTags = Array.from(stats.uniqueTags);
    stats.uniqueLanguages = Array.from(stats.uniqueLanguages);
    stats.uniqueModels = Array.from(stats.uniqueModels);
    stats.uniqueTools = Array.from(stats.uniqueTools);
    
    // Top prompts by quality
    stats.topPromptsByQuality = [...prompts]
      .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))
      .slice(0, 100)
      .map(p => ({
        id: p.id,
        title: p.title,
        qualityScore: p.qualityScore,
        category: p.category
      }));
    
    // Top prompts by popularity
    stats.topPromptsByPopularity = [...prompts]
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
      .slice(0, 100)
      .map(p => ({
        id: p.id,
        title: p.title,
        popularityScore: p.popularityScore,
        category: p.category
      }));
    
    await fs.writeJSON(filepath, stats, { spaces: 2 });
    console.log(`Generated statistics: ${filepath}`);
    
    return filepath;
  }

  async generateAll(prompts, options = {}) {
    const formats = options.formats || this.formats;
    const outputs = {};
    
    console.log(`Generating outputs in ${formats.join(', ')} format(s)`);
    
    if (formats.includes('json')) {
      outputs.json = await this.generateJSON(prompts);
    }
    
    if (formats.includes('jsonl')) {
      outputs.jsonl = await this.generateJSONL(prompts);
    }
    
    if (formats.includes('csv')) {
      outputs.csv = await this.generateCSV(prompts);
    }
    
    if (formats.includes('markdown')) {
      outputs.markdown = await this.generateMarkdown(prompts);
    }
    
    if (formats.includes('parquet')) {
      outputs.parquet = await this.generateParquet(prompts);
    }
    
    // Always generate indexes and statistics
    outputs.searchIndex = await this.generateSearchIndex(prompts);
    outputs.categoryIndex = await this.generateCategoryIndex(prompts);
    outputs.statistics = await this.generateStatistics(prompts);
    
    console.log('All outputs generated successfully');
    
    return outputs;
  }

  flattenObject(obj, prefix = '', result = {}) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenObject(value, newKey, result);
      } else if (Array.isArray(value)) {
        result[newKey] = value.join(', ');
      } else {
        result[newKey] = value;
      }
    });
    
    return result;
  }

  async generateByCategory(prompts, outputDir) {
    await fs.ensureDir(outputDir);
    
    const categories = new Set(prompts.map(p => p.category || 'Uncategorized'));
    
    const outputs = {};
    
    for (const category of categories) {
      const categoryPrompts = prompts.filter(p => (p.category || 'Uncategorized') === category);
      const categoryDir = path.join(outputDir, category.replace(/\s+/g, '_').toLowerCase());
      
      await fs.ensureDir(categoryDir);
      
      outputs[category] = {
        json: await this.generateJSON(categoryPrompts, path.join(categoryDir, 'prompts.json')),
        markdown: await this.generateMarkdown(categoryPrompts, path.join(categoryDir, 'prompts.md')),
        count: categoryPrompts.length
      };
      
      console.log(`Generated outputs for category: ${category} (${categoryPrompts.length} prompts)`);
    }
    
    return outputs;
  }
}

export default OutputGenerator;
