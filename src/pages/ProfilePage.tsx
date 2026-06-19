import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useSessions } from '../lib/sessions';
import { User, Mail, Shield, Building, Clock, Plus, ArrowRight, Play } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { sessions, activeSession, createSession, switchSession, deleteSession, loading } = useSessions();
  const [creating, setCreating] = useState(false);

  const handleCreateSession = async () => {
    setCreating(true);
    await createSession();
    setCreating(false);
  };

  return (
    <div className="flex-1 overflow-auto bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 mb-2">User Profile & Sessions</h1>
          <p className="text-stone-500">Manage your clearance level and War Room environments.</p>
        </div>
        
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-stone-200 bg-stone-900 text-white flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-stone-800 border-4 border-stone-700 flex items-center justify-center text-4xl font-serif">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-serif">{user?.displayName || 'M&A Professional'}</h2>
              <p className="text-stone-400 mt-1 flex items-center gap-2"><Mail size={16} /> {user?.email || 'guest@valence.cap'}</p>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-sm font-bold tracking-widest text-stone-500 uppercase mb-6">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-100 rounded-lg text-stone-600">
                  <User size={20} />
                </div>
                <div>
                  <label className="text-sm text-stone-500 block mb-1">User ID</label>
                  <p className="font-mono text-xs text-stone-900 p-1.5 bg-stone-50 rounded border border-stone-200">
                    {user?.uid || 'guest-session'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-100 rounded-lg text-stone-600">
                  <Shield size={20} />
                </div>
                <div>
                  <label className="text-sm text-stone-500 block mb-1">Clearance Level</label>
                  <p className="text-stone-900 font-medium">Level 5 (Due Diligence Lead)</p>
                </div>
              </div>

               <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-100 rounded-lg text-stone-600">
                  <Building size={20} />
                </div>
                <div>
                  <label className="text-sm text-stone-500 block mb-1">Organization</label>
                  <p className="text-stone-900 font-medium">Valence Capital Group</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">War Room Sessions</h3>
              <p className="text-sm text-stone-500 mt-1">Manage multiple due diligence environments.</p>
            </div>
            <button 
              onClick={handleCreateSession}
              disabled={creating}
              className="bg-stone-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
               <Plus size={16} /> New Session
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-stone-500 text-sm">Loading sessions...</div>
          ) : sessions.length === 0 ? (
             <div className="py-12 bg-stone-50 border border-stone-200 border-dashed rounded-lg text-center text-stone-500 text-sm">
               No active sessions found. Create one to start an audit.
             </div>
          ) : (
             <div className="space-y-4">
               {sessions.map(session => (
                 <div 
                   key={session.id} 
                   className={`p-4 rounded-lg border transition-all relative group ${activeSession?.id === session.id ? 'bg-[#bb6cff]/5 border-[#bb6cff]/30 ring-1 ring-[#bb6cff]/20' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                 >
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="flex items-center gap-2">
                         <h4 className="font-medium text-stone-900">{session.name}</h4>
                         {activeSession?.id === session.id && (
                           <span className="bg-[#bb6cff] text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">Active</span>
                         )}
                       </div>
                       <div className="flex items-center gap-4 mt-1 text-xs text-stone-500">
                         <span className="flex items-center gap-1.5"><Clock size={12} /> Last active: {new Date(session.lastActiveAt).toLocaleString()}</span>
                         <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                       {activeSession?.id !== session.id && (
                         <button 
                           onClick={() => switchSession(session.id)}
                           className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-medium transition-colors"
                         >
                           <Play size={14} /> Resume
                         </button>
                       )}
                       <button
                         onClick={async () => {
                           if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
                             await deleteSession(session.id);
                           }
                         }}
                         className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                       >
                         Delete
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
