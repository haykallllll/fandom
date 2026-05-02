import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage } from '@/src/types';
import { Book, Zap, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { parseCharacterMetadata } from '@/src/lib/utils';

export default function Home() {
  const [pages, setPages] = React.useState<WikiPage[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      console.log('Home: Fetching recent pages...');
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      
      const processedPages = (data || []).map(p => ({
        ...p,
        character: parseCharacterMetadata(p.content || '')
      }));
      
      console.log('Home: Pages fetched and processed:', processedPages.length);
      setPages(processedPages);
    } catch (err) {
      console.error('Home: Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <section className="bg-slate-900 rounded-[2rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Featured</span>
            <span className="text-slate-400 text-xs font-medium">Updated live</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-sans font-extrabold mb-6 leading-[1.1] tracking-tight">
            Knowledge is <br/> Collaborative.
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg">
            Join the decentralized encyclopedia for fictional universes. 
            Document your favorite characters, items, and lore in a modern Bento interface.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/create" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0">
              Start Contribution
            </Link>
            <Link to="/explore" className="bg-white/10 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all">
              Jelajahi Universe
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 opacity-20 pointer-events-none rotate-12">
          <Book size={600} strokeWidth={0.5} />
        </div>
      </section>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 font-bold text-xl shadow-inner">
              <Zap size={24} />
            </div>
            <h3 className="font-sans font-extrabold text-2xl mb-3 tracking-tight text-slate-900">Real-time Editing</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Collaborate with thousands of editors worldwide to build the most comprehensive database.</p>
          </div>
          <div className="mt-8 flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="avatar" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">+2k</div>
          </div>
        </div>
        
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white flex flex-col justify-between">
          <TrendingUp size={32} />
          <div>
            <h3 className="font-extrabold text-xl mb-1 mt-4">Trending</h3>
            <p className="text-indigo-200 text-xs">Marvel Universe is growing fast today.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <Clock className="text-slate-400" size={32} />
          <div>
            <h3 className="font-extrabold text-xl mb-1 text-slate-800">History</h3>
            <p className="text-slate-400 text-xs">Full version control included.</p>
          </div>
        </div>
      </div>

      {/* Article Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-indigo-600 rounded-full" />
            Recently Documented
          </h2>
          <Link to="/explore" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Browse All →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : pages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Link 
                key={page.id} 
                to={`/wiki/${page.slug}`}
                className="group bento-card overflow-hidden flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all"
              >
                <div className="h-48 bg-slate-100 overflow-hidden relative">
                  <img 
                    src={page.image_url || `https://picsum.photos/seed/${page.slug}/800/600`} 
                    alt={page.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-sm">
                      {page.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1">
                    {page.title}
                  </h3>
                  {page.character?.alias && (
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3">"{page.character.alias}"</p>
                  )}
                  <div className="flex items-center gap-2 mb-4 mt-1">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${page.author_id}`} alt="avatar" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Editor Lore</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all font-bold">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <Book size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-1">No pages found yet.</p>
            <Link to="/create" className="text-indigo-600 font-bold hover:underline">Be the first to contribute!</Link>
          </div>
        )}
      </section>
    </div>
  );
}


