'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { api } from '../lib/api';

export default function ReviewQueueManager({ onReviewHandled }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReviews('pending');
      setReviews(res?.data?.items || res?.data?.reviews || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await api.approveReview(id);
      fetchReviews();
      if (onReviewHandled) onReviewHandled();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Optional rejection reason:', 'Unverified or duplicate notification');
    if (reason === null) return;

    setActionLoadingId(id);
    try {
      await api.rejectReview(id, reason);
      fetchReviews();
      if (onReviewHandled) onReviewHandled();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="badge badge-red">Critical Diff</span>;
      case 'high':
        return <span className="badge badge-amber">High Urgency</span>;
      default:
        return <span className="badge badge-blue">Verified Change</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1>Automated Crawler Review Queue</h1>
          <p>
            When the background monitor scheduler spots official website changes (e.g. deadline extensions or stipend increases),
            it requires <strong>admin permission</strong> before applying them to the live database.
          </p>
        </div>
        <button onClick={fetchReviews} className="btn btn-secondary" title="Refresh Queue">
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
          Checking automated review queue...
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#dc2626' }}>
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ marginBottom: '8px' }}>All Sources Fully Synchronized!</h2>
          <p style={{ maxWidth: '480px', margin: '0 auto 20px', color: '#64748b' }}>
            Zero discrepancies or unapproved diffs currently in the queue. The background scheduler will post items here as
            soon as external official pages update.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {reviews.map((rev) => (
            <div key={rev._id} className="card" style={{ borderLeft: '4px solid #0052ea' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                      {rev.scholarshipTitle || 'Scholarship Opportunity'}
                    </span>
                    {getSeverityBadge(rev.severity)}
                    <span className="badge badge-purple">Confidence: {rev.confidenceScore || 90}%</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Monitored Source: <strong>{rev.sourceName}</strong> &bull; Category:{' '}
                    <code>{rev.category}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleReject(rev._id)}
                    className="btn btn-danger btn-sm"
                    disabled={actionLoadingId === rev._id}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(rev._id)}
                    className="btn btn-success btn-sm"
                    disabled={actionLoadingId === rev._id}
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve & Update DB</span>
                  </button>
                </div>
              </div>

              {/* Side by side diff */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
                  Detected Discrepancy
                </div>
                {(rev.proposedChanges || []).map((change, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr auto 1fr',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '13px',
                      padding: '8px 0',
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#475569' }}>{change.field}</div>
                    <div
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        color: '#991b1b',
                        fontFamily: 'monospace',
                      }}
                    >
                      Old: {String(change.oldValue || 'None')}
                    </div>
                    <ArrowRight size={14} color="#94a3b8" />
                    <div
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        color: '#065f46',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                      }}
                    >
                      New: {String(change.newValue)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Diff Snippet and Evidence URL */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <div>
                  <strong>Summary:</strong> {rev.diffSnippet || 'Official webpage content change detected.'}
                </div>
                {rev.evidenceUrl && (
                  <a
                    href={rev.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0052ea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                  >
                    <span>View Official Page</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

