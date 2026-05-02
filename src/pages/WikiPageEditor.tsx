import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage } from '@/src/types';
import WikiEditor from '@/src/components/WikiEditor';
import { slugify } from '@/src/lib/utils';
import { Save, X, Image as ImageIcon, Layout, Tag, FileText, AlertCircle, User, Info, Wand2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { CharacterInfo } from '@/src/types';

const categories = ['Anime', 'Gaming', 'Marvel', 'DC', 'Other'] as const;

const CHARACTER_TEMPLATE = `
<h2>Overview</h2>
<p>Write a brief overview of the character here...</p>

<h2>History</h2>
<p>Detail the character's background and past events...</p>

<h2>Personality</h2>
<p>Describe the character's traits, motivations, and behavior...</p>

<h2>Abilities</h2>
<ul>
  <li><strong>Ability 1:</strong> Description...</li>
  <li><strong>Ability 2:</strong> Description...</li>
</ul>

<h2>Gallery</h2>
<p>Insert character images and concept art here...</p>
`;

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
  
  const [pageType, setPageType] = React.useState<'Standard' | 'Character'>('Standard');
  const [isInfoboxUploading, setIsInfoboxUploading] = React.useState(false);
  const [isBannerUploading, setIsBannerUploading] = React.useState(false);
  const portraitInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  
  const [infobox, setInfobox] = React.useState<CharacterInfo>({
    name: '',
    alias: '',
    gender: '',
    age: '',
    origin: '',
    affiliation: '',
    image_url: ''
  });
  
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
      setCategory(data.category);
      setImageUrl(data.image_url || '');
      
      // Parse content for hidden metadata
      const contentStr = data.content || '';
      const metaMatch = contentStr.match(/<!-- CHARACTER_DATA: (.*?) -->/);
      
      if (metaMatch && metaMatch[1]) {
        try {
          const charData = JSON.parse(metaMatch[1]);
          setInfobox(charData);
          setPageType('Character');
          // Update content state without the metadata block for editing
          setContent(contentStr.replace(/<!-- CHARACTER_DATA: .*? -->\n?/, ''));
        } catch (e) {
          console.error('Error parsing character metadata:', e);
          setContent(contentStr);
        }
      } else {
        setContent(contentStr);
        setPageType('Standard');
      }
    } catch (err: any) {
      console.error('Error fetching page:', err);
      setError('Gagal memuat data halaman.');
    } finally {
      setFetching(false);
    }
  };

  const applyTemplate = () => {
    if (window.confirm('This will replace your current content with the Character Template. Continue?')) {
      setContent(CHARACTER_TEMPLATE);
      setPageType('Character');
      setInfobox(prev => ({ ...prev, name: title }));
    }
  };

  const handleInfoboxChange = (field: keyof CharacterInfo, value: string) => {
    setInfobox(prev => ({ ...prev, [field]: value }));
  };

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting portrait upload:', file.name, file.size, file.type);

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Max 5MB allowed.');
      return;
    }

    setIsInfoboxUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `portrait-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `portraits/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase Storage Error:', uploadError);
        throw new Error(uploadError.message);
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      console.log('Public URL generated:', publicUrl);
      
      handleInfoboxChange('image_url', publicUrl);
    } catch (err: any) {
      console.error('Upload failed, falling back to local preview:', err);
      // Fallback to local preview so user can at least see it before saving (though Base64 is huge)
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          handleInfoboxChange('image_url', result);
        }
      };
      reader.readAsDataURL(file);
      setError(`Gagal upload ke storage: ${err.message}. Menggunakan preview lokal.`);
    } finally {
      setIsInfoboxUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting banner upload:', file.name);

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsBannerUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      console.log('Banner Public URL:', publicUrl);
      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Banner upload failed:', err);
      setError(`Gagal upload banner: ${err.message}`);
    } finally {
      setIsBannerUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to save page:', title);

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
      
      // 1. Prepare Content (Embed metadata if Character Type)
      let finalContent = content;
      if (pageType === 'Character') {
        const charData = {
          name: infobox.name || title,
          alias: infobox.alias,
          gender: infobox.gender,
          age: infobox.age,
          origin: infobox.origin,
          affiliation: infobox.affiliation,
          image_url: infobox.image_url
        };
        console.log('Embedding character metadata:', charData);
        finalContent = `<!-- CHARACTER_DATA: ${JSON.stringify(charData)} -->\n${content}`;
      }

      // 2. Handle Page Data
      const pageData = {
        title,
        slug: pageSlug,
        content: finalContent,
        category,
        image_url: imageUrl || (pageType === 'Character' ? infobox.image_url : null),
        author_id: session.user.id,
        updated_at: new Date().toISOString()
      };

      console.log('Sending data to Supabase (pages table):', pageData);

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
        console.log('Page updated successfully, ID:', pageId);
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
        console.log('Page created successfully, ID:', pageId);
      }

      // Create Revision
      console.log('Creating revision for page:', pageId);
      const { error: revError } = await supabase
        .from('revisions')
        .insert({
          page_id: pageId,
          content: content,
          edited_by: session.user.id,
          summary: summary || (isEditing ? 'Pembaruan konten' : 'Halaman dibuat'),
          created_at: new Date().toISOString()
        });

      if (revError) console.warn('Revision failed to save (non-critical):', revError);

      navigate(`/wiki/${pageSlug}`);
    } catch (err: any) {
      console.error('Error saving page:', err);
      setError(`Gagal menyimpan: ${err.message}`);
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
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-grow max-w-xl">
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
              
              {!isEditing && (
                <button
                  type="button"
                  onClick={applyTemplate}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all border border-indigo-100 group"
                >
                  <Wand2 size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Use Character Template</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lore Documentation</label>
              <WikiEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Infobox Editor */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Character Infobox</h3>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Metadata Panel</p>
              </div>
              <div className="ml-auto">
                <select 
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value as any)}
                  className="bg-slate-800 text-[10px] font-bold text-slate-300 border-none rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Standard">Standard</option>
                  <option value="Character">Character</option>
                </select>
              </div>
            </div>
            
            <div className={cn("p-8 space-y-6 transition-all", pageType === 'Standard' && "opacity-40 pointer-events-none grayscale")}>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  Portrait Image
                  {isInfoboxUploading && <span className="text-indigo-600 animate-pulse lowercase italic">Uploading...</span>}
                </label>
                
                <div 
                  onClick={() => portraitInputRef.current?.click()}
                  className="relative group cursor-pointer aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden hover:border-indigo-400 transition-all flex items-center justify-center p-2"
                >
                  {infobox.image_url ? (
                    <>
                      <img src={infobox.image_url} alt="Portrait" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Change Portrait</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                       <ImageIcon size={32} className="mx-auto text-slate-300" />
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight px-4">Click to upload<br/>character image</p>
                    </div>
                  )}
                  {isInfoboxUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={portraitInputRef} 
                  onChange={handlePortraitUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {[
                { label: 'Full Name', field: 'name' as const },
                { label: 'Alias', field: 'alias' as const },
                { label: 'Gender', field: 'gender' as const },
                { label: 'Age', field: 'age' as const },
                { label: 'Origin', field: 'origin' as const },
                { label: 'Affiliation', field: 'affiliation' as const },
              ].map((item) => (
                <div key={item.field} className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</label>
                  <input
                    type="text"
                    value={infobox[item.field] || ''}
                    onChange={(e) => handleInfoboxChange(item.field, e.target.value)}
                    placeholder={`Enter ${item.label.toLowerCase()}...`}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2 px-4 text-sm outline-none focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                  />
                </div>
              ))}
            </div>
            
            {pageType === 'Standard' && (
              <div className="p-8 pt-0 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle "Character" type to enable Infobox</p>
              </div>
            )}
          </div>

          {/* Universe & Settings */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} className="text-indigo-500" /> Header Banner Image
              </label>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="relative group cursor-pointer aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden hover:border-indigo-400 transition-all flex items-center justify-center"
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Change Banner</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon size={32} className="mx-auto text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Header Image</p>
                  </div>
                )}
                {isBannerUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={bannerInputRef} 
                onChange={handleBannerUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

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

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layout size={14} className="text-indigo-500" /> Revision Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ex: Added history section and ability list."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all min-h-[120px] resize-none text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
