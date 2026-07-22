import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import MarkdownIt from 'markdown-it';
import { cleanText, extractCodeBlocks, extractExamples } from '../utils/helpers.js';

class PromptExtractor {
  constructor() {
    this.md = new MarkdownIt();
    this.extractedCount = 0;
    this.totalFiles = 0;
  }

  async extractFromFile(filePath, repoInfo) {
    const ext = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath, 'utf-8');
    this.totalFiles++;
    
    let prompts = [];
    
    switch (ext) {
      case '.md':
      case '.markdown':
        prompts = this.extractFromMarkdown(content, filePath, repoInfo);
        break;
      case '.txt':
        prompts = this.extractFromText(content, filePath, repoInfo);
        break;
      case '.json':
        prompts = this.extractFromJSON(content, filePath, repoInfo);
        break;
      case '.yaml':
      case '.yml':
        prompts = this.extractFromYAML(content, filePath, repoInfo);
        break;
      case '.xml':
        prompts = this.extractFromXML(content, filePath, repoInfo);
        break;
      case '.csv':
        prompts = this.extractFromCSV(content, filePath, repoInfo);
        break;
      case '.html':
      case '.htm':
        prompts = this.extractFromHTML(content, filePath, repoInfo);
        break;
      default:
        prompts = this.extractFromText(content, filePath, repoInfo);
    }
    
