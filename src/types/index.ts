export interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'code' | 'quote' | 'bullet';
  background?: string;
  image?: string;
  notes?: string;
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  category: string;
  slides: Slide[];
  thumbnail?: string;
  duration?: number;
  event?: string;
  location?: string;
  language: 'ja' | 'en';
  status: 'published' | 'draft' | 'archived';
}

export interface Profile {
  name: {
    ja: string;
    en: string;
  };
  title: {
    ja: string;
    en: string;
  };
  company: {
    ja: string;
    en: string;
  };
  bio: {
    ja: string;
    en: string;
  };
  avatar: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface SearchFilters {
  query: string;
  tags: string[];
  category: string;
  language: 'all' | 'ja' | 'en';
  status: 'all' | 'published' | 'draft' | 'archived';
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface BuildConfig {
  presentations: string[];
  outputDir: string;
  mode: 'selective' | 'all';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  slides: Omit<Slide, 'id'>[];
  category: string;
}

export interface AIWorkflowConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  prompts: {
    slideGeneration: string;
    contentOptimization: string;
    translation: string;
  };
}

export type ViewMode = 'grid' | 'list' | 'presentation';
export type SortOrder = 'date' | 'title' | 'category' | 'popularity';