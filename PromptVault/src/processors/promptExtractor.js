import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import * as cheerio from 'cheerio';
import { glob } from 'glob';
import crypto from 'crypto';

class PromptExtractor {
  constructor(config) {
    this.config = config;
    this.extractedPrompts = [];
    this.fileExtensions = config.fileExtensions || ['.md', '.txt', '.json', '.yaml', '.yml', '.xml', '.csv', '.html'];
    this.ignorePatterns = config.ignorePatterns || ['node_modules', '.git', 'dist', 'build'];
  }

  async extractFromDirectory(repoPath, repoInfo, repoData) {
    if (!repoPath || !await fs.pathExists(repoPath)) {
      return [];
    }

    console.log(`Extracting prompts from: ${repoInfo.fullName}`);
    
    const files = await this.findPromptFiles(repoPath);
    const prompts = [];

    for (const file of files) {
      try {
        const filePrompts = await this.extractFromFile(file, repoPath, repoInfo, repoData);
        prompts.push(...filePrompts);
      } catch (error) {
        console.log(`Error processing ${file}:`, error.message);
      }
    }

    console.log(`Extracted ${prompts.length} prompts from ${repoInfo.fullName}`);
    return prompts;
  }

  async findPromptFiles(dir) {
    const patterns = this.fileExtensions.map(ext => `**/*${ext}`);
    const files = [];
    
    for (const pattern of patterns) {
      const matched = await glob(pattern, {
        cwd: dir,
        ignore: this.ignorePatterns,
        absolute: true
      });
      files.push(...matched);
    }

    // Filter out files with _meta in their name
    return files.filter(file => !file.includes('_meta'));
  }

  async extractFromFile(filePath, repoPath, repoInfo, repoData) {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    let prompts = [];

    switch (ext) {
      case '.md':
      case '.mdx':
        prompts = await this.extractFromMarkdown(content, filePath, repoPath, repoInfo, repoData);
        break;
      case '.json':
        prompts = await this.extractFromJSON(content, filePath, repoPath, repoInfo, repoData);
        break;
      case '.yaml':
      case '.yml':
        prompts = await this.extractFromYAML(content, filePath, repoPath, repoInfo, repoData);
        break;
      case '.txt':
        prompts = await this.extractFromText(content, filePath, repoPath, repoInfo, repoData);
        break;
      case '.html':
        prompts = await this.extractFromHTML(content, filePath, repoPath, repoInfo, repoData);
        break;
      case '.xml':
        prompts = await this.extractFromXML(content, filePath, repoPath, repoInfo, repoData);
        break;
      case '.csv':
        prompts = await this.extractFromCSV(content, filePath, repoPath, repoInfo, repoData);
        break;
      default:
        prompts = await this.extractFromText(content, filePath, repoPath, repoInfo, repoData);
    }

    return prompts;
  }

