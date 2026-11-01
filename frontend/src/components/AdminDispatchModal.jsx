import React, { useState, useEffect } from 'react';
import { X, Send, UserCheck, AlertCircle } from 'lucide-react';
import StatusTimelineStepper from './StatusTimelineStepper';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: '1. Submitted (Pending Review)' },
  { value: 'TRIAGED', label: '2. Triaged by AI' },
  { value: 'ASSIGNED', label: '3. Assign Field Officer' },
  { value: 'IN_PROGRESS', label: '4. In Progress (Dispatched)' },
  { value: 'RESOLVED', label: '5. Resolved & Verified' },
];

export default function AdminDispatchModal({ grievance, isOpen, onClose, onUpdated }) {
  if (!isOpen || !grievance) return null;

  const [status, setStatus] = useState(grievance.status || 'SUBMITTED');
  const [officer, setOfficer] = useState(grievance.assigned_officer || grievance.assigned_to || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Re-sync fields when a different grievance is selected
  useEffect(() => {
    if (grievance) {
      setStatus(grievance.status || 'SUBMITTED');
      setOfficer(grievance.assigned_officer || grievance.assigned_to || '');
      setError('');
    }
  }, [grievance]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send both assigned_officer and assigned_to to match whatever Django model uses
      await api.updateGrievanceStatus(grievance.id, {
        status,
        assigned_officer: officer.trim(),
        assigned_to: officer.trim(),
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update ticket status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {grievance.ticket_number || `#${grievance.id}`}
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-sm">Dispatch & SLA Triage</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{grievance.ward || 'Municipal Ward'}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="p-6 space-y-5">
          {/* Progress Timeline Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Live Progress Stepper</span>
            <StatusTimelineStepper currentStatus={status} />
          </div>

          {/* Issue Details Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-900 text-sm">{grievance.title}</div>
            <p className="text-slate-600 leading-relaxed">{grievance.description}</p>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-500">
              <div>Citizen: <strong className="text-slate-800">{grievance.citizen_name || 'Anonymous'}</strong></div>
              <div>Contact: <strong className="text-slate-800">{grievance.citizen_phone || 'N/A'}</strong></div>
            </div>
          </div>

          {/* Status & Officer Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Transition Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                Assign Field Officer
              </label>
              <input
                type="text"
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                placeholder="e.g. Officer R. K. Patil (Zone 4)"
                className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Updating...' : 'Save & Dispatch Crew'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}