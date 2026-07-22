import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { format, formatDistanceToNow } from 'date-fns';

// Generate unique ID for prompts
export function generateId() {
  return uuidv4();
}

// Generate slug from title
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Generate similarity hash for deduplication
export function generateSimilarityHash(text) {
  const normalized = text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
  
  return crypto.createHash('md5').update(normalized).digest('hex');
}

// Calculate quality score based on various factors
export function calculateQualityScore(prompt) {
  let score = 50; // Base score
  
  // Length factor (prefer substantial prompts)
  if (prompt.length > 100) score += 10;
  if (prompt.length > 500) score += 10;
  if (prompt.length > 1000) score += 5;
  
  // Structure factor
  if (prompt.includes('\n')) score += 5;
  if (prompt.includes('###') || prompt.includes('##')) score += 5;
  
  // Content indicators
  if (prompt.includes('you are') || prompt.includes('You are')) score += 10;
  if (prompt.includes('please') || prompt.includes('Please')) score += 5;
  if (prompt.includes('example') || prompt.includes('Example')) score += 5;
  
  // Technical indicators
  if (prompt.includes('```') || prompt.includes('code')) score += 10;
  if (prompt.includes('step') || prompt.includes('Step')) score += 5;
  
  return Math.min(score, 100);
}

// Calculate difficulty level
export function calculateDifficulty(prompt) {
  const complexity = prompt.length;
  const technicalTerms = (prompt.match(/function|class|algorithm|api|database|framework/gi) || []).length;
  
  if (complexity < 100 && technicalTerms === 0) return 'beginner';
  if (complexity < 300 && technicalTerms < 3) return 'intermediate';
  if (complexity < 500 && technicalTerms < 5) return 'advanced';
  return 'expert';
}

// Extract variables from prompt
export function extractVariables(prompt) {
  const variables = [];
  const patterns = [
    /\{([^}]+)\}/g,
    /\[([^\]]+)\]/g,
    /\$\{([^}]+)\}/g,
    /{{([^}]+)}}/g,
    /<([^>]+)>/g
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(prompt)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
  });
  
  return variables;
}

// Detect programming languages mentioned
export function detectLanguages(prompt) {
  const languages = [];
  const languageMap = {
    'javascript': /javascript|js|node\.js/gi,
    'python': /python|py|pip/gi,
    'java': /java|spring|hibernate/gi,
    'c#': /c#|csharp|\.net/gi,
    'typescript': /typescript|ts|angular/gi,
    'react': /react|jsx|tsx/gi,
    'vue': /vue\.js|vue/gi,
    'angular': /angular|typescript/gi,
    'go': /golang|go\s*lang/gi,
    'rust': /rust|cargo/gi,
    'php': /php|laravel/gi,
    'ruby': /ruby|rails/gi,
    'swift': /swift|ios/gi,
    'kotlin': /kotlin|android/gi,
    'sql': /sql|mysql|postgres|postgresql/gi,
    'html': /html|css/gi,
    'css': /css|scss|sass/gi
  };
  
  Object.entries(languageMap).forEach(([lang, pattern]) => {
    if (pattern.test(prompt)) {
      languages.push(lang);
    }
  });
  
  return [...new Set(languages)];
}

// Detect AI models mentioned
export function detectModels(prompt) {
  const models = [];
  const modelPatterns = [
    /gpt[-\s]?4/i,
    /gpt[-\s]?3\.5/i,
    /gpt[-\s]?3/i,
    /claude[-\s]?3/i,
    /claude[-\s]?2/i,
    /gemini[-\s]?pro/i,
    /gemini[-\s]?ultra/i,
    /llama[-\s]?2/i,
    /llama[-\s]?3/i,
    /mistral/i,
    /qwen/i,
    /deepseek/i
  ];
  
  modelPatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) {
      models.push(match[0].toLowerCase());
    }
  });
  
  return [...new Set(models)];
}

