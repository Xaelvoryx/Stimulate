import crypto from 'crypto';

class Deduplicator {
  constructor(config) {
    this.config = config;
    this.similarityThreshold = 0.85;
    this.exactDuplicates = new Map();
    this.nearDuplicates = new Map();
  }

  deduplicate(prompts) {
    console.log(`Deduplicating ${prompts.length} prompts...`);
    
    const uniquePrompts = [];
    const duplicateMap = new Map();
    const similarityMap = new Map();

    for (const prompt of prompts) {
      const hash = this.generateHash(prompt.prompt);
      
      if (duplicateMap.has(hash)) {
        const existing = duplicateMap.get(hash);
        existing.duplicates.push(prompt.id);
        this.mergeMetadata(existing, prompt);
        continue;
      }

      const nearDuplicate = this.findNearDuplicate(prompt, uniquePrompts);
      if (nearDuplicate) {
        nearDuplicate.duplicates.push(prompt.id);
        this.mergeMetadata(nearDuplicate, prompt);
        continue;
      }

      prompt.duplicates = [];
      duplicateMap.set(hash, prompt);
      uniquePrompts.push(prompt);
    }

    console.log(`Removed ${prompts.length - uniquePrompts.length} duplicates`);
    console.log(`Remaining: ${uniquePrompts.length} unique prompts`);

    return uniquePrompts;
  }

  generateHash(text) {
    const normalized = text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  findNearDuplicate(prompt, existingPrompts) {
    for (const existing of existingPrompts) {
      const similarity = this.calculateSimilarity(prompt.prompt, existing.prompt);
      if (similarity >= this.similarityThreshold) {
        return existing;
      }
    }
    return null;
  }

  calculateSimilarity(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    if (union.length === 0) return 0;

    const jaccard = intersection.length / union.length;

    const lengthSimilarity = 1 - Math.abs(text1.length - text2.length) / Math.max(text1.length, text2.length);

    return (jaccard * 0.7) + (lengthSimilarity * 0.3);
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  mergeMetadata(primary, secondary) {
    if (secondary.tags && secondary.tags.length > 0) {
      const existingTags = new Set(primary.tags || []);
      secondary.tags.forEach(tag => existingTags.add(tag));
      primary.tags = Array.from(existingTags);
    }

    if (secondary.category && !primary.category) {
      primary.category = secondary.category;
    }

    if (secondary.repositoryStars > primary.repositoryStars) {
      primary.repository = secondary.repository;
      primary.repositoryUrl = secondary.repositoryUrl;
      primary.repositoryStars = secondary.repositoryStars;
    }

    primary.qualityScore = Math.max(primary.qualityScore, secondary.qualityScore);
    primary.popularityScore = Math.max(primary.popularityScore, secondary.popularityScore);
  }

  generateSimilarityHash(prompt) {
    const normalized = prompt
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  getStats(originalCount, deduplicatedCount) {
    return {
      original: originalCount,
      duplicatesRemoved: originalCount - deduplicatedCount,
      remaining: deduplicatedCount,
      reductionRate: ((originalCount - deduplicatedCount) / originalCount * 100).toFixed(2)
    };
  }
}

export default Deduplicator;
