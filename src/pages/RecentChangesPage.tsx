import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Revision } from '@/src/types';
import { History, Clock, User, ArrowRight, Activity, Filter, RefreshCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';

interface ExtendedRevision extends Revision {
  pages: {
    title: string;
    slug: string;
    category: string;
  };
}

export default function RecentChangesPage() {
  const [revisions, setRevisions] = React.useState<ExtendedRevision[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('revisions')
        .select(`
          *,
          pages (
            title,
            slug,
            category
          )
        `)
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) throw error;
      setRevisions(data as any || []);
    } catch (err) {
      console.error('Error fetching revisions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header section */}
      <section className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Pulse Monitoring</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight mb-4">
            Recent Activity.
          </h1>
          <p className="text-indigo-100/70 text-lg font-medium max-w-xl leading-relaxed">
            Track every edit, addition, and refinement across the entire multiverse in real-time.
          </p>
        </div>
        
        {/* Background elements */}
        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none rotate-45">
          <History size={500} strokeWidth={0.5} />
        </div>
      </section>

      {/* Control Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} /> Latest Snapshots
          </h2>
        </div>
        <button 
          onClick={fetchRevisions}
          className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Pulse
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading && revisions.length === 0 ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : revisions.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {revisions.map((rev) => (
              <div key={rev.id} className="p-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <History size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/wiki/${rev.pages.slug}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight">
                        {rev.pages.title}
                      </Link>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded uppercase tracking-widest whitespace-nowrap">
                        {rev.pages.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 italic max-w-lg line-clamp-1 mb-2">
                      “{rev.summary || 'Minor refinements to lore documentation.'}”
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><User size={12} className="text-indigo-400" /> Anonymous Chronicler</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-400" /> {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true, locale: localeId })}</span>
                    </div>
                  </div>
                </div>
                
                <Link 
                  to={`/wiki/${rev.pages.slug}`}
                  className="self-end md:self-center flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105"
                >
                  Inspect Changes <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-32 text-center">
             <Clock size={48} className="text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-bold">No recent snapshots found.</p>
             <p className="text-slate-400 text-sm mt-1">Activity will appear here as the multiverse grows.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] bg-slate-200/50 px-6 py-2 rounded-full">
          Historical data synchronized with Supabase Real-time
        </p>
      </div>
    </div>
  );
}