// Detect tools and frameworks
export function detectTools(prompt) {
  const tools = [];
  const toolPatterns = [
    /langchain/i,
    /langgraph/i,
    /crewai/i,
    /autogen/i,
    /llamaindex/i,
    /semantic[-\s]?kernel/i,
    /openai/i,
    /anthropic/i,
    /google[-\s]?gemini/i,
    /cursor/i,
    /cline/i,
    /aider/i,
    /copilot/i,
    /docker/i,
    /kubernetes/i,
    /aws/i,
    /azure/i,
    /gcp/i,
    /github/i,
    /gitlab/i
  ];
  
  toolPatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) {
      tools.push(match[0].toLowerCase());
    }
  });
  
  return [...new Set(tools)];
}

// Generate embedding text (concatenated relevant fields)
export function generateEmbeddingText(prompt) {
  const fields = [
    prompt.title || '',
    prompt.description || '',
    prompt.prompt || '',
    prompt.category || '',
    prompt.subcategory || '',
    ...(prompt.tags || [])
  ];
  
  return fields.filter(Boolean).join(' ').toLowerCase();
}

// Format timestamp
export function formatTimestamp(date) {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
}

// Calculate relative time
export function getRelativeTime(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Clean and normalize text
export function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extract code blocks from text
export function extractCodeBlocks(text) {
  const codeBlocks = [];
  const pattern = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return codeBlocks;
}

// Extract examples from prompt
export function extractExamples(prompt) {
  const examples = [];
  const patterns = [
    /example[:\s]+([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
    /for example[:\s]+([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
    /e\.g\.[:\s]+([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(prompt)) !== null) {
      examples.push(match[1].trim());
    }
  });
  
  return examples;
}

// Categorize prompt based on content
export function categorizePrompt(prompt, categories) {
  const lowerPrompt = prompt.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;
  
  categories.forEach(category => {
    const lowerCategory = category.toLowerCase();
    let score = 0;
    
    // Exact match
    if (lowerPrompt.includes(lowerCategory)) {
      score += 10;
    }
    
    // Partial match
    const words = lowerCategory.split(/\s+/);
    words.forEach(word => {
      if (lowerPrompt.includes(word)) {
        score += 2;
      }
    });
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = category;
    }
  });
  
  return bestMatch || 'General';
}

// Generate tags from prompt content
export function generateTags(prompt) {
  const tags = [];
  const tagKeywords = {
    'coding': ['code', 'programming', 'function', 'class', 'algorithm'],
    'debugging': ['debug', 'fix', 'error', 'issue', 'problem'],
    'documentation': ['document', 'explain', 'describe', 'overview'],
    'testing': ['test', 'unit test', 'integration', 'mock'],
    'api': ['api', 'endpoint', 'request', 'response', 'rest'],
    'database': ['database', 'sql', 'query', 'schema'],
    'frontend': ['frontend', 'ui', 'css', 'html', 'react', 'vue'],
    'backend': ['backend', 'server', 'api', 'microservice'],
    'devops': ['deploy', 'ci/cd', 'docker', 'kubernetes'],
    'security': ['security', 'auth', 'encryption', 'vulnerability'],
    'performance': ['performance', 'optimize', 'cache', 'latency'],
    'design': ['design', 'architecture', 'pattern', 'structure'],
    'analysis': ['analyze', 'analysis', 'data', 'statistics'],
    'writing': ['write', 'content', 'article', 'blog'],
    'translation': ['translate', 'translation', 'language'],
    'summarization': ['summarize', 'summary', 'brief'],
    'explanation': ['explain', 'explanation', 'how', 'why'],
    'tutorial': ['tutorial', 'guide', 'step', 'learn'],
    'best-practices': ['best practice', 'recommendation', 'should'],
    'troubleshooting': ['troubleshoot', 'solve', 'fix', 'resolve']
  };
  
  const lowerPrompt = prompt.toLowerCase();
  
  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    const matchCount = keywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    if (matchCount >= 2) {
      tags.push(tag);
    }
  });
  
  return [...new Set(tags)];
}

// Validate prompt object
export function validatePrompt(prompt) {
  const required = ['id', 'prompt'];
  const errors = [];
  
  required.forEach(field => {
    if (!prompt[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  if (prompt.prompt && prompt.prompt.length < 10) {
    errors.push('Prompt too short (minimum 10 characters)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Sanitize filename
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

// Chunk array into smaller arrays
export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Sleep utility for rate limiting
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry utility with exponential backoff
export async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i));
    }
  }
}
