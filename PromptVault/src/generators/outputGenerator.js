import fs from 'fs-extra';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

class OutputGenerator {
  constructor(config) {
    this.config = config;
    this.outputDir = path.join(process.cwd(), 'output');
    this.formats = config.outputFormats || ['json', 'markdown', 'csv', 'parquet', 'jsonl'];
  }

  async generateAll(prompts) {
    console.log(`\n=== Generating Outputs ===`);
    console.log(`Total prompts: ${prompts.length}`);
    console.log(`Formats: ${this.formats.join(', ')}`);

    const results = {};

    for (const format of this.formats) {
      try {
        console.log(`Generating ${format.toUpperCase()}...`);
        results[format] = await this.generateFormat(prompts, format);
        console.log(`${format.toUpperCase()} generated successfully`);
      } catch (error) {
        console.error(`Error generating ${format}:`, error.message);
        results[format] = { success: false, error: error.message };
      }
    }

    await this.generateIndexes(prompts);
    await this.generateStatistics(prompts);

    return results;
  }

  async generateFormat(prompts, format) {
    switch (format) {
      case 'json':
        return await this.generateJSON(prompts);
      case 'markdown':
        return await this.generateMarkdown(prompts);
      case 'csv':
        return await this.generateCSV(prompts);
      case 'parquet':
        return await this.generateParquet(prompts);
      case 'jsonl':
        return await this.generateJSONL(prompts);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async generateJSON(prompts) {
    const outputDir = path.join(this.outputDir, 'json');
    await fs.ensureDir(outputDir);

    const outputFile = path.join(outputDir, 'prompts.json');
    await fs.writeJson(outputFile, prompts, { spaces: 2 });

    const categorized = this.categorizePrompts(prompts);
    for (const [category, categoryPrompts] of Object.entries(categorized)) {
      const categoryFile = path.join(outputDir, `${category.toLowerCase().replace(/\s+/g, '_')}.json`);
      await fs.writeJson(categoryFile, categoryPrompts, { spaces: 2 });
    }

    return { success: true, file: outputFile, count: prompts.length };
  }

  async generateMarkdown(prompts) {
    const outputDir = path.join(this.outputDir, 'markdown');
    await fs.ensureDir(outputDir);

    const mainFile = path.join(outputDir, 'PROMPTS.md');
    let markdown = '# PromptVault - Extracted Prompts\n\n';
    markdown += `Total Prompts: ${prompts.length}\n\n`;
    markdown += '---\n\n';

    const categorized = this.categorizePrompts(prompts);
    for (const [category, categoryPrompts] of Object.entries(categorized)) {
      markdown += `## ${category}\n\n`;
      markdown += `Count: ${categoryPrompts.length}\n\n`;

      for (const prompt of categoryPrompts) {
        markdown += `### ${prompt.title}\n\n`;
        markdown += `**ID:** ${prompt.id}\n\n`;
        markdown += `**Repository:** [${prompt.repository}](${prompt.repositoryUrl})\n\n`;
        markdown += `**Tags:** ${prompt.tags.join(', ')}\n\n`;
        markdown += `**Difficulty:** ${prompt.difficulty}\n\n`;
        markdown += `**Quality Score:** ${prompt.qualityScore}\n\n`;
        
        if (prompt.description) {
          markdown += `**Description:** ${prompt.description}\n\n`;
        }
        
        markdown += '```\n';
        markdown += prompt.prompt;
        markdown += '\n```\n\n';
        markdown += '---\n\n';
      }
    }

    await fs.writeFile(mainFile, markdown);

    for (const [category, categoryPrompts] of Object.entries(categorized)) {
      const categoryFile = path.join(outputDir, `${category.toLowerCase().replace(/\s+/g, '_')}.md`);
      let categoryMarkdown = `# ${category} Prompts\n\n`;
      categoryMarkdown += `Total: ${categoryPrompts.length}\n\n---\n\n`;

      for (const prompt of categoryPrompts) {
        categoryMarkdown += `## ${prompt.title}\n\n`;
        categoryMarkdown += `**Repository:** [${prompt.repository}](${prompt.repositoryUrl})\n\n`;
        categoryMarkdown += '```\n';
        categoryMarkdown += prompt.prompt;
        categoryMarkdown += '\n```\n\n---\n\n';
      }

      await fs.writeFile(categoryFile, categoryMarkdown);
    }

    return { success: true, file: mainFile, count: prompts.length };
  }

  async generateCSV(prompts) {
    const outputDir = path.join(this.outputDir, 'csv');
    await fs.ensureDir(outputDir);

    const outputFile = path.join(outputDir, 'prompts.csv');
    
    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'title', title: 'Title' },
      { id: 'description', title: 'Description' },
      { id: 'prompt', title: 'Prompt' },
      { id: 'category', title: 'Category' },
      { id: 'subcategory', title: 'Subcategory' },
      { id: 'tags', title: 'Tags' },
      { id: 'difficulty', title: 'Difficulty' },
      { id: 'qualityScore', title: 'Quality Score' },
      { id: 'popularityScore', title: 'Popularity Score' },
      { id: 'repository', title: 'Repository' },
      { id: 'repositoryUrl', title: 'Repository URL' },
      { id: 'repositoryStars', title: 'Stars' },
      { id: 'repositoryForks', title: 'Forks' },
      { id: 'createdAt', title: 'Created At' }
    ];

    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: headers
    });

    const records = prompts.map(p => ({
      ...p,
      tags: p.tags.join(', ')
    }));

    await csvWriter.writeRecords(records);

    const categorized = this.categorizePrompts(prompts);
    for (const [category, categoryPrompts] of Object.entries(categorized)) {
      const categoryFile = path.join(outputDir, `${category.toLowerCase().replace(/\s+/g, '_')}.csv`);
      const categoryCsvWriter = createObjectCsvWriter({
        path: categoryFile,
        header: headers
      });
      const categoryRecords = categoryPrompts.map(p => ({
        ...p,
        tags: p.tags.join(', ')
      }));
      await categoryCsvWriter.writeRecords(categoryRecords);
    }

    return { success: true, file: outputFile, count: prompts.length };
  }

  async generateParquet(prompts) {
    console.log('Parquet format not available, skipping...');
    return { success: false, message: 'Parquet format not available' };
  }

  async generateJSONL(prompts) {
    const outputDir = path.join(this.outputDir, 'jsonl');
    await fs.ensureDir(outputDir);

    const outputFile = path.join(outputDir, 'prompts.jsonl');
    
    const lines = prompts.map(p => JSON.stringify(p)).join('\n');
    await fs.writeFile(outputFile, lines);

    const embeddingsFile = path.join(outputDir, 'embeddings.jsonl');
    const embeddingsLines = prompts.map(p => JSON.stringify({
      id: p.id,
      text: p.embeddingText,
      metadata: {
        title: p.title,
        category: p.category,
        tags: p.tags
      }
    })).join('\n');
    await fs.writeFile(embeddingsFile, embeddingsLines);

    return { success: true, file: outputFile, count: prompts.length };
  }

  async generateIndexes(prompts) {
    const outputDir = path.join(this.outputDir, 'indexes');
    await fs.ensureDir(outputDir);

    const categoryIndex = {};
    const tagIndex = {};
    const repositoryIndex = {};
    const difficultyIndex = {};

    for (const prompt of prompts) {
      if (prompt.category) {
        if (!categoryIndex[prompt.category]) {
          categoryIndex[prompt.category] = [];
        }
        categoryIndex[prompt.category].push(prompt.id);
      }

      for (const tag of prompt.tags) {
        if (!tagIndex[tag]) {
          tagIndex[tag] = [];
        }
        tagIndex[tag].push(prompt.id);
      }

      if (prompt.repository) {
        if (!repositoryIndex[prompt.repository]) {
          repositoryIndex[prompt.repository] = [];
        }
        repositoryIndex[prompt.repository].push(prompt.id);
      }

      if (prompt.difficulty) {
        if (!difficultyIndex[prompt.difficulty]) {
          difficultyIndex[prompt.difficulty] = [];
        }
        difficultyIndex[prompt.difficulty].push(prompt.id);
      }
    }

    await fs.writeJson(path.join(outputDir, 'category_index.json'), categoryIndex, { spaces: 2 });
    await fs.writeJson(path.join(outputDir, 'tag_index.json'), tagIndex, { spaces: 2 });
    await fs.writeJson(path.join(outputDir, 'repository_index.json'), repositoryIndex, { spaces: 2 });
    await fs.writeJson(path.join(outputDir, 'difficulty_index.json'), difficultyIndex, { spaces: 2 });

    console.log('Indexes generated successfully');
  }

  async generateStatistics(prompts) {
    const stats = {
      total: prompts.length,
      categories: {},
      tags: {},
      repositories: {},
      difficulties: {},
      qualityDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0
      },
      averageQuality: 0,
      averagePopularity: 0,
      totalStars: 0,
      totalForks: 0
    };

    for (const prompt of prompts) {
      if (prompt.category) {
        stats.categories[prompt.category] = (stats.categories[prompt.category] || 0) + 1;
      }

      for (const tag of prompt.tags) {
        stats.tags[tag] = (stats.tags[tag] || 0) + 1;
      }

      if (prompt.repository) {
        stats.repositories[prompt.repository] = (stats.repositories[prompt.repository] || 0) + 1;
      }

      if (prompt.difficulty) {
        stats.difficulties[prompt.difficulty] = (stats.difficulties[prompt.difficulty] || 0) + 1;
      }

      if (prompt.qualityScore >= 80) stats.qualityDistribution.excellent++;
      else if (prompt.qualityScore >= 60) stats.qualityDistribution.good++;
      else if (prompt.qualityScore >= 40) stats.qualityDistribution.average++;
      else stats.qualityDistribution.poor++;

      stats.averageQuality += prompt.qualityScore || 0;
      stats.averagePopularity += prompt.popularityScore || 0;
      stats.totalStars += prompt.repositoryStars || 0;
      stats.totalForks += prompt.repositoryForks || 0;
    }

    stats.averageQuality = (stats.averageQuality / prompts.length).toFixed(2);
    stats.averagePopularity = (stats.averagePopularity / prompts.length).toFixed(2);

    const outputFile = path.join(this.outputDir, 'statistics.json');
    await fs.writeJson(outputFile, stats, { spaces: 2 });

    console.log('Statistics generated successfully');
    console.log(JSON.stringify(stats, null, 2));

    return stats;
  }

  categorizePrompts(prompts) {
    const categorized = {};
    for (const prompt of prompts) {
      const category = prompt.category || 'Uncategorized';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(prompt);
    }
    return categorized;
  }
}

export default OutputGenerator;
