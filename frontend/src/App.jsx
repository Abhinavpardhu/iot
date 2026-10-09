import React, { useState } from 'react';
import { HomeProvider, useHome } from './context/HomeContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import DemoModeBanner from './components/layout/DemoModeBanner';
import ToastContainer from './components/layout/ToastContainer';

// Pages
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import SensorsPage from './pages/SensorsPage';
import RoomsPage from './pages/RoomsPage';
import AutomationPage from './pages/AutomationPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import DocsPage from './pages/DocsPage';

import { Loader2, Radio } from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoading } = useHome();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'devices':
        return <DevicesPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'automation':
        return <AutomationPage />;
      case 'activity':
        return <ActivityPage />;
      case 'settings':
        return <SettingsPage />;
      case 'docs':
        return <DocsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-cyan-400 gap-4 p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
            <Radio className="w-8 h-8 text-cyan-400" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400 absolute -bottom-2 -right-2" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-bold text-white tracking-wider uppercase">
            Initializing IoT Node Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Synchronizing telemetry stream & relay micro-switches...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        {/* Demo Mode Top Banner */}
        <DemoModeBanner
          onNavigateToSettings={() => setActiveTab('settings')}
          onNavigateToDocs={() => setActiveTab('docs')}
        />

        {/* Sticky Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/40 py-4 px-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong>IoT-Based Smart Home Automation System</strong> — Final Year / FSWD Engineering Project
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              ESP32 &bull; Node.js Express &bull; Socket.IO &bull; React &bull; MQTT
            </span>
          </div>
        </footer>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <HomeProvider>
      <MainLayout />
    </HomeProvider>
  );
}
