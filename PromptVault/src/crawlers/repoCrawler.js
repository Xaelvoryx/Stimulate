import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class RepoCrawler {
  constructor(config) {
    this.config = config;
    this.baseDir = path.join(process.cwd(), 'data', 'repos');
    this.tempDir = path.join(process.cwd(), 'data', 'temp');
    this.processedRepos = new Set();
    this.failedRepos = new Set();
  }

  async initialize() {
    await fs.ensureDir(this.baseDir);
    await fs.ensureDir(this.tempDir);
  }

  parseGitHubUrl(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        fullName: `${match[1]}/${match[2]}`
      };
    }
    return null;
  }

  async cloneRepository(url) {
    const repoInfo = this.parseGitHubUrl(url);
    if (!repoInfo) {
      console.log(`Skipping invalid URL: ${url}`);
      return null;
    }

    const repoPath = path.join(this.baseDir, repoInfo.fullName.replace('/', '_'));
    
    if (this.processedRepos.has(url)) {
      console.log(`Already processed: ${repoInfo.fullName}`);
      return { path: repoPath, url, repoInfo, status: 'cached' };
    }

    try {
      console.log(`Fetching: ${repoInfo.fullName}`);
      
      if (await fs.pathExists(repoPath)) {
        await fs.remove(repoPath);
      }

      await fs.ensureDir(repoPath);
      
      const repoData = await this.getRepoMetadata(url, repoInfo);
      
      await this.sleep(1000);
      const files = await this.fetchRepositoryFiles(repoInfo);
      
      if (files.length === 0) {
        console.log(`API returned no files for ${repoInfo.fullName}`);
        this.failedRepos.add(url);
        return {
          path: null,
          url,
          repoInfo,
          status: 'failed',
          error: 'No files found via API'
        };
      }
      
      for (const file of files) {
        await this.downloadFile(file, repoPath, repoInfo);
        await this.sleep(100);
      }

      this.processedRepos.add(url);
      
      return {
        path: repoPath,
        url,
        repoInfo,
        repoData,
        status: 'success'
      };
    } catch (error) {
      console.error(`Failed to fetch ${repoInfo.fullName}:`, error.message);
      this.failedRepos.add(url);
      
      if (await fs.pathExists(repoPath)) {
        await fs.remove(repoPath);
      }
      
      return {
        path: null,
        url,
        repoInfo,
        status: 'failed',
        error: error.message
      };
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchRepositoryFiles(repoInfo) {
    const files = [];
    const seenPaths = new Set();
    
    await this.fetchDirectory(repoInfo, '', files, seenPaths);
    
    return files;
  }

  async fetchDirectory(repoInfo, dirPath, files, seenPaths) {
    try {
      const apiUrl = `https://api.github.com/repos/${repoInfo.fullName}/contents/${dirPath}`;
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const items = response.data;
      
      for (const item of items) {
        if (seenPaths.has(item.path)) continue;
        seenPaths.add(item.path);

        if (item.type === 'file') {
          if (this.shouldProcessFile(item.name)) {
            files.push({
              path: item.path,
              name: item.name,
              download_url: item.download_url
            });
          }
        } else if (item.type === 'dir') {
          await this.fetchDirectory(repoInfo, item.path, files, seenPaths);
        }
      }
    } catch (error) {
      console.log(`Could not fetch directory ${dirPath}:`, error.message);
    }
  }

  shouldProcessFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    const allowedExts = ['.md', '.txt', '.json', '.yaml', '.yml', '.xml', '.csv', '.html', '.mdx'];
    return allowedExts.includes(ext);
  }

  async downloadFile(file, repoPath, repoInfo) {
    try {
      const response = await axios.get(file.download_url, {
        responseType: 'arraybuffer'
      });

      const localPath = path.join(repoPath, file.path);
      await fs.ensureDir(path.dirname(localPath));
      await fs.writeFile(localPath, response.data);
    } catch (error) {
      console.log(`Could not download ${file.path}:`, error.message);
    }
  }

  async getRepoMetadata(url, repoInfo) {
    try {
      const response = await axios.get(`https://api.github.com/repos/${repoInfo.fullName}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return {
        stars: response.data.stargazers_count || 0,
        forks: response.data.forks_count || 0,
        license: response.data.license?.name || 'Unknown',
        description: response.data.description || '',
        defaultBranch: response.data.default_branch || 'main',
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
      console.log(`Could not fetch metadata for ${repoInfo.fullName}`);
      return {
        stars: 0,
        forks: 0,
        license: 'Unknown',
        description: '',
        defaultBranch: 'main',
        createdAt: null,
        updatedAt: null
      };
    }
  }

  async processTier(tierName, urls) {
    console.log(`\n=== Processing ${tierName} ===`);
    console.log(`Repositories: ${urls.length}`);
    
    const results = [];
    const batchSize = this.config.concurrentRepos || 3;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(url => this.cloneRepository(url))
      );
      results.push(...batchResults);
      
      console.log(`Progress: ${Math.min(i + batchSize, urls.length)}/${urls.length}`);
    }

    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    
    console.log(`${tierName} - Success: ${successful.length}, Failed: ${failed.length}`);
    
    return results;
  }

  async processAllTiers() {
    const allResults = {};
    
    for (const [tierName, urls] of Object.entries(this.config.tiers)) {
      allResults[tierName] = await this.processTier(tierName, urls);
    }

    return allResults;
  }

  async cleanup() {
    console.log('\nCleaning up temporary files...');
    try {
      await fs.emptyDir(this.tempDir);
    } catch (error) {
      console.log('Cleanup error:', error.message);
    }
  }

  getStats() {
    return {
      processed: this.processedRepos.size,
      failed: this.failedRepos.size,
      total: this.processedRepos.size + this.failedRepos.size
    };
  }
}

export default RepoCrawler;
