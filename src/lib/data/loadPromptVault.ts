import fs from 'fs';
import path from 'path';
import type { PromptVaultDataset, PromptVaultItem } from '@/types';

export function loadPromptVaultData(): PromptVaultDataset {
  const dataPath = path.join(process.cwd(), 'data', 'prompts.json');
  
  try {
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const items: PromptVaultItem[] = JSON.parse(fileContent);
    
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    const difficulties: Record<string, number> = {};
    const qualityDistribution = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    };
    
    let totalQuality = 0;
    let totalPopularity = 0;
    let totalStars = 0;
    let totalForks = 0;
    
    for (const item of items) {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }
      
      for (const tag of item.tags || []) {
        tags[tag] = (tags[tag] || 0) + 1;
      }
      
      if (item.difficulty) {
        difficulties[item.difficulty] = (difficulties[item.difficulty] || 0) + 1;
      }
      
      if (item.qualityScore >= 80) qualityDistribution.excellent++;
      else if (item.qualityScore >= 60) qualityDistribution.good++;
      else if (item.qualityScore >= 40) qualityDistribution.average++;
      else qualityDistribution.poor++;
      
      totalQuality += item.qualityScore || 0;
      totalPopularity += item.popularityScore || 0;
      totalStars += item.repositoryStars || 0;
      totalForks += item.repositoryForks || 0;
    }
    
    const averageQuality = items.length > 0 ? totalQuality / items.length : 0;
    const averagePopularity = items.length > 0 ? totalPopularity / items.length : 0;
    
    return {
      items,
      categories,
      tags,
      difficulties,
      qualityDistribution,
      averageQuality,
      averagePopularity,
      totalStars,
      totalForks
    };
  } catch (error) {
    console.error('Error loading PromptVault data:', error);
    return {
      items: [],
      categories: {},
      tags: {},
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
  }
}
