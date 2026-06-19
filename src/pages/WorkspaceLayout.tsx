import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileArchive, Briefcase, Calculator, FileText, Menu, X, User as UserIcon, Settings, LogOut, ChevronUp } from 'lucide-react';
import { useAuth } from '../lib/auth';

const WorkspaceLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'VDR Ingestion', path: '/workspace/ingestion', icon: FileArchive },
    { name: 'Deal Dashboard', path: '/workspace/dashboard', icon: LayoutDashboard },
    { name: 'Workstreams', path: '/workspace/workstreams', icon: Briefcase },
    { name: 'Valuation Engine', path: '/workspace/valuation', icon: Calculator },
    { name: 'Executive Brief', path: '/workspace/brief', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex font-sans">
      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 z-50 px-4 flex items-center justify-between">
         <Link to="/" className="flex items-center gap-2 group text-stone-700 hover:text-stone-900 transition-colors">
            <span className="font-serif font-bold text-lg tracking-wide">
              VALENCE
            </span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-stone-600">
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 ease-in-out flex flex-col ${mobileMenuOpen ? 'translate-x-0 pt-16' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 hidden md:flex items-center">
          <Link to="/" className="flex items-center group text-stone-700 hover:text-stone-900 transition-colors">
            <span className="font-serif font-bold text-xl tracking-wide">
              VALENCE
            </span>
          </Link>
        </div>


        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 px-3 mt-4 md:mt-0">Modules</div>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#bb6cff]/10 text-[#bb6cff]' 
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-200 relative" ref={dropdownRef}>
          {user ? (
            <>
              {profileDropdownOpen && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-50">
                   <Link 
                      to="/workspace/profile" 
                      onClick={() => { setProfileDropdownOpen(false); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <UserIcon size={16} /> Profile
                   </Link>
                   <Link 
                      to="/workspace/settings" 
                      onClick={() => { setProfileDropdownOpen(false); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Settings size={16} /> Settings
                   </Link>
                   <div className="border-t border-stone-100"></div>
                   <button 
                      onClick={() => { logout(); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                   >
                      <LogOut size={16} /> Log Out
                   </button>
                </div>
              )}

              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-between w-full p-2 rounded-md hover:bg-stone-100 transition-colors"
              >
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-white font-serif text-sm uppercase">
                     {user.displayName ? user.displayName.charAt(0) : (user.email ? user.email.charAt(0) : 'U')}
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-medium text-stone-900 truncate max-w-[120px]">
                        {user.displayName || user.email || 'User'}
                      </p>
                   </div>
                 </div>
                 <ChevronUp size={16} className={`text-stone-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </>
          ) : (
            <Link 
              to="/auth"
              className="flex items-center justify-center w-full py-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 pt-16 md:pt-0">
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceLayout;
