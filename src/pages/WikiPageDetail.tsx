import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage, Revision } from '@/src/types';
import WikiContent from '@/src/components/WikiContent';
import { Edit, Clock, MessageSquare, ChevronRight, Share2, History, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function WikiPageDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = React.useState<WikiPage | null>(null);
  const [revisions, setRevisions] = React.useState<Revision[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'content' | 'history' | 'discussion'>('content');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (slug) {
      fetchPageData();
      setActiveTab('content');
    }
  }, [slug]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          setError('Page not found');
        } else {
          throw error;
        }
      } else {
        setPage(data);
        fetchRevisions(data.id);
      }
    } catch (err: any) {
      console.error('Error fetching page:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisions = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('revisions')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRevisions(data || []);
    } catch (err) {
      console.error('Error fetching revisions:', err);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-64 bg-gray-200 rounded-3xl" />
      <div className="h-8 bg-gray-200 w-1/3 rounded" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>;
  }

  if (error === 'Page not found') {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">?</div>
        <h2 className="text-3xl font-display font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Ups! Sepertinya halaman "<strong>{slug}</strong>" belum tersedia.
          Jadilah orang pertama yang mendokumentasikannya!
        </p>
        <Link 
          to={`/create?title=${slug?.replace(/-/g, ' ')}`}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all inline-block"
        >
          Buat Halaman "{slug}"
        </Link>
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight size={14} />
        <Link to={`/category/${page.category.toLowerCase()}`} className="hover:text-indigo-600">{page.category}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">{page.title}</span>
      </nav>

      {/* Header */}
      <div className="relative h-64 md:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl mb-12 group">
        <img 
          src={page.image_url || `https://picsum.photos/seed/${page.slug}/1200/800`} 
          alt={page.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white w-full">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-indigo-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-indigo-900/50">
              {page.category}
            </span>
            <span className="text-white/60 text-xs font-medium">Rank #1 Fan-favorite</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-sans font-extrabold tracking-tight leading-none drop-shadow-sm">{page.title}</h1>
          <div className="flex items-center gap-6 mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            <span className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> Updated {format(new Date(page.updated_at), 'd MMM yyyy', { locale: localeId })}</span>
            <span className="flex items-center gap-2"><History size={14} className="text-indigo-400" /> {revisions.length} Snapshots</span>
          </div>
        </div>
        <div className="absolute top-8 right-8 flex gap-3">
          <Link 
            to={`/wiki/${page.slug}/edit`}
            className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Edit size={18} /> Edit Story
          </Link>
          <button className="bg-white/10 backdrop-blur-md text-white p-3 rounded-xl hover:bg-white/20 transition-all border border-white/10 shadow-xl">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-10 sticky top-20 z-40 max-w-fit">
        <TabButton 
          active={activeTab === 'content'} 
          onClick={() => setActiveTab('content')}
          label="The Article"
        />
        <TabButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
          label="Timeline"
        />
        <TabButton 
          active={activeTab === 'discussion'} 
          onClick={() => setActiveTab('discussion')}
          label="Community"
        />
      </div>

      {/* Tab Content */}
      <div className="pb-20">
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 flex flex-col gap-8">
              <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-sm border border-slate-200 min-h-[600px]">
                <nav className="flex text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-2 mb-8">
                  <span>Databases</span>
                  <span>/</span>
                  <span>{page.category}</span>
                  <span>/</span>
                  <span className="text-indigo-500 font-extrabold">{page.title}</span>
                </nav>
                <WikiContent html={page.content} />
                
                <div className="mt-16 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">Join the Lore Chat</div>
                      <div className="text-xs text-slate-500">24 messages today</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('discussion')} className="text-xs font-bold text-indigo-600 hover:underline tracking-widest uppercase">View All Discussions →</button>
                </div>
              </div>
            </div>
            
            {/* Infobox Sidebar */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Character Info</h3>
                <div className="grid gap-6">
                  <div>
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Affiliation</div>
                    <div className="text-sm font-bold text-slate-900">{page.category} Alliance</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                      <div className="text-xs font-bold text-green-600">Legendary</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Origin</div>
                      <div className="text-xs font-bold text-slate-800">Earth-616</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Recent Contributors</div>
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src={`https://i.pravatar.cc/50?u=${i}`} alt="user" /></div>)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-3xl p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold tracking-widest uppercase">Editor Stats</h4>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="text-3xl font-extrabold tracking-tighter mb-1">94%</div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Global Accuracy Score</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {revisions.map((rev, idx) => (
                <div key={rev.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs",
                      idx === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    )}>
                      v{revisions.length - idx}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{rev.summary || 'Suntingan tanpa ringkasan'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Oleh <span className="text-blue-600 font-medium">Pengguna Wiki</span> • {format(new Date(rev.created_at), 'd MMM yyyy, HH:mm', { locale: localeId })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg">Pratinjau</button>
                    {idx > 0 && <button className="p-2 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-lg">Rollback</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-gray-400">Belum Ada Diskusi</h3>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto">
              Berikan pendapat atau saranmu mengenai konten halaman ini untuk membantu perkembangan wiki.
            </p>
            <button className="mt-8 bg-gray-100 text-gray-600 px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-all">
              Mulai Diskusi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon?: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
        active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
      {label}
    </button>
  );
}

function ShieldCheck({ size, className }: { size?: number, className?: string }) {
  return <AlertCircle size={size} className={className} />; // Placeholder as ShieldCheck is not in lucide imports I usually use, but actually it is.
}
