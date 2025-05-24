import Fuse from 'fuse.js';
import { Presentation, SearchFilters } from '@/types';

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'category', weight: 0.1 },
    { name: 'slides.title', weight: 0.15 },
    { name: 'slides.content', weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
};

export class PresentationSearch {
  private fuse: Fuse<Presentation>;

  constructor(presentations: Presentation[]) {
    this.fuse = new Fuse(presentations, fuseOptions);
  }

  search(filters: SearchFilters): Presentation[] {
    let results = this.fuse.getCollection();

    // Text search
    if (filters.query.trim()) {
      const searchResults = this.fuse.search(filters.query);
      results = searchResults.map(result => result.item);
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      results = results.filter(presentation =>
        filters.tags.some(tag => presentation.tags.includes(tag))
      );
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      results = results.filter(presentation =>
        presentation.category === filters.category
      );
    }

    // Filter by language
    if (filters.language && filters.language !== 'all') {
      results = results.filter(presentation =>
        presentation.language === filters.language
      );
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      results = results.filter(presentation =>
        presentation.status === filters.status
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);
      
      results = results.filter(presentation => {
        const presentationDate = new Date(presentation.date);
        return presentationDate >= fromDate && presentationDate <= toDate;
      });
    }

    return results;
  }

  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];

    const results = this.fuse.search(query, { limit });
    const suggestions = new Set<string>();

    results.forEach(result => {
      if (result.matches) {
        result.matches.forEach(match => {
          if (match.key === 'tags') {
            const tags = result.item.tags;
            tags.forEach(tag => {
              if (tag.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(tag);
              }
            });
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  getRelatedPresentations(presentation: Presentation, limit: number = 3): Presentation[] {
    const query = [...presentation.tags, presentation.category].join(' ');
    const results = this.fuse.search(query, { limit: limit + 1 });
    
    return results
      .map(result => result.item)
      .filter(item => item.id !== presentation.id)
      .slice(0, limit);
  }
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

export function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words and short words
  const commonWords = new Set([
    'の', 'に', 'は', 'を', 'が', 'と', 'て', 'で', 'から', 'まで', 'より',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'must'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 keywords
}