import React, { useState } from 'react';
import { useActivities, addActivity, ActivityLog } from '../lib/activities';
import { useAuth, useAuthAction } from '../lib/auth';
import { FileText, ShieldAlert, DollarSign, Key, Plus, RefreshCw, MessageSquare, Clock, Filter, Lock } from 'lucide-react';

const CATEGORY_STYLES = {
  auth: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: Key },
  ingestion: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: FileText },
  valuation: { bg: 'bg-[#bb6cff]/10 border-[#bb6cff]/20 text-[#bb6cff]', icon: DollarSign },
  risk: { bg: 'bg-red-50 border-red-200 text-red-600', icon: ShieldAlert },
  manual: { bg: 'bg-amber-50 border-amber-200 text-amber-700', icon: MessageSquare }
};

export const ActivityFeed: React.FC = () => {
  const { activities, loading } = useActivities(30);
  const { user } = useAuth();
  const withAuth = useAuthAction();
  const [commentText, setCommentText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'ingestion' | 'valuation' | 'risk' | 'manual'>('all');
  const [posting, setPosting] = useState(false);

  const formatRelativeTime = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const mins = Math.floor(elapsed / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPosting(true);
    try {
      await addActivity('manual', 'Manual Audit Note Added', commentText.trim());
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (activeFilter === 'all') return true;
    return act.category === activeFilter;
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col h-full overflow-hidden" id="activity-feed-panel">
      {/* Feed Header */}
      <div className="p-5 border-b border-stone-100 flex flex-col items-start gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold tracking-tight text-stone-950 flex items-center gap-2">
             M&A Due Diligence Audit Trail
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-medium">Real-time chronicle of all system and analyst actions</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'ingestion', 'valuation', 'risk', 'manual'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-2.5 py-1 rounded text-xs font-medium border capitalize select-none transition-all ${
                activeFilter === cat
                  ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Comment Form */}
      <div className="p-4 border-b border-stone-100 bg-stone-50">
        <form onSubmit={withAuth(handleAddComment)} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={user ? "Write a manual audit note (e.g. 'CFO confirmed ASC-606 treatment')..." : "🔑 Sign in to leave manual audit notes..."}
            className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white"
            onClick={!user ? withAuth(() => {}) : undefined}
          />
          {user ? (
            <button
              type="submit"
              disabled={posting}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} /> Post
            </button>
          ) : (
            <button
              type="button"
              onClick={withAuth(() => {})}
              className="px-3 py-2 bg-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-300 transition-colors flex items-center gap-1.5"
            >
              <Lock size={14} /> Commit
            </button>
          )}
        </form>
      </div>

      {/* Timeline Section */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 relative max-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400 gap-2">
            <RefreshCw size={24} className="animate-spin" />
            <span className="text-xs">Streaming audit trail...</span>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm italic">
            No events match the selected category filter.
          </div>
        ) : (
          <div className="relative border-l-2 border-stone-200 ml-4 pl-6 space-y-6">
            {filteredActivities.map((act) => {
              const style = CATEGORY_STYLES[act.category] || CATEGORY_STYLES.manual;
              const IconComp = style.icon;

              return (
                <div key={act.id} className="relative group/item">
                  {/* Timeline bubble icon */}
                  <div className={`absolute -left-[37px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm ${style.bg}`}>
                    <IconComp size={12} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-sm font-medium text-stone-900 leading-tight">
                        {act.action}
                      </h4>
                      <span className="text-xs text-stone-400 flex items-center gap-1 flex-shrink-0">
                        <Clock size={12} /> {formatRelativeTime(act.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                      {act.details}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                        {act.category}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        by {act.userEmail || 'anonymous'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
