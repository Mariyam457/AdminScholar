'use client';

import React from 'react';
import { ShieldCheck, LogOut, Activity, Database } from 'lucide-react';
import { logout } from '../lib/api';

export default function Navbar({ user, stats, onLogout }) {
  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
            Vercel Production API Connected
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {stats?.pendingReviewsCount > 0 && (
          <div
            style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Activity size={14} />
            {stats.pendingReviewsCount} Crawl Change{stats.pendingReviewsCount > 1 ? 's' : ''} Awaiting Permission
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#0052ea',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px',
            }}
          >
            {user?.profile?.fullName ? user.profile.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              {user?.profile?.fullName || 'System Admin'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.email || 'admin@scholarbeacon'}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}
          title="Sign Out"
        >
          <LogOut size={14} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}

