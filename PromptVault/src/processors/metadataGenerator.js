import {
  calculateQualityScore,
  calculateDifficulty,
  extractVariables,
  detectLanguages,
  detectModels,
  detectTools,
  generateEmbeddingText,
  categorizePrompt,
  generateTags,
  generateId,
  generateSlug,
  formatTimestamp
} from '../utils/helpers.js';
import { CATEGORIES, ROLE_CATEGORIES } from '../../config/repositories.js';

class MetadataGenerator {
  constructor(options = {}) {
    this.categories = options.categories || CATEGORIES;
    this.roleCategories = options.roleCategories || ROLE_CATEGORIES;
  }

  // Generate complete metadata for a prompt
  generateMetadata(prompt) {
    const metadata = {
      // Identification
      id: prompt.id || generateId(),
      slug: prompt.slug || generateSlug(prompt.title || 'untitled'),
      
      // Content
      title: prompt.title || 'Untitled Prompt',
      description: prompt.description || '',
      prompt: prompt.prompt,
      systemPrompt: prompt.systemPrompt || '',
      developerPrompt: prompt.developerPrompt || '',
      userPrompt: prompt.userPrompt || '',
      
      // Classification
      category: prompt.category || this.categorizePrompt(prompt.prompt),
      subcategory: prompt.subcategory || '',
      tags: prompt.tags || this.generateTags(prompt.prompt),
      
      // Technical metadata
      models: detectModels(prompt.prompt),
      tools: detectTools(prompt.prompt),
      frameworks: prompt.frameworks || [],
      languages: detectLanguages(prompt.prompt),
      variables: extractVariables(prompt.prompt),
      
      // Scoring
      difficulty: calculateDifficulty(prompt.prompt),
      qualityScore: calculateQualityScore(prompt.prompt),
      popularityScore: this.calculatePopularityScore(prompt),
      
      // Search and embeddings
      embeddingText: generateEmbeddingText(prompt),
      
      // Examples
      exampleInput: prompt.exampleInput || '',
      exampleOutput: prompt.exampleOutput || '',
      
      // Source information
      author: prompt.author || '',
      repository: prompt.repository || '',
      repositoryUrl: prompt.repositoryUrl || '',
      repositoryStars: prompt.repositoryStars || 0,
      repositoryForks: prompt.repositoryForks || 0,
      repositoryLicense: prompt.repositoryLicense || '',
      filePath: prompt.filePath || '',
      commitHash: prompt.commitHash || '',
      sourceUrl: prompt.sourceUrl || '',
      
      // Timestamps
      createdAt: prompt.createdAt || formatTimestamp(new Date()),
      updatedAt: prompt.updatedAt || formatTimestamp(new Date()),
      lastVerified: formatTimestamp(new Date()),
      
      // Relationships
      relatedPrompts: prompt.relatedPrompts || [],
      similarityHash: this.generateSimilarityHash(prompt.prompt),
      duplicates: prompt.duplicates || [],
      
      // Processing flags
      vectorReady: true,
      searchReady: true
    };
    
    // Add code blocks if present
    if (prompt.codeBlocks) {
      metadata.codeBlocks = prompt.codeBlocks;
    }
    
    // Add examples if present
    if (prompt.examples) {
      metadata.examples = prompt.examples;
    }
    
    // Add type if present
    if (prompt.type) {
      metadata.type = prompt.type;
    }
    
    return metadata;
  }

  // Categorize prompt based on content
  categorizePrompt(prompt) {
    return categorizePrompt(prompt, this.categories);
  }

  // Generate tags from prompt content
  generateTags(prompt) {
    const tags = generateTags(prompt);
    
    // Add category as tag
    const category = this.categorizePrompt(prompt);
    if (category && category !== 'General') {
      tags.push(category.toLowerCase());
    }
    
    // Add difficulty as tag
    const difficulty = calculateDifficulty(prompt);
    tags.push(difficulty);
    
    // Add detected languages as tags
    const languages = detectLanguages(prompt);
    languages.forEach(lang => tags.push(lang));
    
    // Add detected models as tags
    const models = detectModels(prompt);
    models.forEach(model => tags.push(model));
    
    // Add detected tools as tags
    const tools = detectTools(prompt);
    tools.forEach(tool => tags.push(tool));
    
    return [...new Set(tags)];
  }

