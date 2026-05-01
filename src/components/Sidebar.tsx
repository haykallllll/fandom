import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Hash, History, User, Heart, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const categories = [
  { name: 'Anime', color: 'bg-orange-500' },
  { name: 'Gaming', color: 'bg-blue-500' },
  { name: 'Marvel', color: 'bg-red-600' },
  { name: 'DC', color: 'bg-blue-800' },
  { name: 'Other', color: 'bg-slate-500' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Compass, label: 'Multiverse', path: '/explore' },
    { icon: History, label: 'Recent Pulse', path: '/recent' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-slate-200 z-50 transition-transform lg:translate-x-0 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 space-y-8">
          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Navigation</h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive(item.path) 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/category/${cat.name.toLowerCase()}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                    {cat.name}
                  </div>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">NEW</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Community</h3>
            <div className="space-y-1">
              <Link to="/about" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                <ShieldCheck size={18} />
                Guidelines
              </Link>
              <Link to="/help" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                <Settings size={18} />
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] font-bold text-slate-900 truncate uppercase tracking-tight">Active Contributor</div>
              <div className="text-[9px] text-slate-400">Editor Rank #122</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
