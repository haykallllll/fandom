import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage } from '@/src/types';
import { Search, Filter, TrendingUp, Grid, List as ListIcon, ChevronRight, BookOpen } from 'lucide-react';
import { cn, parseCharacterMetadata } from '@/src/lib/utils';

const categories = ['Anime', 'Gaming', 'Marvel', 'DC', 'Other'];

export default function ExplorePage() {
  const [pages, setPages] = React.useState<WikiPage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    console.log('Explore: Fetching all pages...');
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const processedPages = (data || []).map(p => ({
        ...p,
        character: parseCharacterMetadata(p.content || '')
      }));
      
      console.log('Explore: Pages fetched:', processedPages.length);
      setPages(processedPages);
    } catch (err) {
      console.error('Explore: Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         page.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? page.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-32">
      {/* Search & Filter Header */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight mb-6 leading-tight">
              Explore the <br/> Multiverse.
            </h1>
            <p className="text-slate-400 text-lg mb-10 font-medium">
              Browse through thousands of entries across anime, gaming, and fictional universes.
            </p>
          </div>

          <div className="relative max-w-xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by title or universe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder:text-slate-500 font-medium"
            />
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
          <BookOpen size={400} strokeWidth={1} />
        </div>
      </section>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 px-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              selectedCategory === null 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            All Universes
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                selectedCategory === cat 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white shadow-sm border border-slate-200 text-indigo-600" : "text-slate-400")}
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white shadow-sm border border-slate-200 text-indigo-600" : "text-slate-400")}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-slate-200 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : filteredPages.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
        )}>
          {filteredPages.map(page => (
            <Link 
              key={page.id}
              to={`/wiki/${page.slug}`}
              className={cn(
                "group bento-card overflow-hidden flex",
                viewMode === 'grid' ? "flex-col" : "flex-row h-32"
              )}
            >
              <div className={cn(
                "relative overflow-hidden bg-slate-100 flex-shrink-0",
                viewMode === 'grid' ? "h-48" : "w-48 h-full"
              )}>
                <img 
                  src={page.image_url || `https://picsum.photos/seed/${page.slug}/800/600`}
                  alt={page.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-sm">
                    {page.category}
                  </span>
                </div>
              </div>
              
              <div className={cn(
                "p-6 flex-1 flex flex-col justify-center",
                viewMode === 'list' && "py-2"
              )}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className={cn(
                    "font-bold group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1",
                    viewMode === 'grid' ? "text-xl" : "text-lg"
                  )}>
                    {page.title}
                  </h3>
                  {viewMode === 'list' && <TrendingUp size={16} className="text-emerald-500" />}
                </div>
                
                {page.character?.alias && (
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">"{page.character.alias}"</p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-slate-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${page.author_id}`} alt="avatar" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Chronicler Lore</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Last Sync: {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
          <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-lg mb-2">No documents match your search.</p>
          <p className="text-slate-400 text-sm">Try using different keywords or filter by another universe.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory(null);}}
            className="mt-6 text-indigo-600 font-extrabold text-sm uppercase tracking-widest hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
