import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CitizenPortal from './components/CitizenPortal';
import AdminDashboard from './components/AdminDashboard';
import AIInsightsPanel from './components/AIInsightsPanel';
import CitizenReportModal from './components/CitizenReportModal';
import GrievanceDetailsModal from './components/GrievanceDetailsModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('citizen');
  const [grievances, setGrievances] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [grievanceList, stats] = await Promise.all([
        api.getGrievances(),
        api.getAnalytics().catch(() => null),
      ]);
      setGrievances(grievanceList || []);
      setAnalytics(stats);
      setBackendConnected(true);
    } catch (err) {
      console.warn("Could not connect to Django API, will retry:", err);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSearchTicket = async (ticketNumber) => {
    try {
      setLoading(true);
      const ticket = await api.trackTicket(ticketNumber);
      setSelectedGrievance(ticket);
    } catch (err) {
      alert(`No grievance found with ticket number "${ticketNumber}". Please verify and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGrievanceCreated = (newGrievance) => {
    setGrievances(prev => [newGrievance, ...prev]);
    fetchData();
  };

  const handleGrievanceUpdated = (updatedGrievance) => {
    setSelectedGrievance(updatedGrievance);
    setGrievances(prev => prev.map(g => g.id === updatedGrievance.id ? updatedGrievance : g));
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        backendConnected={backendConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'citizen' && (
          <CitizenPortal 
            grievances={grievances}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSelectGrievance={(g) => setSelectedGrievance(g)}
            onSearchTicket={handleSearchTicket}
            loading={loading}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard 
            grievances={grievances}
            analytics={analytics}
            onSelectGrievance={(g) => setSelectedGrievance(g)}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'ai-insights' && (
          <AIInsightsPanel 
            grievances={grievances}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>CivicAssist AI</strong> — Intelligent Public Grievance Management System
          </div>
          <div>
            Built with React 18, Django 5, PostgreSQL & AI Triage Engine
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onGrievanceCreated={handleGrievanceCreated}
      />

      <GrievanceDetailsModal
        grievance={selectedGrievance}
        onClose={() => setSelectedGrievance(null)}
        onUpdated={handleGrievanceUpdated}
        isAdminView={activeTab === 'admin'}
      />
    </div>
  );
}
