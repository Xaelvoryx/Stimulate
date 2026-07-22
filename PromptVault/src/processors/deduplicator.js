import { generateSimilarityHash, cleanText } from '../utils/helpers.js';
import natural from 'natural';

class PromptDeduplicator {
  constructor(options = {}) {
    this.similarityThreshold = options.similarityThreshold || 0.85;
    this.exactDuplicates = new Map();
    this.nearDuplicates = new Map();
    this.processedHashes = new Set();
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
  }

  // Remove exact duplicates based on content hash
  removeExactDuplicates(prompts) {
    const uniquePrompts = [];
    const seenHashes = new Map();
    
    prompts.forEach(prompt => {
      const hash = generateSimilarityHash(prompt.prompt);
      
      if (seenHashes.has(hash)) {
        // Keep the one with better quality score or more metadata
        const existing = seenHashes.get(hash);
        const currentQuality = prompt.qualityScore || 0;
        const existingQuality = existing.qualityScore || 0;
        
        if (currentQuality > existingQuality) {
          seenHashes.set(hash, prompt);
          // Mark as duplicate
          prompt.duplicates = prompt.duplicates || [];
          prompt.duplicates.push(existing.id);
        } else {
          existing.duplicates = existing.duplicates || [];
          existing.duplicates.push(prompt.id);
        }
        
        this.exactDuplicates.set(hash, {
          original: seenHashes.get(hash),
          duplicate: prompt
        });
      } else {
        seenHashs.set(hash, prompt);
        uniquePrompts.push(prompt);
      }
    });
    
    console.log(`Removed ${prompts.length - uniquePrompts.length} exact duplicates`);
    return uniquePrompts;
  }

  // Remove near duplicates using text similarity
  removeNearDuplicates(prompts) {
    const uniquePrompts = [];
    const processed = new Set();
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt1 = prompts[i];
      const hash1 = generateSimilarityHash(prompt1.prompt);
      
      if (processed.has(hash1)) continue;
      
      let isDuplicate = false;
      
      for (let j = i + 1; j < prompts.length; j++) {
        const prompt2 = prompts[j];
        const hash2 = generateSimilarityHash(prompt2.prompt);
        
        if (processed.has(hash2)) continue;
        
        const similarity = this.calculateSimilarity(prompt1.prompt, prompt2.prompt);
        
        if (similarity >= this.similarityThreshold) {
          isDuplicate = true;
          processed.add(hash2);
          
          // Keep the better one
          const quality1 = prompt1.qualityScore || 0;
          const quality2 = prompt2.qualityScore || 0;
          
          if (quality1 >= quality2) {
            prompt1.relatedPrompts = prompt1.relatedPrompts || [];
            prompt1.relatedPrompts.push(prompt2.id);
          } else {
            prompt2.relatedPrompts = prompt2.relatedPrompts || [];
            prompt2.relatedPrompts.push(prompt1.id);
            processed.add(hash1);
            isDuplicate = false;
            break;
          }
          
          this.nearDuplicates.set(`${hash1}-${hash2}`, {
            prompt1: prompt1.id,
            prompt2: prompt2.id,
            similarity
          });
        }
      }
      
      if (!isDuplicate) {
        uniquePrompts.push(prompt1);
        processed.add(hash1);
      }
    }
    
