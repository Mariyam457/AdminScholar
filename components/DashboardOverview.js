'use client';

import React from 'react';
import {
  GraduationCap,
  Globe2,
  CheckCircle2,
  Clock,
  Activity,
  Users,
  PlusCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function DashboardOverview({ stats, onNavigateTab, onOpenAddModal }) {
  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'Rolling';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1>Dashboard Overview</h1>
          <p>Real-time platform statistics, crawler health, and scholarship listings.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onOpenAddModal('scholarship')} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add Scholarship</span>
          </button>
          <button onClick={() => onOpenAddModal('internship')} className="btn btn-secondary">
            <PlusCircle size={16} />
            <span>Add Internship</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#0052ea' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.totalScholarships ?? '...'}</div>
            <div className="stat-label">Total Opportunities</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.fullyFundedCount ?? '...'}</div>
            <div className="stat-label">Fully Funded Programs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Globe2 size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.totalHostCountries ?? '...'}</div>
            <div className="stat-label">Host Destination Nations</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            cursor: 'pointer',
            borderColor: stats?.pendingReviewsCount > 0 ? '#fecaca' : 'var(--border)',
          }}
          onClick={() => onNavigateTab('reviews')}
        >
          <div
            className="stat-icon"
            style={{
              background: stats?.pendingReviewsCount > 0 ? '#fef2f2' : '#f1f5f9',
              color: stats?.pendingReviewsCount > 0 ? '#dc2626' : '#64748b',
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <div
              className="stat-val"
              style={{ color: stats?.pendingReviewsCount > 0 ? '#dc2626' : 'var(--text-main)' }}
            >
              {stats?.pendingReviewsCount ?? 0}
            </div>
            <div className="stat-label">Crawler Reviews Awaiting Approval</div>
          </div>
        </div>
      </div>

      {/* Section: Quick Hub & Recently Verified */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Recently Verified Opportunities */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2>Recently Verified Opportunities</h2>
              <p>Top active listings verified from official embassy and government portals.</p>
            </div>
            <button
              onClick={() => onNavigateTab('scholarships')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Countries</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentlyVerified && stats.recentlyVerified.length > 0 ? (
                  stats.recentlyVerified.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.provider}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(item.hostCountries || []).slice(0, 3).map((c) => (
                            <span key={c} className="badge badge-gray" style={{ fontSize: '11px' }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <Clock size={13} color="#64748b" />
                          <span>{formatDeadline(item.deadlines?.applicationDeadline)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-green">Verified</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No opportunities currently loaded. Click "Add Scholarship" above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Crawler & Sources Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h2 style={{ marginBottom: '8px' }}>Official Sources Monitor</h2>
            <p style={{ marginBottom: '18px' }}>24/7 crawler monitoring government endpoints.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Total Sources Monitored</span>
                <span style={{ fontWeight: '700' }}>{stats?.totalSources || 23} Bodies</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Active Auto-Crawlers</span>
                <span className="badge badge-green">{stats?.activeSources || 23} Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Check Schedule</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>Every 24 Hours</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('sources')}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
            >
              <span>Inspect All Sources</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
              borderColor: '#bfdbfe',
            }}
          >
            <h3 style={{ color: '#0052ea', marginBottom: '6px' }}>Student Mobile App</h3>
            <p style={{ fontSize: '13px', marginBottom: '14px' }}>
              Any changes, additions, or approved deadline updates sync instantly to the ScholarBeacon iOS and Android mobile app.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#0052ea' }}>
              <span>Zero App Update Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

