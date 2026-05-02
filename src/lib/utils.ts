import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function parseCharacterMetadata(content: string) {
  const metaMatch = content.match(/<!-- CHARACTER_DATA: (.*?) -->/);
  if (metaMatch && metaMatch[1]) {
    try {
      return JSON.parse(metaMatch[1]);
    } catch (e) {
      console.error('Error parsing character metadata:', e);
      return null;
    }
  }
  return null;
}

export function stripMetadata(content: string) {
  return content.replace(/<!-- CHARACTER_DATA: .*? -->\n?/, '');
}
