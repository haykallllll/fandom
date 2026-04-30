import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, User, LogOut, Menu } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-50 rounded-md transition-colors">
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold shadow-sm">W</div>
          <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">FandomWiki</span>
        </Link>
      </div>

      <div className="flex-grow max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search pages, characters, items..." 
            className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to="/create" 
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-all text-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:block">New Page</span>
        </Link>
        
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <Link to="/profile" className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-transparent hover:ring-indigo-200 transition-all">
              <img src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" />
            </Link>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/auth" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
