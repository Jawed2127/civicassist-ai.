import React, { useState, useEffect } from 'react';
import { LoginPage } from './page/LoginPage';
import { RegisterPage } from './page/RegisterPage';
import Navbar from './components/Navbar';
import CitizenPortal from './components/CitizenPortal';
import AdminDashboard from './components/AdminDashboard';
import AIInsightsPanel from './components/AIInsightsPanel';
import CitizenReportModal from './components/CitizenReportModal';
import api from './services/api';

// Helper to reliably check administrative privileges
const checkIsAdmin = (u) => {
  if (!u) return false;
  const role = String(u.role || '').toUpperCase();
  const username = String(u.username || '').toLowerCase();
  return (
    role === 'ADMIN' ||
    u.is_staff === true ||
    u.is_superuser === true ||
    username === 'admin'
  );
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState('login');
  
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      const u = saved ? JSON.parse(saved) : null;
      return checkIsAdmin(u) ? 'admin' : 'citizen';
    } catch {
      return 'citizen';
    }
  });

  const [grievances, setGrievances] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  const isAdmin = checkIsAdmin(user);

  // Fetch grievances and analytics once authenticated
  const loadData = async () => {
    if (!user) return;
    try {
      const gData = await api.getGrievances();
      setGrievances(Array.isArray(gData) ? gData : gData?.results || []);
      setBackendConnected(true);
    } catch (err) {
      console.error('Failed to load grievances:', err);
      setGrievances([]);
      setBackendConnected(false);
    }

    try {
      const aData = await api.getAnalytics();
      setAnalytics(aData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleAuthSuccess = (userData) => {
    const isUserAdmin = checkIsAdmin(userData);
    
    // Normalize role so child components and storage stay consistent
    const normalizedUser = {
      ...userData,
      role: isUserAdmin ? 'ADMIN' : 'CITIZEN',
      is_staff: isUserAdmin,
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    setActiveTab(isUserAdmin ? 'admin' : 'citizen');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthMode('login');
    setGrievances([]);
  };

  // 1. Unauthenticated views
  if (!user) {
    if (authMode === 'register') {
      return (
        <RegisterPage 
          onSwitchToLogin={() => setAuthMode('login')} 
          onRegisterSuccess={handleAuthSuccess} 
        />
      );
    }
    return (
      <LoginPage 
        onLoginSuccess={handleAuthSuccess} 
        onSwitchToRegister={() => setAuthMode('register')} 
      />
    );
  }

  // 2. Authenticated views
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        backendConnected={backendConnected}
      />

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {isAdmin ? (
          activeTab === 'ai-insights' ? (
            <AIInsightsPanel />
          ) : (
            <AdminDashboard 
              user={user}
              grievances={grievances} 
              analytics={analytics} 
              onRefresh={loadData}
              onSelectGrievance={(g) => console.log('Selected:', g)}
            />
          )
        ) : (
          <CitizenPortal 
            user={user}
            grievances={grievances}
            onRefresh={loadData}
            onOpenReportModal={() => setIsReportModalOpen(true)} 
          />
        )}
      </main>

      {isReportModalOpen && (
        <CitizenReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => {
            setIsReportModalOpen(false);
            loadData();
          }} 
        />
      )}
    </div>
  );
}