    console.log(`Removed ${prompts.length - uniquePrompts.length} near duplicates`);
    return uniquePrompts;
  }

  // Calculate text similarity using multiple methods
  calculateSimilarity(text1, text2) {
    const clean1 = cleanText(text1);
    const clean2 = cleanText(text2);
    
    // Jaccard similarity
    const jaccard = this.jaccardSimilarity(clean1, clean2);
    
    // Cosine similarity
    const cosine = this.cosineSimilarity(clean1, clean2);
    
    // Levenshtein distance
    const levenshtein = this.levenshteinSimilarity(clean1, clean2);
    
    // Weighted average
    return (jaccard * 0.3) + (cosine * 0.4) + (levenshtein * 0.3);
  }

  // Jaccard similarity using word sets
  jaccardSimilarity(text1, text2) {
    const tokens1 = new Set(this.tokenizer.tokenize(text1.toLowerCase()));
    const tokens2 = new Set(this.tokenizer.tokenize(text2.toLowerCase()));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    if (union.size === 0) return 0;
    
    return intersection.size / union.size;
  }

  // Cosine similarity using TF-IDF
  cosineSimilarity(text1, text2) {
    const tokens1 = this.tokenizer.tokenize(text1.toLowerCase());
    const tokens2 = this.tokenizer.tokenize(text2.toLowerCase());
    
    const allTokens = new Set([...tokens1, ...tokens2]);
    
    const vector1 = this.createTFIDFVector(tokens1, allTokens);
    const vector2 = this.createTFIDFVector(tokens2, allTokens);
    
    return this.dotProduct(vector1, vector2) / 
           (this.magnitude(vector1) * this.magnitude(vector2));
  }

  createTFIDFVector(tokens, allTokens) {
    const vector = {};
    const termFreq = {};
    
    tokens.forEach(token => {
      termFreq[token] = (termFreq[token] || 0) + 1;
    });
    
    allTokens.forEach(token => {
      const tf = termFreq[token] || 0;
      const idf = Math.log(allTokens.size / (tokens.includes(token) ? 1 : allTokens.size));
      vector[token] = tf * idf;
    });
    
    return vector;
  }

  dotProduct(vec1, vec2) {
    let sum = 0;
    for (const key in vec1) {
      if (vec2[key]) {
        sum += vec1[key] * vec2[key];
      }
    }
    return sum;
  }

  magnitude(vec) {
    let sum = 0;
    for (const key in vec) {
      sum += vec[key] * vec[key];
    }
    return Math.sqrt(sum);
  }

  // Levenshtein distance similarity
  levenshteinSimilarity(text1, text2) {
    const distance = natural.LevenshteinDistance(text1, text2);
    const maxLen = Math.max(text1.length, text2.length);
    
    if (maxLen === 0) return 1;
    
    return 1 - (distance / maxLen);
  }

  // Merge metadata from duplicate prompts
  mergeMetadata(original, duplicate) {
    // Merge tags
    if (duplicate.tags && duplicate.tags.length > 0) {
      original.tags = original.tags || [];
      duplicate.tags.forEach(tag => {
        if (!original.tags.includes(tag)) {
          original.tags.push(tag);
        }
      });
    }
    
    // Merge categories
    if (duplicate.category && !original.category) {
      original.category = duplicate.category;
    }
    
    // Merge examples
    if (duplicate.examples && duplicate.examples.length > 0) {
      original.examples = original.examples || [];
      duplicate.examples.forEach(example => {
        if (!original.examples.includes(example)) {
          original.examples.push(example);
        }
      });
    }
    
    // Merge repository info
    if (duplicate.repository && !original.repository) {
      original.repository = duplicate.repository;
      original.repositoryUrl = duplicate.repositoryUrl;
    }
    
    // Update quality score if duplicate is better
    if (duplicate.qualityScore > (original.qualityScore || 0)) {
      original.qualityScore = duplicate.qualityScore;
    }
    
    return original;
  }

  // Normalize prompts to consistent format
  normalizePrompts(prompts) {
    return prompts.map(prompt => {
      // Clean prompt text
      prompt.prompt = cleanText(prompt.prompt);
      
      // Normalize title
      if (prompt.title) {
        prompt.title = cleanText(prompt.title);
      }
      
      // Normalize description
      if (prompt.description) {
        prompt.description = cleanText(prompt.description);
      }
      
      // Ensure tags is an array
      if (!Array.isArray(prompt.tags)) {
        prompt.tags = prompt.tags ? [prompt.tags] : [];
      }
      
      // Ensure relatedPrompts is an array
      if (!Array.isArray(prompt.relatedPrompts)) {
        prompt.relatedPrompts = prompt.relatedPrompts ? [prompt.relatedPrompts] : [];
      }
      
      // Ensure duplicates is an array
      if (!Array.isArray(prompt.duplicates)) {
        prompt.duplicates = prompt.duplicates ? [prompt.duplicates] : [];
      }
      
      // Normalize type
      if (prompt.type) {
        prompt.type = prompt.type.toLowerCase();
      }
      
      return prompt;
    });
  }

  // Full deduplication pipeline
  deduplicate(prompts) {
    console.log(`Starting deduplication with ${prompts.length} prompts`);
    
    // Step 1: Normalize
    const normalized = this.normalizePrompts(prompts);
    console.log(`Normalized ${normalized.length} prompts`);
    
    // Step 2: Remove exact duplicates
    const noExact = this.removeExactDuplicates(normalized);
    
    // Step 3: Remove near duplicates
    const final = this.removeNearDuplicates(noExact);
    
    console.log(`Deduplication complete: ${prompts.length} -> ${final.length} prompts`);
    
    return {
      prompts: final,
      stats: {
        original: prompts.length,
        exactDuplicates: this.exactDuplicates.size,
        nearDuplicates: this.nearDuplicates.size,
        final: final.length
      }
    };
  }

  // Get deduplication statistics
  getStats() {
    return {
      exactDuplicates: this.exactDuplicates.size,
      nearDuplicates: this.nearDuplicates.size,
      processedHashes: this.processedHashes.size
    };
  }

  // Reset deduplication state
  reset() {
    this.exactDuplicates.clear();
    this.nearDuplicates.clear();
    this.processedHashes.clear();
  }
}

export default PromptDeduplicator;
