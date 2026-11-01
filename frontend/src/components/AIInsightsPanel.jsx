import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Target
} from 'lucide-react';
import { api } from '../services/api';

export default function AIInsightsPanel({ grievances }) {
  const [testText, setTestText] = useState(
    'Two wheeler fell into open manhole on 5th main road during evening rush hour. Sewage overflowing and children crossing.'
  );
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunSimulator = async () => {
    setIsLoading(true);
    try {
      const res = await api.previewAITriage({
        title: 'Simulator Test Issue',
        description: testText,
        address: '5th Main Road Central',
        latitude: 19.0760,
        longitude: 72.8777
      });
      setTestResult(res);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Civic Intelligence Engine 2.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Triage & Duplicate Resolution Engine
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            See under the hood: Natural Language Processing (NLP) extracts safety hazards, scores citizen sentiment, groups geographic duplicates, and forecasts resolution times.
          </p>
        </div>
      </div>

      {/* Simulator Sandbox */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Interactive AI Triage Sandbox</span>
          </h3>
          <span className="text-xs text-slate-400">Test any hypothetical complaint in real time</span>
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
            placeholder="Type any complaint, e.g., 'Live wire sparking near park entrance' or 'Pipe burst flooding street'..."
          />

          <div className="flex justify-end">
            <button
              onClick={handleRunSimulator}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all"
            >
              {isLoading ? (
                <span>Simulating Triage...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute AI Triage Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simulator Results */}
        {testResult && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-purple-200 mt-4 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Analysis Breakdown</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Confidence: {Math.round(testResult.confidence_score * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Detected Category</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">{testResult.detected_category}</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Urgency Priority</span>
                <div className="text-base font-bold text-red-600 mt-0.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{testResult.urgency} ({Math.round(testResult.urgency_score * 100)}%)</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Resolution SLA Target</span>
                <div className="text-base font-bold text-emerald-600 mt-0.5">{testResult.estimated_sla_hours} Hours</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-700">Urgency Assessment Rationale:</span>
              <p className="text-slate-600">{testResult.urgency_reason}</p>
            </div>

            {testResult.hazard_tags && testResult.hazard_tags.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Detected Safety Hazards:</span>
                <div className="flex flex-wrap gap-1.5">
                  {testResult.hazard_tags.map((tag, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
                      ⚠️ {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Duplicate Clustering Explanation & Active Grievances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>How Duplicate Detection Works</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            When multiple citizens report the same civic failure (such as a water main break or broken traffic light), 
            CivicAssist AI runs two simultaneous checks:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
            <li><strong>Geospatial Proximity:</strong> Haversine distance calculates whether the new report is within 250m of an open ticket in the same category.</li>
            <li><strong>Semantic Token Overlap:</strong> Jaccard token similarity measures lexical overlap in descriptions to detect identical occurrences.</li>
            <li><strong>Clustering Benefit:</strong> Prevents dispatching multiple crews to the same spot, and auto-notifies all linked citizens simultaneously upon repair!</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>SLA Resolution Matrix</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-red-50 text-red-900 font-semibold border border-red-200">
              <span>Critical Emergency (Live Wire, Gas Leak, Sinkhole)</span>
              <span>6 Hours</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 text-amber-900 font-semibold border border-amber-200">
              <span>High Priority (Arterial Road Pothole, Burst Pipe)</span>
              <span>18 - 24 Hours</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 text-blue-900 font-semibold border border-blue-200">
              <span>Medium Priority (Garbage Clearance, Street Light)</span>
              <span>24 - 48 Hours</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-slate-800 font-semibold border border-slate-200">
              <span>Low Priority (Signage, Tree Pruning, Minor Repair)</span>
              <span>72 Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
