import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) {
      return { title: 'Traffic Enforcement Dashboard', subtitle: 'Live operations and enforcement feed' };
    }
    if (pathname.startsWith('/violations/new')) {
      return { title: 'Log Traffic Violation', subtitle: 'Issue new notice and generate digital challan' };
    }
    if (pathname.startsWith('/challans')) {
      return { title: 'Digital E-Challan Notice', subtitle: 'Printable legal receipt with QR verification' };
    }
    if (pathname.startsWith('/violations')) {
      return { title: 'Traffic Violation History', subtitle: 'Comprehensive database records and search' };
    }
    return { title: 'Traffic Management System', subtitle: 'Official enforcement terminal' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-ambient-pattern flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
