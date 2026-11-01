import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  PlusCircle, 
  MapPin, 
  Filter, 
  Droplet,
  Zap,
  Trash2,
  TrafficCone,
  HeartPulse,
  HelpCircle,
  X,
  AlertCircle
} from 'lucide-react';
import StatusTimelineStepper from './StatusTimelineStepper';
import api from '../services/api';

export default function CitizenPortal({ 
  grievances = [], 
  onOpenReportModal = () => {}, 
  loading = false,
  user = null
}) {
  const [ticketQuery, setTicketQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  
  // State for tracked ticket modal (opened exclusively via Track Ticket button)
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const safeGrievances = Array.isArray(grievances) ? grievances : [];

  // Track Ticket Button Handler
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = ticketQuery.trim();
    if (!query) return;

    setTrackingError('');

    // 1. Look in local list first
    const localMatch = safeGrievances.find(
      (g) => g.ticket_number?.toLowerCase() === query.toLowerCase() ||
             String(g.id) === query.replace('#', '')
    );

    if (localMatch) {
      setSelectedTicket(localMatch);
      return;
    }

    // 2. Fetch from backend API if not in current view
    setTrackingLoading(true);
    try {
      const result = await api.trackTicket(query);
      if (result) {
        setSelectedTicket(result);
      } else {
        setTrackingError(`No grievance found with ticket number "${query}".`);
      }
    } catch (err) {
      setTrackingError(err.message || `No grievance found with ticket number "${query}".`);
    } finally {
      setTrackingLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ROADS':
        return <TrafficCone className="w-4 h-4 text-amber-500" />;
      case 'SANITATION':
        return <Trash2 className="w-4 h-4 text-emerald-500" />;
      case 'WATER':
      case 'DRAINAGE':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'LIGHTING':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'HEALTH':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'VERIFIED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'ASSIGNED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'TRIAGED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'REOPENED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const filteredGrievances = safeGrievances.filter((g) => {
    if (!g) return false;
    const matchesCategory = filterCategory === 'ALL' || g.category === filterCategory;
    
    const query = searchFilter.toLowerCase().trim();
    const matchesSearch = !query || 
      (g.title && g.title.toLowerCase().includes(query)) ||
      (g.ticket_number && g.ticket_number.toLowerCase().includes(query)) ||
      (g.address && g.address.toLowerCase().includes(query)) ||
      (g.location_text && g.location_text.toLowerCase().includes(query)) ||
      (g.ward && g.ward.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 shadow-xl overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Citizen Resolution Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Fix your neighborhood with the power of <span className="text-emerald-400">CivicAssist AI</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Report potholes, broken street lights, sewage overflows, and civic hazards. 
            Our AI engine instantly triages priority, detects duplicates, and auto-dispatches municipal field crews with SLA guarantees.
          </p>

          {/* Quick Track & Report Row */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
              <Search className="w-5 h-5 text-slate-300 ml-2" />
              <input
                type="text"
                placeholder="Enter Ticket Number (e.g. CIVIC-2026-52CDEF)..."
                value={ticketQuery}
                onChange={(e) => {
                  setTicketQuery(e.target.value);
                  if (trackingError) setTrackingError('');
                }}
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50 shrink-0"
              >
                {trackingLoading ? 'Searching...' : 'Track Ticket'}
              </button>
            </form>

            <button
              onClick={onOpenReportModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Grievance</span>
            </button>
          </div>

          {/* Error Banner */}
          {trackingError && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trackingError}</span>
            </div>
          )}

          {/* Highlights */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block">AI Triage Speed</span>
              <strong className="text-white text-sm">Instant (&lt; 1 sec)</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Urgency Detection</span>
              <strong className="text-emerald-400 text-sm">Hazard-Aware</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Duplicate Clustering</span>
              <strong className="text-white text-sm">Auto-Grouped</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Average SLA Target</span>
              <strong className="text-white text-sm">24 - 48 Hours</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'ALL', label: 'All Issues' },
              { id: 'ROADS', label: 'Roads' },
              { id: 'SANITATION', label: 'Waste' },
              { id: 'WATER', label: 'Water' },
              { id: 'LIGHTING', label: 'Lighting' },
              { id: 'DRAINAGE', label: 'Drainage' },
              { id: 'HEALTH', label: 'Health' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by street, keyword, ward..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Grievances Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Public Civic Grievances Feed</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {filteredGrievances.length} Active
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Fetching civic grievances from database...</p>
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300 space-y-3">
            <p className="text-sm text-slate-500">No grievances found matching the current filter.</p>
            <button
              onClick={onOpenReportModal}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Report the first issue in this category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGrievances.map((g) => (
              <div
                key={g.id || g.ticket_number || Math.random()}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        {getCategoryIcon(g.category)}
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {g.ticket_number || `#${g.id}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getUrgencyBadge(g.urgency)}`}>
                        {g.urgency || 'NORMAL'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(g.status)}`}>
                        {g.status || 'SUBMITTED'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {g.title || 'Untitled Grievance'}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {g.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Hazard tags */}
                  {g.ai_analysis && g.ai_analysis.hazard_tags && g.ai_analysis.hazard_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {g.ai_analysis.hazard_tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Assigned Officer */}
                  {g.assigned_officer && (
                    <div className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                      Assigned: <span className="font-bold text-slate-900">{g.assigned_officer}</span>
                    </div>
                  )}
                </div>

                {/* Footer Info: Ward / Location only */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 truncate w-full">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{g.ward || g.address || g.location_text || 'Ward Not Specified'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Tracking & Lifecycle Audit Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            {/* Clean Light Modal Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {selectedTicket.ticket_number || `#${selectedTicket.id}`}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(selectedTicket.status)}`}>
                  {selectedTicket.status || 'SUBMITTED'}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Stepper */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Resolution Lifecycle Audit Stepper
                </span>
                <StatusTimelineStepper currentStatus={selectedTicket.status || 'SUBMITTED'} />
              </div>

              {/* Ticket Details */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedTicket.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block">{selectedTicket.category || 'General'}</strong>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority / Urgency</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block">{selectedTicket.urgency || 'NORMAL'}</strong>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Municipal Ward</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block truncate">{selectedTicket.ward || 'Central Zone'}</strong>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Officer</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block truncate">
                    {selectedTicket.assigned_officer || 'Pending Assignment'}
                  </strong>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Close Audit View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}