  // Calculate popularity score based on repository metrics
  calculatePopularityScore(prompt) {
    let score = 0;
    
    // Repository stars contribute to popularity
    if (prompt.repositoryStars) {
      score += Math.min(prompt.repositoryStars / 100, 10); // Max 10 points from stars
    }
    
    // Repository forks contribute
    if (prompt.repositoryForks) {
      score += Math.min(prompt.repositoryForks / 50, 5); // Max 5 points from forks
    }
    
    // Quality score influences popularity
    if (prompt.qualityScore) {
      score += (prompt.qualityScore / 100) * 5; // Max 5 points from quality
    }
    
    // Length of prompt (longer prompts might be more popular)
    if (prompt.prompt) {
      const lengthScore = Math.min(prompt.prompt.length / 500, 5);
      score += lengthScore;
    }
    
    return Math.min(Math.round(score * 10) / 10, 20); // Max 20 points, 1 decimal
  }

  // Generate similarity hash
  generateSimilarityHash(text) {
    const crypto = require('crypto');
    const normalized = text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  // Generate metadata for batch of prompts
  generateBatchMetadata(prompts, onProgress) {
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const metadata = this.generateMetadata(prompts[i]);
      results.push(metadata);
      
      if (onProgress && i % 100 === 0) {
        onProgress(i + 1, prompts.length);
      }
    }
    
    return results;
  }

  // Enhance existing metadata with additional fields
  enhanceMetadata(metadata) {
    // Recalculate quality score if not present
    if (!metadata.qualityScore) {
      metadata.qualityScore = calculateQualityScore(metadata.prompt);
    }
    
    // Recalculate difficulty if not present
    if (!metadata.difficulty) {
      metadata.difficulty = calculateDifficulty(metadata.prompt);
    }
    
    // Generate embedding text if not present
    if (!metadata.embeddingText) {
      metadata.embeddingText = generateEmbeddingText(metadata);
    }
    
    // Extract variables if not present
    if (!metadata.variables || metadata.variables.length === 0) {
      metadata.variables = extractVariables(metadata.prompt);
    }
    
    // Detect languages if not present
    if (!metadata.languages || metadata.languages.length === 0) {
      metadata.languages = detectLanguages(metadata.prompt);
    }
    
    // Detect models if not present
    if (!metadata.models || metadata.models.length === 0) {
      metadata.models = detectModels(metadata.prompt);
    }
    
    // Detect tools if not present
    if (!metadata.tools || metadata.tools.length === 0) {
      metadata.tools = detectTools(metadata.prompt);
    }
    
    // Generate tags if not present
    if (!metadata.tags || metadata.tags.length === 0) {
      metadata.tags = this.generateTags(metadata.prompt);
    }
    
    // Categorize if not present
    if (!metadata.category) {
      metadata.category = this.categorizePrompt(metadata.prompt);
    }
    
    // Update timestamps
    metadata.updatedAt = formatTimestamp(new Date());
    metadata.lastVerified = formatTimestamp(new Date());
    
    return metadata;
  }

  // Validate metadata completeness
  validateMetadata(metadata) {
    const required = ['id', 'prompt', 'title'];
    const recommended = ['category', 'tags', 'qualityScore'];
    const errors = [];
    const warnings = [];
    
    required.forEach(field => {
      if (!metadata[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    recommended.forEach(field => {
      if (!metadata[field]) {
        warnings.push(`Missing recommended field: ${field}`);
      }
    });
    
    // Check prompt length
    if (metadata.prompt && metadata.prompt.length < 10) {
      errors.push('Prompt too short (minimum 10 characters)');
    }
    
    // Check quality score range
    if (metadata.qualityScore && (metadata.qualityScore < 0 || metadata.qualityScore > 100)) {
      warnings.push('Quality score should be between 0 and 100');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Get metadata statistics
  getStats(prompts) {
    const stats = {
      total: prompts.length,
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
      uniqueTools: new Set()
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
        prompt.languages.forEach(lang => stats.uniqueLanguages.add(lang));
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
    });
    
    // Calculate averages
    if (stats.total > 0) {
      stats.avgQualityScore = stats.avgQualityScore / stats.total;
      stats.avgPopularityScore = stats.avgPopularityScore / stats.total;
    }
    
    // Convert sets to arrays
    stats.uniqueTags = Array.from(stats.uniqueTags);
    stats.uniqueLanguages = Array.from(stats.uniqueLanguages);
    stats.uniqueModels = Array.from(stats.uniqueModels);
    stats.uniqueTools = Array.from(stats.uniqueTools);
    
    return stats;
  }
}

export default MetadataGenerator;
