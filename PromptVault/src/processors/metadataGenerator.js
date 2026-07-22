class MetadataGenerator {
  constructor(config) {
    this.config = config;
    this.categories = config.categories || [];
    this.keywordMappings = this.buildKeywordMappings();
  }

  buildKeywordMappings() {
    const mappings = {};
    
    const categoryKeywords = {
      'Programming': ['code', 'programming', 'developer', 'software', 'algorithm', 'function', 'class', 'variable', 'debug', 'fix', 'implement'],
      'React': ['react', 'jsx', 'tsx', 'component', 'hook', 'usestate', 'useeffect', 'next.js', 'nextjs'],
      'Next.js': ['next.js', 'nextjs', 'app router', 'pages router', 'server components'],
      'Python': ['python', 'django', 'flask', 'fastapi', 'pip', 'pyproject'],
      'JavaScript': ['javascript', 'js', 'node.js', 'nodejs', 'express', 'npm', 'yarn'],
      'TypeScript': ['typescript', 'ts', 'interface', 'type', 'generic'],
      'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network'],
      'LLM': ['llm', 'large language model', 'gpt', 'claude', 'gemini', 'language model'],
      'Prompt Engineering': ['prompt', 'prompt engineering', 'system prompt', 'instruction', 'role'],
      'RAG': ['rag', 'retrieval', 'augmented', 'generation', 'vector', 'embedding', 'similarity'],
      'Agents': ['agent', 'autonomous', 'multi-agent', 'orchestration', 'workflow'],
      'MCP': ['mcp', 'model context protocol', 'tool server', 'connector'],
      'LangChain': ['langchain', 'chain', 'agent', 'tool', 'memory'],
      'CrewAI': ['crewai', 'crew', 'agent', 'task', 'role'],
      'AutoGen': ['autogen', 'multi-agent', 'conversation'],
      'Marketing': ['marketing', 'seo', 'content', 'copywriting', 'email', 'social media'],
      'Image Generation': ['image', 'midjourney', 'stable diffusion', 'dalle', 'flux', 'generate image'],
      'DevOps': ['devops', 'docker', 'kubernetes', 'ci/cd', 'deployment', 'infrastructure'],
      'Cloud': ['aws', 'azure', 'gcp', 'cloud', 'serverless'],
      'Database': ['sql', 'mongodb', 'postgresql', 'redis', 'database', 'query'],
      'Testing': ['test', 'testing', 'unit test', 'integration test', 'jest', 'pytest'],
      'Documentation': ['documentation', 'docs', 'readme', 'api documentation'],
      'Business': ['business', 'startup', 'finance', 'strategy', 'analysis'],
      'Education': ['education', 'teaching', 'learning', 'tutorial', 'explain'],
      'Legal': ['legal', 'law', 'contract', 'compliance'],
      'Medical': ['medical', 'health', 'healthcare', 'diagnosis']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        mappings[keyword.toLowerCase()] = category;
      }
    }

    return mappings;
  }

  generateMetadata(prompt) {
    const text = `${prompt.prompt} ${prompt.description} ${prompt.title}`.toLowerCase();
    
    return {
      category: this.categorizePrompt(text, prompt),
      subcategory: this.generateSubcategory(text, prompt),
      tags: this.generateTags(text, prompt),
      models: this.detectModels(text),
      tools: this.detectTools(text),
      frameworks: this.detectFrameworks(text),
      languages: this.detectLanguages(text),
      difficulty: this.refineDifficulty(prompt.prompt, prompt.difficulty),
      qualityScore: this.refineQualityScore(prompt.prompt, prompt.qualityScore),
      popularityScore: this.calculatePopularityScore(prompt)
    };
  }

  categorizePrompt(text, prompt) {
    if (prompt.category && this.categories.includes(prompt.category)) {
      return prompt.category;
    }

    for (const [keyword, category] of Object.entries(this.keywordMappings)) {
      if (text.includes(keyword)) {
        return category;
      }
    }

    const repoCategory = this.inferFromRepository(prompt.repository);
    if (repoCategory) {
      return repoCategory;
    }

    return 'General';
  }

  generateSubcategory(text, prompt) {
    const subcategories = {
      'Programming': ['Web Development', 'Mobile Development', 'Data Science', 'DevOps', 'System Design'],
      'AI': ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning'],
      'LLM': ['ChatGPT', 'Claude', 'Gemini', 'Open Source Models', 'Fine-tuning'],
      'Prompt Engineering': ['Role Prompts', 'Chain of Thought', 'Few-shot', 'Zero-shot', 'System Prompts'],
      'RAG': ['Vector Search', 'Hybrid Search', 'Knowledge Graph', 'Document Processing'],
      'Agents': ['Coding Agents', 'Research Agents', 'Browser Agents', 'Multi-agent Systems'],
      'Marketing': ['SEO', 'Content Writing', 'Email Marketing', 'Social Media'],
      'Image Generation': ['Midjourney', 'Stable Diffusion', 'DALL-E', 'Flux']
    };

    const category = this.categorizePrompt(text, prompt);
    const possibleSubcategories = subcategories[category] || [];

    for (const subcategory of possibleSubcategories) {
      const keywords = subcategory.toLowerCase().split(' ');
      if (keywords.some(kw => text.includes(kw))) {
        return subcategory;
      }
    }

    return '';
  }

  generateTags(text, prompt) {
    const tags = new Set(prompt.tags || []);

    const tagPatterns = [
      /\b(act as|role|persona|character)\b/i,
      /\b(step by step|detailed|thorough|comprehensive)\b/i,
      /\b(example|for instance|such as|illustration)\b/i,
      /\b(code|programming|developer|software)\b/i,
      /\b(write|create|generate|make|build)\b/i,
      /\b(explain|describe|analyze|review)\b/i,
      /\b(debug|fix|troubleshoot|solve)\b/i,
      /\b(design|architecture|structure)\b/i,
      /\b(test|testing|validation)\b/i,
      /\b(document|documentation|readme)\b/i,
      /\b(marketing|seo|content|copywriting)\b/i,
      /\b(image|picture|visual|graphic)\b/i,
      /\b(data|dataset|database)\b/i,
      /\b(api|rest|graphql)\b/i,
      /\b(web|frontend|backend|fullstack)\b/i
    ];

    for (const pattern of tagPatterns) {
      const match = text.match(pattern);
      if (match) {
        tags.add(match[1].toLowerCase());
      }
    }

    const category = this.categorizePrompt(text, prompt);
    tags.add(category.toLowerCase());

    return Array.from(tags);
  }

  detectModels(text) {
    const models = [];
    const modelPatterns = [
      /gpt[-\s]?4/i,
      /gpt[-\s]?3\.5/i,
      /claude[-\s]?3/i,
      /claude[-\s]?2/i,
      /gemini[-\s]?pro/i,
      /gemini[-\s]?1\.5/i,
      /llama[-\s]?2/i,
      /llama[-\s]?3/i,
      /mistral/i,
      /qwen/i,
      /deepseek/i
    ];

    for (const pattern of modelPatterns) {
      const match = text.match(pattern);
      if (match) {
        models.push(match[0]);
      }
    }

    return [...new Set(models)];
  }

  detectTools(text) {
    const tools = [];
    const toolPatterns = [
      /cursor/i,
      /cline/i,
      /aider/i,
      /copilot/i,
      /windsurf/i,
      /github/i,
      /gitlab/i,
      /docker/i,
      /kubernetes/i,
      /aws/i,
      /azure/i,
      /gcp/i
    ];

    for (const pattern of toolPatterns) {
      const match = text.match(pattern);
      if (match) {
        tools.push(match[0]);
      }
    }

    return [...new Set(tools)];
  }

  detectFrameworks(text) {
    const frameworks = [];
    const frameworkPatterns = [
      /react/i,
      /next\.?js/i,
      /vue/i,
      /angular/i,
      /node\.?js/i,
      /express/i,
      /django/i,
      /flask/i,
      /fastapi/i,
      /spring/i,
      /laravel/i,
      /langchain/i,
      /langgraph/i,
      /crewai/i,
      /autogen/i,
      /llamaindex/i,
      /semantic[-\s]?kernel/i
    ];

    for (const pattern of frameworkPatterns) {
      const match = text.match(pattern);
      if (match) {
        frameworks.push(match[0]);
      }
    }

    return [...new Set(frameworks)];
  }

  detectLanguages(text) {
    const languages = [];
    const languagePatterns = [
      /javascript|js\b/i,
      /typescript|ts\b/i,
      /python\b/i,
      /java\b/i,
      /c\+\+/i,
      /c#\b/i,
      /go\b/i,
      /rust\b/i,
      /php\b/i,
      /ruby\b/i,
      /swift\b/i,
      /kotlin\b/i,
      /sql\b/i,
      /html\b/i,
      /css\b/i
    ];

    for (const pattern of languagePatterns) {
      const match = text.match(pattern);
      if (match) {
        languages.push(match[0].toLowerCase());
      }
    }

    return [...new Set(languages)];
  }

  refineDifficulty(prompt, currentDifficulty) {
    const length = prompt.length;
    const complexity = prompt.split(/[.!?]/).length;
    const hasStructure = /\n|\t|•|-/.test(prompt);
    const hasVariables = /\{|\}|\$|</.test(prompt);
    const hasExamples = /\b(example|for instance|such as)\b/i.test(prompt);

    let score = 0;
    if (length > 100) score += 1;
    if (length > 300) score += 1;
    if (complexity > 5) score += 1;
    if (complexity > 10) score += 1;
    if (hasStructure) score += 1;
    if (hasVariables) score += 1;
    if (hasExamples) score += 1;

    if (score <= 2) return 'beginner';
    if (score <= 4) return 'intermediate';
    if (score <= 5) return 'advanced';
    return 'expert';
  }

  refineQualityScore(prompt, currentScore) {
    let score = currentScore || 50;

    if (prompt.length > 50) score += 5;
    if (prompt.length > 200) score += 5;
    if (prompt.length > 500) score += 5;
    
    if (/\b(act as|you are|role)\b/i.test(prompt)) score += 10;
    if (/\b(context|background|information)\b/i.test(prompt)) score += 10;
    if (/\b(task|objective|goal)\b/i.test(prompt)) score += 10;
    if (/\b(step by step|detailed|thorough)\b/i.test(prompt)) score += 10;
    if (/\b(example|for instance)\b/i.test(prompt)) score += 10;
    if (/\b(format|output|structure)\b/i.test(prompt)) score += 5;
    if (/\{|\}|\$|</.test(prompt)) score += 5;
    if (/\n|\t/.test(prompt)) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  calculatePopularityScore(prompt) {
    let score = 0;
    
    score += Math.min(prompt.repositoryStars / 100, 50);
    score += Math.min(prompt.repositoryForks / 50, 30);
    
    if (prompt.qualityScore > 80) score += 10;
    if (prompt.tags.length > 3) score += 5;
    
    return Math.min(100, score);
  }

  inferFromRepository(repository) {
    if (!repository) return null;

    const repoMappings = {
      'langchain-ai/langchain': 'LangChain',
      'langchain-ai/langgraph': 'LangChain',
      'crewAIInc/crewAI': 'CrewAI',
      'microsoft/autogen': 'AutoGen',
      'run-llama/llama_index': 'RAG',
      'openai/openai-cookbook': 'LLM',
      'anthropics/claude-code': 'Claude',
      'cline/cline': 'Claude',
      'Aider-AI/aider': 'Claude',
      'f/awesome-chatgpt-prompts': 'Prompt Engineering',
      'dair-ai/Prompt-Engineering-Guide': 'Prompt Engineering'
    };

    return repoMappings[repository] || null;
  }

  generateRelatedPrompts(prompt, allPrompts, limit = 5) {
    const related = [];
    const promptText = `${prompt.prompt} ${prompt.description} ${prompt.title}`.toLowerCase();
    const promptCategory = prompt.category;

    for (const otherPrompt of allPrompts) {
      if (otherPrompt.id === prompt.id) continue;

      const otherText = `${otherPrompt.prompt} ${otherPrompt.description} ${otherPrompt.title}`.toLowerCase();
      
      let similarity = 0;
      
      if (otherPrompt.category === promptCategory) similarity += 30;
      
      const commonTags = prompt.tags.filter(tag => otherPrompt.tags.includes(tag));
      similarity += commonTags.length * 10;
      
      if (otherPrompt.repository === prompt.repository) similarity += 15;
      
      const commonWords = promptText.split(' ').filter(word => 
        word.length > 3 && otherText.includes(word)
      );
      similarity += Math.min(commonWords.length * 2, 20);

      if (similarity > 30) {
        related.push({
          id: otherPrompt.id,
          title: otherPrompt.title,
          similarity: similarity
        });
      }
    }

    return related
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(r => r.id);
  }

  processBatch(prompts) {
    console.log(`Generating metadata for ${prompts.length} prompts...`);
    
    return prompts.map(prompt => {
      const metadata = this.generateMetadata(prompt);
      
      return {
        ...prompt,
        ...metadata
      };
    });
  }
}

export default MetadataGenerator;
