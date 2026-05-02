import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { WikiPage, Revision } from '@/src/types';
import WikiContent from '@/src/components/WikiContent';
import WikiInfobox from '@/src/components/WikiInfobox';
import WikiTableOfContents from '@/src/components/WikiTableOfContents';
import { Edit, Clock, MessageSquare, ChevronRight, Share2, History, Trash2, Home } from 'lucide-react';
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
  const [toc, setToc] = React.useState<{ id: string, text: string, level: number }[]>([]);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
  }, []);

  React.useEffect(() => {
    if (slug) {
      fetchPageData();
      setActiveTab('content');
    }
  }, [slug]);

  React.useEffect(() => {
    // Global listener for internal wiki links rendered in dangerouslySetInnerHTML
    const handleWikiLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-wiki-link="true"]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) navigate(href);
      }
    };

    document.addEventListener('click', handleWikiLinkClick);
    return () => document.removeEventListener('click', handleWikiLinkClick);
  }, [navigate]);

  React.useEffect(() => {
    if (page?.content && activeTab === 'content') {
      const timer = setTimeout(() => {
        const headings = Array.from(document.querySelectorAll('.prose .wiki-section'));
        const tocItems = headings.map((h, i) => {
          const text = h.textContent || '';
          const id = h.id || `section-${i}`;
          h.id = id; // Ensure ID is set
          return { id, text, level: parseInt(h.tagName.substring(1)) };
        });
        setToc(tocItems);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [page, activeTab]);

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
        // Parse metadata from content
        const contentStr = data.content || '';
        const metaMatch = contentStr.match(/<!-- CHARACTER_DATA: (.*?) -->/);
        let character = null;
        let cleanContent = contentStr;
        
        if (metaMatch && metaMatch[1]) {
          try {
            character = JSON.parse(metaMatch[1]);
            cleanContent = contentStr.replace(/<!-- CHARACTER_DATA: .*? -->\n?/, '');
          } catch (e) {
            console.error('Error parsing character metadata:', e);
          }
        }
        
        setPage({
          ...data,
          content: cleanContent,
          character: character
        });
        fetchRevisions(data.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = async () => {
    if (!page || !currentUser) return;

    const isAuthor = currentUser.id === page.author_id;
    if (!isAuthor) {
      alert('Only the owner can delete this lore.');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete revisions first
      await supabase.from('revisions').delete().eq('page_id', page.id);
      
      // Delete the page
      const { error: deleteError } = await supabase
        .from('pages')
        .delete()
        .match({ id: page.id });

      if (deleteError) throw deleteError;

      alert('Page successfully deleted.');
      navigate('/', { replace: true });
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchRevisions = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('revisions')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });
      
      if (!error) setRevisions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div className="h-16 bg-slate-200 rounded-2xl w-2/3" />
            <div className="h-64 bg-slate-100 rounded-3xl w-full" />
            <div className="space-y-4">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
          <div className="w-full md:w-[320px] h-[500px] bg-slate-100 rounded-2xl shrink-0" />
        </div>
      </div>
    );
  }

  if (error === 'Page not found' || !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl font-black">!</div>
        <h2 className="text-4xl font-sans font-black mb-4 text-slate-900 tracking-tight uppercase italic underline decoration-red-500 decoration-8 underline-offset-8">Page Not Found</h2>
        <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The records for "<strong>{slug}</strong>" are missing from our archives. Maybe this entity hasn't been documented yet?
        </p>
        <Link 
          to={`/create?title=${slug?.replace(/-/g, ' ')}`}
          className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black shadow-xl hover:bg-indigo-700 transition-all hover:-translate-y-1 active:translate-y-0"
        >
          Begin New Lore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 space-y-8">
      {/* Article Header and Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 pb-2 border-b-4 border-slate-900 mb-8">
        <div className="flex flex-col">
          <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            <Link to="/" className="hover:text-indigo-600 flex items-center gap-1"><Home size={10}/> Chronicler</Link>
            <ChevronRight size={10} />
            <Link to={`/category/${page.category.toLowerCase()}`} className="hover:text-indigo-600">{page.category}</Link>
            <ChevronRight size={10} />
            <span className="text-slate-900">{page.title}</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tighter text-slate-900 leading-tight">
            {page.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to={`/wiki/${page.slug}/edit`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Edit size={18} /> Edit Article
          </Link>
          <button className="bg-slate-100 text-slate-600 p-3 rounded-xl hover:bg-slate-200 transition-all">
            <Share2 size={20} />
          </button>
          {currentUser?.id === page.author_id && (
            <button 
              onClick={() => { if(window.confirm('Delete this lore?')) handleDelete() }}
              disabled={isDeleting}
              className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-all"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Wiki Layout: Two Columns */}
      <div className="flex flex-col md:flex-row gap-12 items-start">
        
        {/* Left Side: Article Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            {/* Quick Summary / Intro */}
            <div className="text-xl text-slate-500 italic font-medium leading-relaxed mb-12 border-l-4 border-indigo-500 pl-6">
              An article about <strong>{page.title}</strong> in the {page.category} Universe.
            </div>

            {/* Table of Contents */}
            <WikiTableOfContents items={toc} />

            {/* Main Article Body */}
            <WikiContent html={page.content} />

            {/* Article Footer Metadata */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> Updated {format(new Date(page.updated_at), 'd MMM yyyy', { locale: localeId })}</span>
                <span className="flex items-center gap-2"><History size={14} className="text-indigo-400" /> {revisions.length} Revisions</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                 <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 underline">W</div>
                 <span className="text-[10px] font-black uppercase tracking-tight text-slate-500">Chronicler Wiki Engine Alpha</span>
              </div>
            </div>
          </div>

          {/* Discussion Snippet */}
          <section className="mt-12 bg-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <MessageSquare size={120} />
            </div>
            <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl font-black italic tracking-tighter mb-4">Lore Community Discussion</h3>
              <p className="text-indigo-200 mb-8 leading-relaxed">
                Join {revisions.length + 5} other chroniclers discussing theories about {page.title} and their place in the multiverse.
              </p>
              <button className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                <MessageSquare size={18} /> Enter Chamber
              </button>
            </div>
          </section>
        </main>

        {/* Right Side: Information Box */}
        {page.character && (
           <WikiInfobox character={page.character} category={page.category} />
        )}

      </div>
    </div>
  );
}


