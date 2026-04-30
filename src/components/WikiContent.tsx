import React from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '@/src/lib/utils';

interface WikiContentProps {
  html: string;
}

export default function WikiContent({ html }: WikiContentProps) {
  // Regex to find [[Page Name]] or [[Page Name|Display Text]]
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

  // We need to carefully replace these in the HTML without breaking actual HTML tags
  // A safer way is to split by tags and only replace in text nodes, 
  // but for a simple implementation, we'll try a regex replacement that avoids inside tags
  
  const processedHtml = html.replace(wikiLinkRegex, (match, pageName, displayText) => {
    const label = displayText || pageName;
    const slug = slugify(pageName);
    // We return a placeholder that we will replace with actual React components later 
    // or just use a standard anchor and catch clicks.
    // However, since we want to use React Router, we'll use a special class and handle it.
    return `<a href="/wiki/${slug}" class="wiki-link" data-wiki-page="${pageName}">${label}</a>`;
  });

  return (
    <div 
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
