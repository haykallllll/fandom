import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage } from '@/src/types';
import { User, Mail, Calendar, FileText, ExternalLink, LogOut, Edit3, Camera, Save, X, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [pages, setPages] = React.useState<WikiPage[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url || '');
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
      
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      
      // Validation
      if (!file.type.match('image.*')) {
        alert('Please select an image file (jpg, png, webp)');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Max 2MB allowed.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Preview locally
      setPreviewUrl(URL.createObjectURL(file));

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updates = {
        id: user.id,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      
      await fetchProfile(user.id);
      setIsEditing(false);
      setPreviewUrl(null);
      alert('Identity updated securely!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Archives...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-12 pb-32">
      {/* Header Profile Section */}
      <section className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-slate-100 transition-all">
        {!isEditing ? (
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="relative group">
              <div className="w-48 h-48 rounded-[3rem] bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner overflow-hidden border-4 border-white ring-8 ring-slate-50/50">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={96} />
                )}
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white"
              >
                <Edit3 size={20} />
              </button>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                <h1 className="text-5xl font-sans font-black text-slate-900 tracking-tighter leading-none">
                  {profile?.username || user.user_metadata.username || user.email?.split('@')[0]}
                </h1>
                <span className="lg:ml-2">
                  <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-100">
                    Grand Chronicler
                  </span>
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm text-slate-500 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 opacity-60"><Mail size={16} className="text-indigo-500" /> {user.email}</span>
                <span className="flex items-center gap-2 opacity-60"><Calendar size={16} className="text-indigo-500" /> Joined {format(new Date(user.created_at), 'MMMM yyyy')}</span>
              </div>

              <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-12">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{pages.length}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Archives Written</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter">1.2k</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Influence Score</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter">99+</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Edits Made</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-red-100 transition-all border-2 border-red-100/50 shadow-sm"
              >
                <LogOut size={20} /> Terminate Session
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="max-w-3xl mx-auto py-2">
            <div className="flex items-center gap-4 mb-12">
               <div className="h-10 w-2 bg-indigo-600 rounded-full" />
               <h2 className="text-4xl font-sans font-black text-slate-900 tracking-tight">Identity Modification</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-16 items-start">
              {/* Avatar Upload */}
              <div className="relative group mx-auto md:mx-0">
                <div className="w-56 h-56 rounded-[3.5rem] bg-slate-50 flex items-center justify-center text-slate-200 overflow-hidden border-4 border-white ring-8 ring-slate-100 relative shadow-inner">
                  {(previewUrl || avatarUrl) ? (
                    <img src={previewUrl || avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={80} />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={40} />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-5 rounded-3xl shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-white ring-4 ring-indigo-50">
                  <Camera size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>

              {/* Form Fields */}
              <div className="flex-1 w-full space-y-8">
                <div className="group">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block group-focus-within:text-indigo-600 transition-colors">Chronicler Alias</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 font-black text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all outline-none text-lg shadow-sm"
                    placeholder="Enter your public name..."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">Primary Uplink Node (Email)</label>
                  <div className="bg-slate-100 border-2 border-slate-200 rounded-3xl p-5 font-black text-slate-400 opacity-50 cursor-not-allowed text-lg italic">
                    {user.email}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
                  >
                    <Save size={20} /> Update Master File
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewUrl(null);
                      setUsername(profile?.username || '');
                    }}
                    className="px-10 bg-white text-slate-400 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50 transition-all hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Contributions */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-3xl font-sans font-black text-slate-900 tracking-tight flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                 <FileText size={20} />
               </div>
               Archives Found
            </h2>
            <div className="h-px flex-1 mx-8 bg-slate-100" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{pages.length} DATASETS</span>
          </div>

          {pages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {pages.map(page => (
                <Link 
                  key={page.id} 
                  to={`/wiki/${page.slug}`}
                  className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-12px_rgba(99,102,241,0.1)] hover:border-indigo-100 transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border border-indigo-100/50">
                        {page.category}
                      </span>
                      <ExternalLink size={16} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-4 leading-tight tracking-tight">{page.title}</h3>
                    <div className="mt-auto pt-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50">
                      <Clock size={14} className="text-indigo-400" /> SYNCED {format(new Date(page.updated_at), 'd MMM yyyy')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-[3rem] p-24 text-center border-4 border-dashed border-slate-100 relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl text-slate-100 group-hover:text-indigo-100 transition-colors">
                    <FileText size={40} />
                 </div>
                 <p className="text-slate-500 font-black text-xl mb-6">No localized archives detected.</p>
                 <Link to="/create" className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 inline-block hover:-translate-y-1 active:translate-y-0">
                   Generate First Sequence
                 </Link>
               </div>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                 <FileText size={300} />
              </div>
              <div className="relative z-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-10">CORE SYNC STATUS</h3>
                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">KNOWLEDGE LEVEL</span>
                      <span className="text-4xl font-black text-white italic tracking-tighter">LV. 14</span>
                    </div>
                    <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1">
                      <div className="h-full bg-indigo-500 w-3/4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.8)]"></div>
                    </div>
                  </div>
                  <div className="pt-10 border-t border-white/5 grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">ACCESS</div>
                      <div className="text-2xl font-black italic tracking-tight">ELEVATED</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">CLEARANCE</div>
                      <div className="text-2xl font-black italic tracking-tight">OMEGA</div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
           
           <div className="bg-indigo-600 rounded-[3rem] p-10 text-white text-center shadow-2xl shadow-indigo-100 group hover:-translate-y-2 transition-all">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-6">Archive Global Impact</p>
              <div className="text-5xl font-black italic tracking-tighter mb-4">PLATINUM</div>
              <div className="text-[10px] font-bold text-white/60">TOP 1% OF ALL CHRONICLERS</div>
           </div>
        </div>
      </div>
    </div>
  );
}