    this.extractedCount += prompts.length;
    return prompts;
  }

  extractFromMarkdown(content, filePath, repoInfo) {
    const prompts = [];
    const lines = content.split('\n');
    let currentPrompt = null;
    let inCodeBlock = false;
    let codeBlockLang = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          if (currentPrompt && currentPrompt.prompt) {
            prompts.push(this.finalizePrompt(currentPrompt, filePath, repoInfo));
          }
          currentPrompt = null;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
          currentPrompt = {
            prompt: '',
            language: codeBlockLang || 'text'
          };
        }
        continue;
      }
      
      if (inCodeBlock && currentPrompt) {
        currentPrompt.prompt += line + '\n';
        continue;
      }
      
      // Check for prompt patterns
      const headerMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headerMatch) {
        if (currentPrompt && currentPrompt.prompt) {
          prompts.push(this.finalizePrompt(currentPrompt, filePath, repoInfo));
        }
        currentPrompt = {
          title: headerMatch[1].trim(),
          prompt: '',
          description: ''
        };
        continue;
      }
      
      // Check for prompt indicators
      if (line.match(/^(prompt|system|user|assistant|instruction):/i)) {
        if (currentPrompt && currentPrompt.prompt) {
          prompts.push(this.finalizePrompt(currentPrompt, filePath, repoInfo));
        }
        const type = line.split(':')[0].toLowerCase();
        currentPrompt = {
          type: type,
          prompt: '',
          title: type.charAt(0).toUpperCase() + type.slice(1) + ' Prompt'
        };
        continue;
      }
      
      // Check for role-based prompts
      if (line.match(/^(you are|act as|you will be|role:)/i)) {
        if (currentPrompt && currentPrompt.prompt) {
          prompts.push(this.finalizePrompt(currentPrompt, filePath, repoInfo));
        }
        currentPrompt = {
          prompt: line + '\n',
          type: 'role',
          title: 'Role-based Prompt'
        };
        continue;
      }
      
      // Check for example patterns
      if (line.match(/^(example|for example|e\.g\.):/i)) {
        if (currentPrompt) {
          currentPrompt.exampleInput = line.split(':')[1].trim();
        }
        continue;
      }
      
      // Accumulate content
      if (currentPrompt) {
        currentPrompt.prompt += line + '\n';
      }
    }
    
    // Don't forget the last prompt
    if (currentPrompt && currentPrompt.prompt) {
      prompts.push(this.finalizePrompt(currentPrompt, filePath, repoInfo));
    }
    
    // Also try to extract prompts from the entire content
    const additionalPrompts = this.extractPromptsFromContent(content, filePath, repoInfo);
    prompts.push(...additionalPrompts);
    
    return prompts;
  }

  extractFromText(content, filePath, repoInfo) {
    const prompts = [];
    const lines = content.split('\n');
    let currentPrompt = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (currentPrompt && currentPrompt.prompt && currentPrompt.prompt.length > 50) {
          prompts.push(this.finalizePrompt(currentPrompt, filePath, repoInfo));
          currentPrompt = null;
        }
        continue;
      }
      
      if (!currentPrompt) {
        currentPrompt = {
          prompt: line + '\n',
          title: `Prompt ${prompts.length + 1}`
        };
      } else {
        currentPrompt.prompt += line + '\n';
      }
    }
    
    if (currentPrompt && currentPrompt.prompt && currentPrompt.prompt.length > 50) {
      prompts.push(this.finalizePrompt(currentPrompt, filePath, repoInfo));
    }
    
    return prompts;
  }

  extractFromJSON(content, filePath, repoInfo) {
    const prompts = [];
    
    try {
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const prompt = this.extractPromptFromObject(item, index, filePath, repoInfo);
          if (prompt) prompts.push(prompt);
        });
      } else if (typeof data === 'object') {
        const prompt = this.extractPromptFromObject(data, 0, filePath, repoInfo);
        if (prompt) prompts.push(prompt);
      }
    } catch (error) {
      console.error(`Error parsing JSON from ${filePath}:`, error.message);
    }
    
    return prompts;
  }

  extractFromYAML(content, filePath, repoInfo) {
    const prompts = [];
    
    try {
      const data = yaml.load(content);
      
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const prompt = this.extractPromptFromObject(item, index, filePath, repoInfo);
          if (prompt) prompts.push(prompt);
        });
      } else if (typeof data === 'object') {
        const prompt = this.extractPromptFromObject(data, 0, filePath, repoInfo);
        if (prompt) prompts.push(prompt);
      }
    } catch (error) {
      console.error(`Error parsing YAML from ${filePath}:`, error.message);
    }
    
    return prompts;
  }

  extractFromXML(content, filePath, repoInfo) {
    const prompts = [];
    
    // Simple XML parsing - look for prompt-like tags
    const promptPatterns = [
      /<prompt[^>]*>([\s\S]*?)<\/prompt>/gi,
      /<system[^>]*>([\s\S]*?)<\/system>/gi,
      /<instruction[^>]*>([\s\S]*?)<\/instruction>/gi,
      /<message[^>]*>([\s\S]*?)<\/message>/gi
    ];
    
    promptPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const prompt = {
          prompt: cleanText(match[1]),
          title: 'XML Extracted Prompt',
          type: pattern.source.match(/<(\w+)/)[1]
        };
        prompts.push(this.finalizePrompt(prompt, filePath, repoInfo));
      }
    });
    
    return prompts;
  }

  extractFromCSV(content, filePath, repoInfo) {
    const prompts = [];
    const lines = content.split('\n');
    
    if (lines.length < 2) return prompts;
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const promptField = headers.findIndex(h => h.includes('prompt') || h.includes('text') || h.includes('content'));
    const titleField = headers.findIndex(h => h.includes('title') || h.includes('name'));
    const descField = headers.findIndex(h => h.includes('description') || h.includes('desc'));
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (promptField >= 0 && values[promptField]) {
        const prompt = {
          prompt: values[promptField],
          title: titleField >= 0 ? values[titleField] : `Prompt ${i}`,
          description: descField >= 0 ? values[descField] : ''
        };
        prompts.push(this.finalizePrompt(prompt, filePath, repoInfo));
      }
    }
    
    return prompts;
  }

  extractFromHTML(content, filePath, repoInfo) {
    const prompts = [];
    
    // Look for prompt-like content in HTML
    const patterns = [
      /<p[^>]*class="[^"]*prompt[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
      /<div[^>]*class="[^"]*prompt[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<code[^>]*class="[^"]*prompt[^"]*"[^>]*>([\s\S]*?)<\/code>/gi,
      /<pre[^>]*class="[^"]*prompt[^"]*"[^>]*>([\s\S]*?)<\/pre>/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Remove HTML tags from content
        const text = match[1].replace(/<[^>]+>/g, '').trim();
        if (text.length > 20) {
          const prompt = {
            prompt: cleanText(text),
            title: 'HTML Extracted Prompt'
          };
          prompts.push(this.finalizePrompt(prompt, filePath, repoInfo));
        }
      }
    });
    
    return prompts;
  }

  extractPromptFromObject(obj, index, filePath, repoInfo) {
    const promptFields = ['prompt', 'text', 'content', 'instruction', 'system', 'user', 'assistant', 'message'];
    const titleFields = ['title', 'name', 'label', 'heading'];
    const descFields = ['description', 'desc', 'summary'];
    
    let promptText = null;
    let title = null;
    let description = null;
    let type = null;
    
    // Find prompt text
    for (const field of promptFields) {
      if (obj[field] && typeof obj[field] === 'string' && obj[field].length > 10) {
        promptText = obj[field];
        type = field;
        break;
      }
    }
    
    if (!promptText) return null;
    
    // Find title
    for (const field of titleFields) {
      if (obj[field]) {
        title = obj[field];
        break;
      }
    }
    
    // Find description
    for (const field of descFields) {
      if (obj[field]) {
        description = obj[field];
        break;
      }
    }
    
    const prompt = {
      prompt: cleanText(promptText),
      title: title || `Prompt ${index + 1}`,
      description: description || '',
      type: type || 'general'
    };
    
    return this.finalizePrompt(prompt, filePath, repoInfo);
  }

  extractPromptsFromContent(content, filePath, repoInfo) {
    const prompts = [];
    
    // Pattern 1: "Act as" or "You are" prompts
    const rolePattern = /(?:act as|you are|you will be|you're a|role:)[\s\n]+([^.!?]*[.!?])/gi;
    let match;
    while ((match = rolePattern.exec(content)) !== null) {
      const prompt = {
        prompt: match[0],
        title: `Role: ${match[1].trim().substring(0, 50)}`,
        type: 'role'
      };
      prompts.push(this.finalizePrompt(prompt, filePath, repoInfo));
    }
    
    // Pattern 2: Numbered prompts
    const numberedPattern = /^\d+\.\s+([^\n]+)\n([\s\S]*?)(?=\n\d+\.|\n\n|$)/gm;
    while ((match = numberedPattern.exec(content)) !== null) {
      const prompt = {
        prompt: cleanText(match[2]),
        title: match[1].trim(),
        type: 'numbered'
      };
      prompts.push(this.finalizePrompt(prompt, filePath, repoInfo));
    }
    
    // Pattern 3: Bullet point prompts
    const bulletPattern = /^[-*]\s+([^\n]+)\n([\s\S]*?)(?=\n[-*]|\n\n|$)/gm;
    while ((match = bulletPattern.exec(content)) !== null) {
      const prompt = {
        prompt: cleanText(match[2]),
        title: match[1].trim(),
        type: 'bullet'
      };
      prompts.push(this.finalizePrompt(prompt, filePath, repoInfo));
    }
    
    // Pattern 4: Quote-based prompts
    const quotePattern = /"([^"]{50,})"/g;
    while ((match = quotePattern.exec(content)) !== null) {
      const prompt = {
        prompt: match[1],
        title: 'Quoted Prompt',
        type: 'quote'
      };
      prompts.push(this.finalizePrompt(prompt, filePath, repoInfo));
    }
    
    return prompts;
  }

  finalizePrompt(prompt, filePath, repoInfo) {
    const cleanedPrompt = cleanText(prompt.prompt);
    
    if (cleanedPrompt.length < 20) return null;
    
    return {
      prompt: cleanedPrompt,
      title: prompt.title || 'Untitled Prompt',
      description: prompt.description || '',
      type: prompt.type || 'general',
      language: prompt.language || 'text',
      filePath: filePath,
      repository: repoInfo?.name || '',
      repositoryUrl: repoInfo?.url || '',
      repositoryStars: repoInfo?.stars || 0,
      repositoryForks: repoInfo?.forks || 0,
      repositoryLicense: repoInfo?.license || '',
      codeBlocks: extractCodeBlocks(cleanedPrompt),
      examples: extractExamples(cleanedPrompt)
    };
  }

  getStats() {
    return {
      extractedCount: this.extractedCount,
      totalFiles: this.totalFiles
    };
  }

  resetStats() {
    this.extractedCount = 0;
    this.totalFiles = 0;
  }
}

export default PromptExtractor;
