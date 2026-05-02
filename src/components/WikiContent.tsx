import React from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '@/src/lib/utils';

interface WikiContentProps {
  html: string;
}

export default function WikiContent({ html }: WikiContentProps) {
  // 1. Process Headers: == Header == -> <h2>, === Header === -> <h3>
  let processedHtml = html
    .replace(/^==\s*(.+?)\s*==\s*$/gm, '<h2 id="$1" class="wiki-section">$1</h2>')
    .replace(/^===\s*(.+?)\s*===\s*$/gm, '<h3 id="$1" class="wiki-section">$1</h3>');

  // 2. Process Internal Links: [[Page Name]] or [[Page Name|Display Text]]
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  
  processedHtml = processedHtml.replace(wikiLinkRegex, (match, pageName, displayText) => {
    const label = displayText || pageName;
    const slug = slugify(pageName.trim());
    return `<a href="/wiki/${slug}" class="text-indigo-600 font-bold hover:underline" data-wiki-link="true">${label}</a>`;
  });

  // 3. Process line breaks to paragraphs if it's not already HTML
  if (!processedHtml.includes('<p>') && !processedHtml.includes('<div')) {
    processedHtml = processedHtml
      .split('\n\n')
      .map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br/>')}</p>` : '')
      .join('\n');
  }

  return (
    <div 
      className="prose prose-slate prose-indigo max-w-none 
        prose-headings:font-sans prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
        prose-h2:text-3xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:mt-12
        prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
        prose-a:no-underline hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
      onClick={(e) => {
        // Handle internal links using React Router if needed, 
        // though for now simple anchors in a dangerouslySetInnerHTML is tricky 
        // without a custom renderer or global listener.
      }}
    />
  );
}