  async extractFromMarkdown(content, filePath, repoPath, repoInfo, repoData) {
    const prompts = [];
    
    try {
      // Use raw content without gray-matter to avoid require errors
      const markdownContent = content;
      
      const codeBlocks = this.extractCodeBlocks(markdownContent);
      const promptPatterns = this.extractPromptPatterns(markdownContent);
      
      for (const block of codeBlocks) {
        if (this.isPromptLike(block.code)) {
          prompts.push(this.createPromptObject({
            prompt: block.code,
            title: block.language || 'Code Block',
            description: '',
            filePath,
            repoPath,
            repoInfo,
            repoData
          }));
        }
      }

      for (const pattern of promptPatterns) {
        prompts.push(this.createPromptObject({
          prompt: pattern.text,
          title: pattern.label || 'Extracted Prompt',
          description: '',
          filePath,
          repoPath,
          repoInfo,
          repoData
        }));
      }

      const sections = markdownContent.split(/\n#{1,3}\s+/);
      for (const section of sections) {
        if (this.isPromptLike(section) && section.length > 50) {
          const titleMatch = section.match(/^([^\n]+)/);
          const title = titleMatch ? titleMatch[1].substring(0, 50) : 'Section Prompt';
          prompts.push(this.createPromptObject({
            prompt: section,
            title: title.trim(),
            description: '',
            filePath,
            repoPath,
            repoInfo,
            repoData
          }));
        }
      }

      if (this.isPromptLike(markdownContent) && prompts.length === 0) {
        prompts.push(this.createPromptObject({
          prompt: markdownContent,
          title: path.basename(filePath, path.extname(filePath)),
          description: '',
          filePath,
          repoPath,
          repoInfo,
          repoData
        }));
      }

    } catch {
      if (this.isPromptLike(content)) {
        prompts.push(this.createPromptObject({
          prompt: content,
          title: path.basename(filePath, path.extname(filePath)),
          description: '',
          filePath,
          repoPath,
          repoInfo,
          repoData
        }));
      }
    }

    return prompts;
  }

  async extractFromJSON(content, filePath, repoPath, repoInfo, repoData) {
    const prompts = [];
    
    try {
      const data = JSON.parse(content);
      const extracted = this.extractPromptsFromObject(data, filePath, repoPath, repoInfo, repoData);
      prompts.push(...extracted);
    } catch {
      if (this.isPromptLike(content)) {
        prompts.push(this.createPromptObject({
          prompt: content,
          title: path.basename(filePath, path.extname(filePath)),
          description: '',
          filePath,
          repoPath,
          repoInfo,
          repoData
        }));
      }
    }

    return prompts;
  }

  async extractFromYAML(content, filePath, repoPath, repoInfo, repoData) {
    const prompts = [];
    
    try {
      const data = yaml.load(content);
      const extracted = this.extractPromptsFromObject(data, filePath, repoPath, repoInfo, repoData);
      prompts.push(...extracted);
    } catch {
      if (this.isPromptLike(content)) {
        prompts.push(this.createPromptObject({
          prompt: content,
          title: path.basename(filePath, path.extname(filePath)),
          description: '',
          filePath,
          repoPath,
          repoInfo,
          repoData
        }));
      }
    }

    return prompts;
  }

  async extractFromText(content, filePath, repoPath, repoInfo, repoData) {
    const prompts = [];
    
    const lines = content.split('\n');
    const promptSections = this.extractPromptSections(lines);
    
    for (const section of promptSections) {
      prompts.push(this.createPromptObject({
        prompt: section.text,
        title: section.label || 'Text Prompt',
        description: '',
        filePath,
        repoPath,
        repoInfo,
        repoData
      }));
    }

    if (prompts.length === 0 && this.isPromptLike(content)) {
      prompts.push(this.createPromptObject({
        prompt: content,
        title: path.basename(filePath, path.extname(filePath)),
        description: '',
        filePath,
        repoPath,
        repoInfo,
        repoData
      }));
    }

    return prompts;
  }

  async extractFromHTML(content, filePath, repoPath, repoInfo, repoData) {
    const prompts = [];
    const $ = cheerio.load(content);
    
    $('code, pre, blockquote').each((index, element) => {
      const text = $(element).text().trim();
      if (this.isPromptLike(text)) {
        prompts.push(this.createPromptObject({
          prompt: text,
          title: `HTML Element ${index}`,
          description: '',
          filePath,
          repoPath,
          repoInfo,
          repoData
        }));
      }
    });

    const bodyText = $('body').text().trim();
    if (this.isPromptLike(bodyText) && prompts.length === 0) {
      prompts.push(this.createPromptObject({
        prompt: bodyText,
        title: path.basename(filePath, path.extname(filePath)),
        description: '',
        filePath,
        repoPath,
        repoInfo,
        repoData
      }));
    }

    return prompts;
  }

  async extractFromXML(content, filePath, repoPath, repoInfo, repoData) {
    const prompts = [];
    const textContent = content.replace(/<[^>]*>/g, ' ').trim();
    
    if (this.isPromptLike(textContent)) {
      prompts.push(this.createPromptObject({
        prompt: textContent,
        title: path.basename(filePath, path.extname(filePath)),
        description: '',
        filePath,
        repoPath,
        repoInfo,
        repoData
      }));
    }

    return prompts;
  }

  async extractFromCSV(content, filePath, repoPath, repoInfo, repoData) {
    const prompts = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      for (const value of values) {
        if (this.isPromptLike(value)) {
          prompts.push(this.createPromptObject({
            prompt: value,
            title: 'CSV Value',
            description: '',
            filePath,
            repoPath,
            repoInfo,
            repoData
          }));
        }
      }
    }

    return prompts;
  }

