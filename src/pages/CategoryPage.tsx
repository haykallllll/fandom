import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage } from '@/src/types';
import { BookOpen, ChevronRight, TrendingUp, Filter, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function CategoryPage() {
  const { category } = useParams();
  const [pages, setPages] = React.useState<WikiPage[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (category) {
      fetchCategoryPages();
    }
  }, [category]);

  const fetchCategoryPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .ilike('category', category || '')
      .order('updated_at', { ascending: false });

    if (!error) setPages(data || []);
    setLoading(false);
  };

  const displayCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  return (
    <div className="space-y-8 pb-32">
      {/* Category Header */}
      <section className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <nav className="flex text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] gap-2 mb-6">
              <Link to="/" className="hover:text-indigo-600">Multiverse</Link>
              <span>/</span>
              <span className="text-indigo-500">Categories</span>
            </nav>
            <h1 className="text-4xl md:text-7xl font-sans font-extrabold tracking-tight text-slate-900 mb-6">
              {displayCategory} <br/> Universe.
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Synthesizing all documentation, lore, and entity data belonging to the {displayCategory} sector.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="bg-slate-900 text-white px-8 py-6 rounded-3xl shadow-xl w-full md:w-48 text-center">
              <div className="text-4xl font-black tracking-tighter mb-1">{pages.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Pages</div>
            </div>
          </div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 pointer-events-none -z-10" />
      </section>

      {/* Grid Control */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Synchronized Results
        </h2>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Page Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map(page => (
            <Link 
              key={page.id}
              to={`/wiki/${page.slug}`}
              className="group bento-card overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                <img 
                  src={page.image_url || `https://picsum.photos/seed/${page.slug}/800/600`}
                  alt={page.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold group-hover:text-indigo-600 transition-colors tracking-tight">
                    {page.title}
                  </h3>
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-slate-100" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Chronicler Proxy</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <BookOpen size={48} className="text-slate-200 mx-auto mb-6" />
          <p className="text-xl font-bold text-slate-900 mb-2">No Archives Found</p>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            This sector of the multiverse hasn't been documented yet. Be the pioneer to start the {displayCategory} wiki.
          </p>
          <Link 
            to={`/create?category=${displayCategory}`}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Initiate Protocol
          </Link>
        </div>
      )}
    </div>
  );
}
