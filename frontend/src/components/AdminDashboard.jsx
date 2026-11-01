import React, { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  Filter, 
  Search, 
  Sparkles, 
  ArrowUpRight,
  UserCheck,
  MapPin,
  Flame,
  Layers,
  ChevronRight
} from 'lucide-react';
import AdminDispatchModal from './AdminDispatchModal';

export default function AdminDashboard({ 
  grievances = [], 
  analytics = null, 
  onSelectGrievance = () => {}, 
  onRefresh = () => {} 
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalGrievance, setModalGrievance] = useState(null);

  // Always enforce array safety
  const safeGrievances = Array.isArray(grievances) ? grievances : [];

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
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

  const filtered = safeGrievances.filter((g) => {
    if (!g) return false;
    const matchStatus = statusFilter === 'ALL' || g.status === statusFilter;
    const matchUrgency = urgencyFilter === 'ALL' || g.urgency === urgencyFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      (g.title && g.title.toLowerCase().includes(query)) ||
      (g.ticket_number && g.ticket_number.toLowerCase().includes(query)) ||
      (g.ward && g.ward.toLowerCase().includes(query)) ||
      (g.citizen_name && g.citizen_name.toLowerCase().includes(query)) ||
      (g.location_text && g.location_text.toLowerCase().includes(query));

    return matchStatus && matchUrgency && matchQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-500 tracking-tight">Municipal Command Center</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time public grievance triage, field dispatch monitoring, and SLA management.
          </p>
        </div>
                <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Sync Database
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Grievances */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Complaints</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{analytics?.total_grievances ?? safeGrievances.length}</span>
            <span className="text-xs text-slate-500 font-medium">Logged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all municipal wards</p>
        </div>

        {/* Critical Hazards (Alert) */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-100 uppercase tracking-wider">Critical Hazards</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{analytics?.critical_open_count ?? 0}</span>
            <span className="text-xs text-red-100 font-medium">Open P1 Tickets</span>
          </div>
          <p className="text-[11px] text-red-100 mt-1">Immediate life/safety response needed</p>
        </div>

        {/* In Progress / Active */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress Work</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-indigo-600">{analytics?.in_progress_count ?? 0}</span>
            <span className="text-xs text-slate-500 font-medium">Field Dispatches</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Assigned to engineers on site</p>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600">{analytics?.resolution_rate_percent ?? 0}%</span>
            <span className="text-xs text-slate-500 font-medium">Verified Solved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Avg SLA: {analytics?.avg_sla_hours ?? 36}h target</p>
        </div>
      </div>

      {/* Ward & Category Operational Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category Workload</h4>
          <div className="space-y-2.5">
            {analytics?.category_breakdown && analytics.category_breakdown.length > 0 ? (
              analytics.category_breakdown.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{c.category}</span>
                    <span>{c.count} complaints</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (c.count / (analytics.total_grievances || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Loading category stats...</p>
            )}
          </div>
        </div>

        {/* Ward Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">High Activity Municipal Wards</h4>
          <div className="space-y-2.5">
            {analytics?.ward_breakdown && analytics.ward_breakdown.length > 0 ? (
              analytics.ward_breakdown.map((w, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate max-w-[200px]">{w.ward}</span>
                    <span>{w.count} tickets</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (w.count / (analytics.total_grievances || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Loading ward distribution...</p>
            )}
          </div>
        </div>

        {/* AI Health & Automated Actions */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Operations Status</span>
            </div>
            <h5 className="font-bold text-base mt-2 text-white">Automated Triage Active</h5>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Every newly submitted ticket is automatically parsed for urgency keywords, hazard tags, duplicate radius checks, and assigned to the correct ward department.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">AI Precision</span>
              <strong className="text-emerald-400 font-mono text-sm">96.8%</strong>
            </div>
            <div>
              <span className="text-slate-400 block">SLA Breaches</span>
              <strong className="text-white font-mono text-sm">0 Today</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Triage Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters Header with Emerald Select Boxes */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="TRIAGED">AI Triaged</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Issue Title & Ward</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Urgency / AI Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-medium">
                    No grievances found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr 
                    key={g.id || g.ticket_number || Math.random()}
                    onClick={() => setModalGrievance(g)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {g.ticket_number || `#${g.id}`}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{g.title || 'Untitled Grievance'}</div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{g.ward || g.location_text || 'Unassigned Ward'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{g.category_display || g.category || 'General'}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${getUrgencyBadge(g.urgency)}`}>
                          {g.urgency || 'NORMAL'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {g.urgency_score !== undefined && g.urgency_score !== null 
                            ? `${Math.round(Number(g.urgency_score) * 100)}%` 
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getStatusBadge(g.status)}`}>
                        {g.status_display || g.status || 'SUBMITTED'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4  whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalGrievance(g);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      >
                        Manage & Dispatch
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Dispatch & Status Transition Modal */}
      <AdminDispatchModal
        isOpen={!!modalGrievance}
        grievance={modalGrievance}
        onClose={() => setModalGrievance(null)}
        onUpdated={() => {
          setModalGrievance(null);
          onRefresh();
        }}
      />
    </div>
  );
}