  extractPromptsFromObject(obj, filePath, repoPath, repoInfo, repoData, prefix = '') {
    const prompts = [];

    if (typeof obj === 'string' && this.isPromptLike(obj)) {
      prompts.push(this.createPromptObject({
        prompt: obj,
        title: prefix || 'Object Value',
        description: '',
        filePath,
        repoPath,
        repoInfo,
        repoData
      }));
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const extracted = this.extractPromptsFromObject(
          item, 
          filePath, 
          repoPath, 
          repoInfo, 
          repoData, 
          `${prefix}[${index}]`
        );
        prompts.push(...extracted);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (key.toLowerCase().includes('prompt') || key.toLowerCase().includes('system')) {
          if (typeof value === 'string' && this.isPromptLike(value)) {
            prompts.push(this.createPromptObject({
              prompt: value,
              title: key,
              description: obj.description || obj.desc || '',
              filePath,
              repoPath,
              repoInfo,
              repoData
            }));
          }
        } else {
          const extracted = this.extractPromptsFromObject(
            value, 
            filePath, 
            repoPath, 
            repoInfo, 
            repoData, 
            prefix ? `${prefix}.${key}` : key
          );
          prompts.push(...extracted);
        }
      }
    }

    return prompts;
  }

  extractCodeBlocks(content) {
    const blocks = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  extractPromptPatterns(content) {
    const patterns = [];
    
    const promptRegexes = [
      /(?:prompt|system prompt|instruction):\s*["'`]?([^"'`\n]+)["'`]?/gi,
      /(?:act as|you are|you're a|you are an):\s*([^\n]+)/gi,
      /(?:i want you to|please|can you):\s*([^\n]+)/gi,
      /(?:write|create|generate|make):\s*([^\n]+)/gi
    ];

    for (const regex of promptRegexes) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[1] && match[1].length > 20) {
          patterns.push({
            label: match[0].split(':')[0],
            text: match[1].trim()
          });
        }
      }
    }

    return patterns;
  }

  extractPromptSections(lines) {
    const sections = [];
    let currentSection = null;
    let currentText = [];

    const sectionHeaders = [
      'prompt', 'system prompt', 'instruction', 'task', 'role', 
      'context', 'input', 'output', 'example', 'template'
    ];

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      const isHeader = sectionHeaders.some(header => 
        lowerLine.startsWith(header) || lowerLine.startsWith(`${header}:`)
      );

      if (isHeader && currentSection) {
        sections.push({
          label: currentSection,
          text: currentText.join('\n').trim()
        });
        currentSection = lowerLine.replace(':', '');
        currentText = [];
      } else if (isHeader) {
        currentSection = lowerLine.replace(':', '');
        currentText = [];
      } else if (currentSection) {
        currentText.push(line);
      }
    }

    if (currentSection && currentText.length > 0) {
      sections.push({
        label: currentSection,
        text: currentText.join('\n').trim()
      });
    }

    return sections;
  }

  isPromptLike(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    
    if (trimmed.length < 15) return false;
    if (trimmed.length > 100000) return false;

    const promptIndicators = [
      /^(act as|you are|you're|you are an|i want you to|please|can you|write|create|generate|make|help me|explain|describe|analyze|review|debug|fix|implement|design|build|develop|code|program|translate|summarize)/i,
      /(prompt|instruction|task|role|context|system|template|example|guideline|rule|requirement|command|directive)/i,
      /\b(the following|your task|your role|your goal|your objective|your mission|your purpose)\b/i,
      /\b(step by step|in detail|thoroughly|comprehensive|detailed|carefully|precisely|exactly)\b/i,
      /\{|\}|\[|\]/,
      /\$\{.*\}/,
      /<.*>.*<\/.*>/,
      /\b(should|must|need to|have to|required)\b/i,
      /\b(ensure|make sure|verify|confirm|check)\b/i,
      /\n/,
      /\./,
      /,/,
      /\b(if|when|then|else|for|while|do)\b/i
    ];

    const hasIndicator = promptIndicators.some(regex => regex.test(trimmed));
    
    if (hasIndicator) return true;

    if (trimmed.length > 50 && trimmed.split(' ').length > 8) {
      return true;
    }

    return false;
  }

  createPromptObject(data) {
    const { prompt, title, description, filePath, repoPath, repoInfo, repoData, category = '', tags = [] } = data;
    
    return {
      id: this.generateId(prompt, repoInfo?.fullName, filePath),
      slug: this.generateSlug(title),
      title: title || 'Untitled Prompt',
      description: description || '',
      prompt: prompt,
      systemPrompt: '',
      developerPrompt: '',
      userPrompt: prompt,
      category: category,
      subcategory: '',
      tags: tags,
      models: [],
      tools: [],
      frameworks: [],
      languages: [],
      variables: this.extractVariables(prompt),
      difficulty: this.assessDifficulty(prompt),
      qualityScore: this.assessQuality(prompt),
      popularityScore: 0,
      embeddingText: this.generateEmbeddingText(prompt, description),
      exampleInput: '',
      exampleOutput: '',
      author: repoInfo?.owner || '',
      repository: repoInfo?.fullName || '',
      repositoryUrl: repoInfo ? `https://github.com/${repoInfo.fullName}` : '',
      repositoryStars: repoData?.stars || 0,
      repositoryForks: repoData?.forks || 0,
      repositoryLicense: repoData?.license || 'Unknown',
      filePath: filePath,
      commitHash: '',
      sourceUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVerified: new Date().toISOString(),
      relatedPrompts: [],
      similarityHash: this.generateSimilarityHash(prompt),
      duplicates: [],
      vectorReady: true,
      searchReady: true
    };
  }

  generateId(prompt, repo, filePath) {
    const content = `${prompt}${repo}${filePath}`;
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  extractVariables(prompt) {
    const variables = [];
    const regex = /\{(\w+)\}|\$\{(\w+)\}|<(\w+)>/g;
    let match;

    while ((match = regex.exec(prompt)) !== null) {
      const varName = match[1] || match[2] || match[3];
      if (varName && !variables.includes(varName)) {
        variables.push(varName);
      }
    }

    return variables;
  }

  assessDifficulty(prompt) {
    const length = prompt.length;
    const complexity = prompt.split(/[.!?]/).length;
    const hasVariables = /\{|\}|\$|</.test(prompt);
    const hasStructure = /\n|\t|•|-/.test(prompt);

    if (length < 100) return 'beginner';
    if (length < 300) return 'intermediate';
    if (hasVariables && hasStructure) return 'advanced';
    if (complexity > 10) return 'expert';
    return 'intermediate';
  }

  assessQuality(prompt) {
    let score = 50;

    if (prompt.length > 50) score += 10;
    if (prompt.length > 200) score += 10;
    if (/\b(act as|you are|role|context)\b/i.test(prompt)) score += 15;
    if (/\b(step by step|detailed|thorough|comprehensive)\b/i.test(prompt)) score += 10;
    if (/\{|\}|\$|</.test(prompt)) score += 5;
    if (/\n|\t/.test(prompt)) score += 5;
    if (/\b(example|for instance|such as)\b/i.test(prompt)) score += 5;

    return Math.min(100, score);
  }

  generateEmbeddingText(prompt, description) {
    return `${prompt} ${description}`.trim();
  }

  generateSimilarityHash(prompt) {
    const normalized = prompt.toLowerCase().replace(/\s+/g, ' ').trim();
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  getStats() {
    return {
      totalExtracted: this.extractedPrompts.length
    };
  }
}

export default PromptExtractor;
