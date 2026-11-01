import React from 'react';
import { 
  Building2, 
  Sparkles, 
  PlusCircle, 
  LayoutDashboard, 
  UserCheck, 
  Cpu,
  LogOut
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  onOpenReportModal, 
  backendConnected 
}) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'citizen')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">CivicAssist</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {isAdmin ? 'Administrative Oversight & Operations' : 'Public Grievance Portal'}
              </p>
            </div>
          </div>

          {/* Role-Based Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {/* Citizen Only Tabs */}
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('citizen')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                                <UserCheck className="w-4 h-4" />
                <span>My Grievances</span>
              </button>
            )}

            {/* Admin Only Tabs */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'admin'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai-insights')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'ai-insights'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span className="hidden md:inline">AI Triage & Duplicates</span>
                  <span className="md:hidden">AI</span>
                </button>
              </>
            )}
          </nav>

          {/* Action, User Info & Logout */}
          <div className="flex items-center space-x-3">
            {/* Backend status indicator */}
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{backendConnected ? 'API Online' : 'Offline'}</span>
            </div>

            {/* Citizens can directly open Report Issue Modal */}
            {!isAdmin && (
              <button
                onClick={onOpenReportModal}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Report Issue</span>
              </button>
            )}

            {/* User Badge & Sign Out Button */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <span className="text-xs text-slate-300 hidden sm:inline">
                {user?.username} ({isAdmin ? 'Admin' : 'Citizen'})
              </span>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="flex items-center space-x-1 bg-red-600/80 hover:bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}