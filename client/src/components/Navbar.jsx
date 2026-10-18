import React from 'react';
import { Sparkles, History, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  historyCount = 0
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm sm:text-base">
                AI Photo Restorer
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                Student Project
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('enhance')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'enhance'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Enhance Photo
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 rounded-full border border-slate-700">
                {historyCount}
              </span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* User Account */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">
                {user.name}
              </span>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login / Signup</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
