import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-32 text-center">
      <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
        <AlertTriangle size={48} />
      </div>
      
      <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">
        404 <span className="text-indigo-600">Lost in Space</span>
      </h1>
      
      <p className="text-slate-500 text-xl mb-12 max-w-lg mx-auto leading-relaxed">
        The coordinates <code className="bg-slate-100 px-2 py-1 rounded text-red-500 text-sm font-bold">{location.pathname}</code> do not exist in our multiverse archives.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          to="/" 
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 hover:-translate-y-1"
        >
          <Home size={20} /> Return to Home
        </Link>
        <Link 
          to="/explore" 
          className="bg-white text-slate-600 px-10 py-4 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <Search size={20} /> Explore Archives
        </Link>
      </div>
    </div>
  );
}
