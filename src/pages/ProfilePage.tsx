import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage } from '@/src/types';
import { User, Mail, Calendar, FileText, ExternalLink, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [pages, setPages] = React.useState<WikiPage[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('author_id', session.user.id)
        .order('updated_at', { ascending: false });
      
      if (!error) setPages(data || []);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="animate-pulse py-12">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Profile */}
      <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-[2rem] bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner overflow-hidden border-4 border-white ring-1 ring-slate-100">
           {user.user_metadata.avatar_url ? (
             <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
           ) : (
             <User size={64} />
           )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-sans font-extrabold text-slate-900 tracking-tight mb-2">
            {user.user_metadata.username || user.email?.split('@')[0]}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Mail size={16} className="text-indigo-500" /> {user.email}</span>
            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-indigo-500" /> Joined {format(new Date(user.created_at), 'MMMM yyyy')}</span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Senior Contributor</span>
            <span className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full">{pages.length} Pages Written</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contributions */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 px-2">
             <FileText size={20} className="text-indigo-600" /> My Documentation History
          </h2>
          {pages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pages.map(page => (
                <Link 
                  key={page.id} 
                  to={`/wiki/${page.slug}`}
                  className="bento-card p-6 flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
                      {page.category}
                    </span>
                    <ExternalLink size={14} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">{page.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-auto">Modified {format(new Date(page.updated_at), 'd MMM yyyy')}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
               <p className="text-slate-400">You haven't created any pages yet.</p>
               <Link to="/create" className="text-indigo-600 font-bold hover:underline mt-2 block">Start writing →</Link>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-8">Reputation Points</h3>
             <div className="text-6xl font-black tracking-tighter mb-2">1,240</div>
             <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Top 5% of all time</p>
             <div className="mt-8 pt-8 border-t border-indigo-500/50">
               <div className="flex items-center justify-between text-xs font-bold mb-2">
                 <span>Level 14</span>
                 <span>75% to Level 15</span>
               </div>
               <div className="w-full h-2 bg-indigo-700/50 rounded-full overflow-hidden">
                 <div className="h-full bg-white w-3/4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
