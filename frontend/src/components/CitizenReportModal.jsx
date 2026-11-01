import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building, 
  Info,
  Mic,
  Copy,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_TEMPLATES = [
  {
    label: '⚡ Live Sparking Wire',
    title: 'High voltage wire hanging low and sparking',
    description: 'Broken electric wire hanging near playground after strong winds. Children frequent this area and sparks are flying.',
    category: 'LIGHTING',
    ward: 'Ward 7 - West Coast',
    address: 'Near Sunshine Playground, 4th Cross'
  },
  {
    label: '🕳️ Hazardous Pothole',
    title: 'Deep crater pothole in middle of highway lane',
    description: 'Heavy rain created a 2ft wide deep pothole near the flyover ramp. Vehicles braking abruptly causing near collisions.',
    category: 'ROADS',
    ward: 'Ward 12 - Metro North',
    address: 'Western Express Flyover North Ramp'
  },
  {
    label: '🚰 Burst Water Pipe',
    title: 'Clean water pipeline burst, flooding market street',
    description: 'Municipal drinking water line leaking vigorously for past 4 hours. Water reaching shop doorsteps.',
    category: 'WATER',
    ward: 'Ward 8 - Central Commercial',
    address: 'Shop No. 12, Central Avenue Market'
  },
  {
    label: '🗑️ Garbage Dump Overflow',
    title: 'Community garbage dumpster overflowing onto street',
    description: 'Vats have not been cleared for 3 days. Stray cattle and dogs scattering waste across road.',
    category: 'SANITATION',
    ward: 'Ward 4 - Metro South',
    address: 'Sector 3 Community Center Gate'
  }
];

