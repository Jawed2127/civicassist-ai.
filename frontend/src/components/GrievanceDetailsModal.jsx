import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  UserCheck, 
  ArrowRight,
  ShieldAlert,
  Send,
  Building,
  Calendar,
  Phone,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

export default function GrievanceDetailsModal({ grievance, onClose, onUpdated, isAdminView }) {
  if (!grievance) return null;

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(grievance.status);
  const [adminNote, setAdminNote] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState(grievance.assigned_officer || '');

  const handleUpdateStatus = async (newStatusOverride = null) => {
    const statusToApply = newStatusOverride || selectedStatus;
    setIsUpdating(true);
    try {
      const updated = await api.updateStatus(grievance.id, {
        status: statusToApply,
        note: adminNote || `Status updated to ${statusToApply}`,
        assigned_officer: assignedOfficer,
        author_name: isAdminView ? 'Municipal Admin' : 'Citizen'
      });
      if (onUpdated) onUpdated(updated);
      setAdminNote('');
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30">
                {grievance.ticket_number}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(grievance.status)}`}>
                {grievance.status_display || grievance.status}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getUrgencyBadge(grievance.urgency)}`}>
                {grievance.urgency_display || grievance.urgency}
              </span>
            </div>
            <h2 className="text-lg font-bold mt-2 text-white">{grievance.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Department</span>
              <div className="font-semibold text-sm text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>{grievance.department_details?.name || grievance.category_display || grievance.category}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ward & Location</span>
              <div className="font-semibold text-sm text-slate-800 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{grievance.ward}</span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{grievance.address}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target Resolution SLA</span>
              <div className="font-semibold text-sm text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{grievance.sla_hours} Hours Target</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged: {new Date(grievance.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Citizen Statement</h4>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-sm text-slate-800 leading-relaxed">
              {grievance.description}
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Reported by: <strong>{grievance.citizen_name}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {grievance.citizen_phone}
              </span>
            </div>
          </div>

          {/* AI Analysis Card */}
          {grievance.ai_analysis && (
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-bold text-sm text-emerald-300">CivicAssist AI Analysis Engine</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {Math.round(grievance.ai_analysis.confidence_score * 100)}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400">Urgency Assessment:</span>
                  <p className="text-slate-200 mt-0.5 font-medium">{grievance.urgency_reason || grievance.ai_analysis.summary}</p>
                </div>
                <div>
                  <span className="text-slate-400">Recommended Dispatch Action:</span>
                  <p className="text-slate-200 mt-0.5 font-medium">{grievance.ai_analysis.recommended_action}</p>
                </div>
              </div>

              {grievance.ai_analysis.hazard_tags && grievance.ai_analysis.hazard_tags.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {grievance.ai_analysis.hazard_tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-800 text-emerald-400 border border-slate-700 rounded-md text-[11px] font-semibold">
                      ⚠️ {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lifecycle Audit Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Audit Resolution Timeline</h4>
            <div className="space-y-3 pl-2 border-l-2 border-emerald-200 ml-2">
              {grievance.timeline && grievance.timeline.length > 0 ? (
                grievance.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-5 pb-1">
                    <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100"></div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>{event.title}</span>
                      <span className="text-slate-400 font-normal">
                        {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(event.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{event.note}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">By: {event.author}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic pl-4">No timeline updates recorded yet.</p>
              )}
            </div>
          </div>

          {/* Admin Operations Box */}
          {isAdminView && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Municipal Control Room Actions</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Update Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="TRIAGED">AI Triaged / In Queue</option>
                    <option value="ASSIGNED">Assigned to Field Worker</option>
                    <option value="IN_PROGRESS">In Progress (Field Work)</option>
                    <option value="RESOLVED">Resolved (Completed)</option>
                    <option value="VERIFIED">Verified & Closed</option>
                    <option value="REOPENED">Reopened</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Officer / Contractor</label>
                  <input
                    type="text"
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    placeholder="e.g. Er. S. Patil (Quick Response Team 2)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Status Note / Field Report</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Inspection completed; pothole patched with hot-mix asphalt."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Apply Status Update'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Citizen Verification Actions (if resolved) */}
          {!isAdminView && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-emerald-950">Citizen Resolution Feedback</h5>
                <p className="text-xs text-emerald-800">
                  {grievance.status === 'RESOLVED' 
                    ? "The department has marked this resolved. Please confirm resolution or reopen." 
                    : "Track live status updates here as ward engineers work on this ticket."}
                </p>
              </div>

              {grievance.status === 'RESOLVED' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('VERIFIED')}
                    disabled={isUpdating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Confirm & Close
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('REOPENED')}
                    disabled={isUpdating}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reopen Issue
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
