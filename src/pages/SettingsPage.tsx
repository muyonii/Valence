import React from 'react';
import { useAuth } from '../lib/auth';
import { Bell, Lock, Key, Globe, EyeOff, LayoutTemplate } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">System Settings</h1>
        
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          
          <div className="p-8 border-b border-stone-100">
            <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-stone-500" /> Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-stone-700">Email alerts for High-Risk findings</span>
                 <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-nobel-gold rounded border-stone-300 focus:ring-nobel-gold" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-stone-700">Daily synthesis digest</span>
                 <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-nobel-gold rounded border-stone-300 focus:ring-nobel-gold" />
              </label>
            </div>
          </div>

          <div className="p-8 border-b border-stone-100">
            <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center gap-2">
              <EyeOff size={20} className="text-stone-500" /> VDR Privacy
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-stone-700">Auto-redact PII during ingestion</span>
                 <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-nobel-gold rounded border-stone-300 focus:ring-nobel-gold" />
              </label>
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-stone-700">Audit logging</span>
                 <input type="checkbox" defaultChecked disabled className="form-checkbox h-5 w-5 text-stone-400 rounded border-stone-300 opacity-50" />
              </label>
              <p className="text-xs text-stone-500 mt-2">Audit logging is mandatory for compliance.</p>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center gap-2">
              <LayoutTemplate size={20} className="text-stone-500" /> Interface
            </h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm text-stone-700 mb-2">Default War Room View</label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-stone-300 focus:outline-none focus:ring-nobel-gold focus:border-nobel-gold sm:text-sm rounded-md border text-stone-700">
                    <option>Dashboard</option>
                    <option>Executive Brief</option>
                    <option>Workstreams</option>
                  </select>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
