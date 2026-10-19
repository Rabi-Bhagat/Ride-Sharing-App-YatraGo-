import React from 'react';
import GroupChat from '../components/GroupChat';
import { MessageSquare, ShieldCheck, User } from 'lucide-react';

export default function GroupChatPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="text-cyan-400" />
              <span>Real-Time Socket Group Chat</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Live Socket.io Room
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Communication workspace for co-riders, driver, and assigned local guider with verified profile badges.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <GroupChat onClose={() => {}} />
      </div>

    </div>
  );
}
