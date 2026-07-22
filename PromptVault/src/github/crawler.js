import axios from 'axios';
import { simpleGit } from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { sleep, retry, sanitizeFilename } from '../utils/helpers.js';

class GitHubCrawler {
  constructor(options = {}) {
    this.token = options.token || process.env.GITHUB_TOKEN;
    this.baseURL = 'https://api.github.com';
    this.rateLimitDelay = options.rateLimitDelay || 1000;
    this.maxRetries = options.maxRetries || 3;
    this.cloneDir = options.cloneDir || './repos';
  }

  setAuth(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PromptVault-Extraction-Engine'
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }

  async getRepositoryInfo(repoUrl) {
    const [owner, repo] = this.extractRepoInfo(repoUrl);
    
    try {
      const response = await retry(async () => {
        const res = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}`,
          { headers: this.getHeaders() }
        );
        return res.data;
      }, this.maxRetries);
      
      await sleep(this.rateLimitDelay);
      
      return {
        name: response.name,
        fullName: response.full_name,
        description: response.description,
        url: response.html_url,
        stars: response.stargazers_count,
        forks: response.forks_count,
        language: response.language,
        license: response.license?.name || null,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        defaultBranch: response.default_branch,
        size: response.size
      };
    } catch (error) {
      console.error(`Error fetching repository info for ${repoUrl}:`, error.message);
      return null;
    }
  }

  async searchRepositories(query, options = {}) {
    const params = {
      q: query,
      sort: options.sort || 'stars',
      order: options.order || 'desc',
      per_page: options.perPage || 100,
      page: options.page || 1
    };
    
    try {
      const response = await retry(async () => {
        const res = await axios.get(
          `${this.baseURL}/search/repositories`,
          {
            headers: this.getHeaders(),
            params
          }
        );
        return res.data;
      }, this.maxRetries);
      
      await sleep(this.rateLimitDelay);
      
      return response.items.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        license: repo.license?.name || null,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at
      }));
    } catch (error) {
      console.error(`Error searching repositories for query "${query}":`, error.message);
      return [];
    }
  }

  async cloneRepository(repoUrl, targetDir) {
    const [owner, repo] = this.extractRepoInfo(repoUrl);
    const clonePath = path.join(targetDir, sanitizeFilename(repo));
    
    try {
      console.log(`Cloning ${repoUrl} to ${clonePath}`);
      
      await fs.ensureDir(targetDir);
      
      const git = simpleGit();
      
      await git.clone(
        `https://${this.token ? `x-access-token:${this.token}@` : ''}github.com/${owner}/${repo}.git`,
        clonePath
      );
      
      console.log(`Successfully cloned ${repoUrl}`);
      
      return {
        success: true,
        path: clonePath,
        commitHash: await this.getLatestCommit(clonePath)
      };
    } catch (error) {
      console.error(`Error cloning ${repoUrl}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getLatestCommit(repoPath) {
    try {
      const git = simpleGit(repoPath);
      const log = await git.log({ maxCount: 1 });
      return log.latest.hash;
    } catch (error) {
      console.error(`Error getting latest commit for ${repoPath}:`, error.message);
      return null;
    }
  }

  async getRepositoryFiles(repoPath, extensions = ['.md', '.txt', '.json', '.yaml', '.yml']) {
    const files = [];
    
    try {
      const git = simpleGit(repoPath);
      const tree = await git.raw(['ls-tree', '-r', '--name-only', 'HEAD']);
      
      const fileList = tree.split('\n').filter(Boolean);
      
      fileList.forEach(filePath => {
        const ext = path.extname(filePath).toLowerCase();
        if (extensions.includes(ext)) {
          files.push({
            path: filePath,
            fullPath: path.join(repoPath, filePath),
            extension: ext
          });
        }
      });
      
      return files;
    } catch (error) {
      console.error(`Error getting repository files for ${repoPath}:`, error.message);
      return [];
    }
  }

  async getFileContent(repoPath, filePath) {
    try {
      const fullPath = path.join(repoPath, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
      return null;
    }
  }

  async getRepositoryContents(repoUrl, path = '') {
    const [owner, repo] = this.extractRepoInfo(repoUrl);
    
    try {
      const response = await retry(async () => {
        const res = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
          { headers: this.getHeaders() }
        );
        return res.data;
      }, this.maxRetries);
      
      await sleep(this.rateLimitDelay);
      
      return response;
    } catch (error) {
      console.error(`Error getting repository contents for ${repoUrl}/${path}:`, error.message);
      return null;
    }
  }

  async getRawFileContent(rawUrl) {
    try {
      const response = await retry(async () => {
        const res = await axios.get(rawUrl, {
          headers: {
            'User-Agent': 'PromptVault-Extraction-Engine'
          }
        });
        return res.data;
      }, this.maxRetries);
      
      await sleep(this.rateLimitDelay);
      
      return response;
    } catch (error) {
      console.error(`Error fetching raw file from ${rawUrl}:`, error.message);
      return null;
    }
  }

  extractRepoInfo(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return [match[1], match[2]];
    }
    throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
  }

  async processRepository(repoUrl, options = {}) {
    console.log(`Processing repository: ${repoUrl}`);
    
    const repoInfo = await this.getRepositoryInfo(repoUrl);
    if (!repoInfo) {
      return { success: false, error: 'Failed to fetch repository info' };
    }
    
    const cloneResult = await this.cloneRepository(
      repoUrl,
      options.cloneDir || this.cloneDir
    );
    
    if (!cloneResult.success) {
      return { success: false, error: cloneResult.error };
    }
    
    const files = await this.getRepositoryFiles(
      cloneResult.path,
      options.extensions || ['.md', '.txt', '.json', '.yaml', '.yml']
    );
    
    return {
      success: true,
      repoInfo,
      clonePath: cloneResult.path,
      commitHash: cloneResult.commitHash,
      files
    };
  }

  async cleanup(repoPath) {
    try {
      await fs.remove(repoPath);
      console.log(`Cleaned up ${repoPath}`);
    } catch (error) {
      console.error(`Error cleaning up ${repoPath}:`, error.message);
    }
  }
}

export default GitHubCrawler;
