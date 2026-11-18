'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Activity,
  Globe2,
  ShieldCheck,
  PlusCircle,
  Briefcase,
} from 'lucide-react';
import { getToken, getUser, api } from '../lib/api';
import Navbar from '../components/Navbar';
import DashboardOverview from '../components/DashboardOverview';
import ScholarshipManager from '../components/ScholarshipManager';
import ReviewQueueManager from '../components/ReviewQueueManager';
import SourcesManager from '../components/SourcesManager';
import OpportunityModal from '../components/OpportunityModal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState('scholarship');
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.getStats();
      setStats(res?.data || {});
    } catch {
      // In case stats fail or server not ready
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    const currentUser = getUser();
    setUser(currentUser);
    setCheckingAuth(false);
    fetchStats();
  }, []);

  const handleOpenAddModal = (type = 'scholarship') => {
    setAddModalType(type);
    setAddModalOpen(true);
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Verifying admin authorization...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0052ea',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '17px', color: '#0f172a', letterSpacing: '-0.3px' }}>
              Scholar<span style={{ color: '#0052ea' }}>Beacon</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Admin Control Center</div>
          </div>
        </div>

        <nav style={{ flex: 1, paddingTop: '10px' }}>
          <div
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div
            className={`nav-link ${activeTab === 'scholarships' ? 'active' : ''}`}
            onClick={() => setActiveTab('scholarships')}
          >
            <GraduationCap size={18} />
            <span>Scholarships</span>
          </div>

          <div
            className={`nav-link ${activeTab === 'internships' ? 'active' : ''}`}
            onClick={() => setActiveTab('internships')}
          >
            <Briefcase size={18} />
            <span>Internships</span>
          </div>

          <div
            className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
            style={{ position: 'relative' }}
          >
            <Activity size={18} />
            <span>Crawler Inbox</span>
            {stats?.pendingReviewsCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '12px',
                }}
              >
                {stats.pendingReviewsCount}
              </span>
            )}
          </div>

          <div
            className={`nav-link ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            <Globe2 size={18} />
            <span>Monitored Sources</span>
          </div>
        </nav>

        {/* Quick Add Button in Sidebar */}
        <div style={{ padding: '20px' }}>
          <button
            onClick={() => handleOpenAddModal('scholarship')}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <PlusCircle size={16} />
            <span>Add Opportunity</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar user={user} stats={stats} onLogout={() => router.push('/login')} />

        <main className="page-body">
          {activeTab === 'overview' && (
            <DashboardOverview
              stats={stats}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {activeTab === 'scholarships' && (
            <ScholarshipManager onOpenAddModal={handleOpenAddModal} defaultType="scholarship" />
          )}

          {activeTab === 'internships' && (
            <ScholarshipManager onOpenAddModal={handleOpenAddModal} defaultType="internship" />
          )}

          {activeTab === 'reviews' && (
            <ReviewQueueManager onReviewHandled={fetchStats} />
          )}

          {activeTab === 'sources' && (
            <SourcesManager />
          )}
        </main>
      </div>

      {/* Global Quick Add Opportunity Modal */}
      <OpportunityModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        defaultType={addModalType}
        onSaved={fetchStats}
      />
    </div>
  );
}

