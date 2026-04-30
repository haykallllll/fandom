import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage } from '@/src/types';
import WikiEditor from '@/src/components/WikiEditor';
import { slugify } from '@/src/lib/utils';
import { Save, X, Image as ImageIcon, Layout, Tag, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const categories = ['Anime', 'Game', 'Marvel', 'DC', 'Other'] as const;

export default function WikiPageEditor() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!slug;

  const [title, setTitle] = React.useState(searchParams.get('title') || '');
  const [content, setContent] = React.useState('');
  const [category, setCategory] = React.useState<WikiPage['category']>('Other');
  const [imageUrl, setImageUrl] = React.useState('');
  const [summary, setSummary] = React.useState('');
  
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(isEditing);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isEditing) {
      fetchPage();
    }
  }, [isEditing]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category);
      setImageUrl(data.image_url || '');
    } catch (err: any) {
      console.error('Error fetching page:', err);
      setError('Gagal memuat data halaman.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Judul dan isi konten wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Anda harus login untuk mengedit wiki.');

      const pageSlug = slugify(title);
      const pageData = {
        title,
        slug: pageSlug,
        content,
        category,
        image_url: imageUrl || null,
        author_id: session.user.id,
        updated_at: new Date().toISOString()
      };

      let pageId: string;

      if (isEditing) {
        const { data, error: updateError } = await supabase
          .from('pages')
          .update(pageData)
          .eq('slug', slug)
          .select()
          .single();
        
        if (updateError) throw updateError;
        pageId = data.id;
      } else {
        const { data, error: insertError } = await supabase
          .from('pages')
          .insert({ ...pageData, created_at: new Date().toISOString() })
          .select()
          .single();
        
        if (insertError) {
          if (insertError.code === '23505') throw new Error('Judul halaman sudah digunakan.');
          throw insertError;
        }
        pageId = data.id;
      }

      // Create Revision
      const { error: revError } = await supabase
        .from('revisions')
        .insert({
          page_id: pageId,
          content: content,
          edited_by: session.user.id,
          summary: summary || (isEditing ? 'Pembaruan konten' : 'Halaman dibuat'),
          created_at: new Date().toISOString()
        });

      if (revError) throw revError;

      navigate(`/wiki/${pageSlug}`);
    } catch (err: any) {
      console.error('Error saving page:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-20 font-bold text-gray-400">Memuat editor...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-10">
        <div>
          <h1 className="text-4xl font-sans font-extrabold text-slate-900 tracking-tight">
            {isEditing ? `Refining: ${title}` : 'Creating New Knowledge'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Contribute to the collective wisdom of the {category} universe.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200"
          >
            <X size={18} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-200 disabled:opacity-50"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Deploy Page'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-200 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FileText size={14} className="text-indigo-500" /> Page Subject Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Peter Parker"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-3xl font-sans font-extrabold focus:bg-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lore Documentation</label>
              <WikiEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-8 sticky top-24">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} className="text-indigo-500" /> Universe Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "py-3 px-4 rounded-xl text-xs font-bold transition-all border",
                      category === cat 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} className="text-indigo-500" /> Primary Visual Asset URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-200 transition-all font-mono text-slate-600"
              />
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layout size={14} className="text-indigo-500" /> Modification Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Briefly describe your changes..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all min-h-[140px] resize-none text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
