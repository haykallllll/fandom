import React from 'react';
import { cn } from '@/src/lib/utils';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface WikiTableOfContentsProps {
  items: TOCItem[];
}

export default function WikiTableOfContents({ items }: WikiTableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 my-8 max-w-sm">
      <div className="flex items-center gap-2 mb-4 text-slate-900">
        <List size={18} className="text- indigo-600" />
        <h4 className="text-sm font-black uppercase tracking-widest">Contents</h4>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <a 
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block text-sm transition-all hover:text-indigo-600 border-l-2 py-1 pl-3",
              item.level === 2 
                ? "font-bold text-slate-700 border-slate-200 hover:border-indigo-600" 
                : "font-medium text-slate-500 border-transparent ml-4 text-xs"
            )}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