export default function CitizenReportModal({ isOpen, onClose, onGrievanceCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    citizen_name: '',
    citizen_phone: '',
    citizen_email: '',
    address: '',
    ward: 'Ward 12 - Metro North',
    latitude: 19.0760,
    longitude: 72.8777,
    image_url: ''
  });

  const [aiPreview, setAiPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auto-run AI Triage preview after typing pauses
  useEffect(() => {
    if (!formData.title && !formData.description) {
      setAiPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (formData.title.length > 5 || formData.description.length > 10) {
        setIsAnalyzing(true);
        try {
          const res = await api.previewAITriage({
            title: formData.title,
            description: formData.description,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
          });
          setAiPreview(res);
          if (res.detected_category && formData.category === 'OTHER') {
            setFormData(prev => ({ ...prev, category: res.detected_category }));
          }
        } catch (err) {
          console.error("AI preview error:", err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.address]);

  if (!isOpen) return null;

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            address: prev.address || 'Detected via GPS (Lat: ' + pos.coords.latitude.toFixed(4) + ', Lon: ' + pos.coords.longitude.toFixed(4) + ')'
          }));
        },
        () => {
          setFormData(prev => ({
            ...prev,
            address: 'Downtown Metro Junction (Default Location)',
            latitude: 19.0760,
            longitude: 72.8777
          }));
        }
      );
    }
  };

  const handleApplyTemplate = (tpl) => {
    setFormData(prev => ({
      ...prev,
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      ward: tpl.ward,
      address: tpl.address,
      citizen_name: prev.citizen_name || 'Rahul Sharma',
      citizen_phone: prev.citizen_phone || '+91 98200 12345',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.citizen_name || !formData.citizen_phone) {
      alert("Please fill in Title, Your Name, and Contact Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createGrievance(formData);
      setSubmittedTicket(created);
      if (onGrievanceCreated) onGrievanceCreated(created);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (submittedTicket?.ticket_number) {
      navigator.clipboard.writeText(submittedTicket.ticket_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setAiPreview(null);
    setFormData({
      title: '',
      description: '',
      category: 'OTHER',
      citizen_name: '',
      citizen_phone: '',
      citizen_email: '',
      address: '',
      ward: 'Ward 12 - Metro North',
      latitude: 19.0760,
      longitude: 72.8777,
      image_url: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Report a Civic Grievance</h2>
              <p className="text-xs text-slate-300">AI auto-prioritization, duplicate checking & department routing</p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedTicket ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Grievance Registered Successfully!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                CivicAssist AI has analyzed and routed your complaint to the relevant municipal department.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Tracking Ticket Number</div>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-2xl font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  {submittedTicket.ticket_number}
                </span>
                <button
                  onClick={handleCopyTicket}
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Copy Ticket"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-emerald-600 font-medium">Copied to clipboard!</p>}

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 text-left">
                <div>
                  <span className="text-slate-500">Urgency Level:</span>
                  <div className="font-bold text-slate-800">{submittedTicket.urgency_display || submittedTicket.urgency}</div>
                </div>
                <div>
                  <span className="text-slate-500">Target SLA:</span>
                  <div className="font-bold text-slate-800">{submittedTicket.sla_hours} Hours</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={handleResetAndClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md transition-colors"
              >
                Track in Citizen Portal
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Quick Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Fill Real-World Issues</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium transition-all"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issue Summary / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Deep pothole causing accidents near metro station"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                {isAnalyzing && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium animate-pulse">
                    <Sparkles className="w-3 h-3" /> AI analyzing context...
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what happened, any immediate dangers (fire, live wire, flooding, accidents), and specific landmarks..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Real-Time AI Triage Feedback Box */}
            {aiPreview && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                aiPreview.urgency === 'CRITICAL' 
                  ? 'bg-red-50/80 border-red-300 text-red-950' 
                  : aiPreview.urgency === 'HIGH' 
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950' 
                    : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Triage Forecast:</span>
                    <span className="font-bold underline decoration-current">
                      {aiPreview.detected_category} ({aiPreview.urgency} Priority)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/70 font-mono text-[11px] font-bold border">
                    SLA: {aiPreview.estimated_sla_hours}h
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed opacity-90">
                  {aiPreview.urgency_reason}
                </p>

                {aiPreview.hazard_tags && aiPreview.hazard_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {aiPreview.hazard_tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/80 border text-slate-800">
                        ⚠️ {tag}
                      </span>
                    ))}
                  </div>
                )}

                {aiPreview.duplicate_candidates && aiPreview.duplicate_candidates.length > 0 && (
                  <div className="bg-amber-100/70 border border-amber-300 p-2 rounded-lg text-amber-900 text-[11px]">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Potential Duplicate Match Detected:
                    </div>
                    <div>
                      Ticket #{aiPreview.duplicate_candidates[0].ticket_number} - "{aiPreview.duplicate_candidates[0].title}" ({aiPreview.duplicate_candidates[0].reasons.join(', ')})
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category & Ward Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="ROADS">Roads & Potholes</option>
                  <option value="SANITATION">Garbage & Solid Waste</option>
                  <option value="WATER">Water Supply & Leakage</option>
                  <option value="DRAINAGE">Drainage & Sewage Overflow</option>
                  <option value="LIGHTING">Street Lighting & Electrical</option>
                  <option value="HEALTH">Public Health & Stray Animals</option>
                  <option value="OTHER">Other General Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Municipal Ward / Zone
                </label>
                <select
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Ward 12 - Metro North">Ward 12 - Metro North</option>
                  <option value="Ward 7 - West Coast">Ward 7 - West Coast</option>
                  <option value="Ward 4 - Metro South">Ward 4 - Metro South</option>
                  <option value="Ward 8 - Central Commercial">Ward 8 - Central Commercial</option>
                  <option value="Ward 5 - East Suburb">Ward 5 - East Suburb</option>
                  <option value="Ward 3 - South Central">Ward 3 - South Central</option>
                </select>
              </div>
            </div>

            {/* Address & GPS */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Location / Street Landmark
                </label>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" /> Auto-Detect GPS
                </button>
              </div>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., Near St. Mary High School, 5th Avenue Junction"
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Citizen Details */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Citizen Contact</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    value={formData.citizen_name}
                    onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number (for SMS updates) *"
                    value={formData.citizen_phone}
                    onChange={(e) => setFormData({ ...formData, citizen_phone: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Routing Grievance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Grievance</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
