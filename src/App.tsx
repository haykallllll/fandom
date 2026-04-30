import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import WikiPageDetail from './pages/WikiPageDetail';
import WikiPageEditor from './pages/WikiPageEditor';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import RecentChangesPage from './pages/RecentChangesPage';
import CategoryPage from './pages/CategoryPage';
import { supabase } from './lib/supabase';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex flex-1">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-5xl mx-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/recent" element={<RecentChangesPage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/about" element={<div className="py-20 text-center"><h1 className="text-4xl font-extrabold mb-4">Guidelines</h1><p className="text-slate-500">Coming soon.</p></div>} />
                <Route path="/help" element={<div className="py-20 text-center"><h1 className="text-4xl font-extrabold mb-4">Settings</h1><p className="text-slate-500">Coming soon.</p></div>} />
                <Route path="/wiki/:slug" element={<WikiPageDetail />} />
                <Route 
                  path="/create" 
                  element={session ? <WikiPageEditor /> : <Navigate to="/auth" />} 
                />
                <Route 
                  path="/wiki/:slug/edit" 
                  element={session ? <WikiPageEditor /> : <Navigate to="/auth" />} 
                />
                <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" />} />
                <Route 
                  path="/profile" 
                  element={session ? <ProfilePage /> : <Navigate to="/auth" />} 
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}
