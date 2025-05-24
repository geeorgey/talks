import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { Presentation, Profile, Template } from '@/types';

const dataDir = path.join(process.cwd(), 'src/data');
const presentationsDir = path.join(dataDir, 'presentations');
const templatesDir = path.join(dataDir, 'templates');

export async function getAllPresentations(): Promise<Presentation[]> {
  if (!fs.existsSync(presentationsDir)) {
    return [];
  }

  const files = fs.readdirSync(presentationsDir);
  const presentations: Presentation[] = [];

  for (const file of files) {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      const filePath = path.join(presentationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const presentation = yaml.load(content) as Presentation;
        presentations.push(presentation);
      } catch (error) {
        console.warn(`Failed to parse presentation file: ${file}`, error);
      }
    }
  }

  return presentations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPresentationById(id: string): Promise<Presentation | null> {
  const presentations = await getAllPresentations();
  return presentations.find(p => p.id === id) || null;
}

export async function getPresentationsByTag(tag: string): Promise<Presentation[]> {
  const presentations = await getAllPresentations();
  return presentations.filter(p => p.tags.includes(tag));
}

export async function getPresentationsByCategory(category: string): Promise<Presentation[]> {
  const presentations = await getAllPresentations();
  return presentations.filter(p => p.category === category);
}

export async function getProfile(): Promise<Profile> {
  const profilePath = path.join(dataDir, 'profile.yaml');
  
  if (!fs.existsSync(profilePath)) {
    // Return default profile if file doesn't exist
    return {
      name: {
        ja: '吉田丈治',
        en: 'YOSHIDA George'
      },
      title: {
        ja: '取締役CIO',
        en: 'Director & CIO'
      },
      company: {
        ja: '株式会社リバネス',
        en: 'Leave a Nest Co., Ltd.'
      },
      bio: {
        ja: '株式会社リバネス取締役CIO、株式会社リバネスナレッジ代表取締役社長。2800以上のプレゼンテーションスライドを管理・公開している。',
        en: 'Director & CIO at Leave a Nest Co., Ltd., and President & CEO of Leave a Nest Knowledge Co., Ltd. Managing and publishing 2800+ presentation slides.'
      },
      avatar: '/images/profile-avatar.jpg',
      social: {
        twitter: 'https://twitter.com/george',
        linkedin: 'https://linkedin.com/in/george',
        website: 'https://lne.st/k'
      }
    };
  }

  const content = fs.readFileSync(profilePath, 'utf8');
  return yaml.load(content) as Profile;
}

export async function getAllTemplates(): Promise<Template[]> {
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  const files = fs.readdirSync(templatesDir);
  const templates: Template[] = [];

  for (const file of files) {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      const filePath = path.join(templatesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const template = yaml.load(content) as Template;
        templates.push(template);
      } catch (error) {
        console.warn(`Failed to parse template file: ${file}`, error);
      }
    }
  }

  return templates;
}

export async function getUniqueCategories(): Promise<string[]> {
  const presentations = await getAllPresentations();
  const categories = new Set(presentations.map(p => p.category));
  return Array.from(categories).sort();
}

export async function getUniqueTags(): Promise<string[]> {
  const presentations = await getAllPresentations();
  const tags = new Set(presentations.flatMap(p => p.tags));
  return Array.from(tags).sort();
}

export function createPresentation(presentation: Omit<Presentation, 'id'>): string {
  const id = `presentation-${Date.now()}`;
  const fullPresentation: Presentation = { ...presentation, id };
  
  const fileName = `${id}.yaml`;
  const filePath = path.join(presentationsDir, fileName);
  
  // Ensure directory exists
  if (!fs.existsSync(presentationsDir)) {
    fs.mkdirSync(presentationsDir, { recursive: true });
  }
  
  const yamlContent = yaml.dump(fullPresentation, { 
    lineWidth: -1,
    noRefs: true 
  });
  
  fs.writeFileSync(filePath, yamlContent, 'utf8');
  return id;
}

export function updatePresentation(id: string, presentation: Presentation): boolean {
  const fileName = `${id}.yaml`;
  const filePath = path.join(presentationsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  const yamlContent = yaml.dump(presentation, { 
    lineWidth: -1,
    noRefs: true 
  });
  
  fs.writeFileSync(filePath, yamlContent, 'utf8');
  return true;
}

export function deletePresentation(id: string): boolean {
  const fileName = `${id}.yaml`;
  const filePath = path.join(presentationsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  fs.unlinkSync(filePath);
  return true;
}