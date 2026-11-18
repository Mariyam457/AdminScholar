'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe2,
  RefreshCw,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  Activity,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../lib/api';

export default function SourcesManager() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [crawlingId, setCrawlingId] = useState(null);
  const [crawlingAll, setCrawlingAll] = useState(false);
  const [crawlFeedback, setCrawlFeedback] = useState(null);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSources();
      setSources(res?.data?.sources || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch official sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleTriggerCrawl = async (id, name) => {
    setCrawlingId(id);
    setCrawlFeedback(null);
    try {
      const res = await api.triggerSourceCrawl(id);
      const d = res?.data || {};
      setCrawlFeedback({
        type: d.brokenLinksHiddenCount > 0 ? 'error' : 'success',
        message: `Crawled ${name} (HTTP ${d.httpStatus || 200}). Queued diffs: ${d.enqueuedReviewItemsCount || 0}, Broken/Hidden links: ${d.brokenLinksHiddenCount || 0}, Restored links: ${d.restoredLinksCount || 0}.`,
      });
      fetchSources();
    } catch (err) {
      setCrawlFeedback({
        type: 'error',
        message: `Crawl failed for ${name}: ${err.message}`,
      });
    } finally {
      setCrawlingId(null);
    }
  };

  const handleCrawlAll = async () => {
    setCrawlingAll(true);
    setCrawlFeedback(null);
    try {
      const res = await api.triggerCrawlAll();
      const d = res?.data || {};
      setCrawlFeedback({
        type: d.totalBroken > 0 ? 'error' : 'success',
        message: `Full audit complete across ${d.checkedCount || 0} sources in ${d.durationSec || 0}s. Queued changes: ${d.totalEnqueued || 0}, Broken/Hidden from app: ${d.totalBroken || 0}, Restored: ${d.totalRestored || 0}.`,
      });
      fetchSources();
    } catch (err) {
      setCrawlFeedback({
        type: 'error',
        message: `Full crawl audit failed: ${err.message}`,
      });
    } finally {
      setCrawlingAll(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1>Official Governmental Sources Registry</h1>
          <p>
            The {sources.length || 37} monitored embassy, ministry, and official scholarship bodies crawled periodically by the active monitor.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleCrawlAll} className="btn btn-primary" disabled={crawlingAll}>
            <Activity size={15} />
            <span>{crawlingAll ? 'Auditing All Links...' : 'Run Full Crawl & Link Audit'}</span>
          </button>
          <button onClick={fetchSources} className="btn btn-secondary" disabled={crawlingAll}>
            <RefreshCw size={15} />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {crawlFeedback && (
        <div
          style={{
            background: crawlFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${crawlFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: crawlFeedback.type === 'success' ? '#065f46' : '#991b1b',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          {crawlFeedback.message}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Monitored Body & Authority</th>
              <th>Crawl Schedule</th>
              <th>Health & Uptime</th>
              <th>Last Checked</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading registered official sources...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
                  {error}
                </td>
              </tr>
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No sources registered. Run <code>npm run seed</code> in backend to register all 23 official bodies.
                </td>
              </tr>
            ) : (
              sources.map((src) => {
                const uptime = src.health?.uptimePercentage ?? 100;
                const isQuarantined = src.automationState === 'quarantined';

                return (
                  <tr key={src._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{src.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{src.organization}</div>
                      <a
                        href={src.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11px',
                          color: '#0052ea',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span>{src.officialUrl.replace('https://', '')}</span>
                        <ExternalLink size={10} />
                      </a>
                    </td>
                    <td>
                      <span className="badge badge-gray">Every {src.checkIntervalMinutes || 1440}m (24h)</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${uptime >= 95 ? 'badge-green' : 'badge-amber'}`}>
                          {uptime}% Uptime
                        </span>
                        {isQuarantined && <span className="badge badge-red">Quarantined</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        {src.health?.totalChecks || 0} checks &bull; Last code: {src.health?.lastStatusCode || 200}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#0f172a' }}>
                        {src.lastCheckedAt ? new Date(src.lastCheckedAt).toLocaleDateString() : 'Pending initial check'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {src.lastCheckedAt ? new Date(src.lastCheckedAt).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleTriggerCrawl(src._id, src.name)}
                        className="btn btn-secondary btn-sm"
                        disabled={crawlingId === src._id}
                        title="Trigger Instant Manual Crawl"
                      >
                        <Play size={12} />
                        <span>{crawlingId === src._id ? 'Crawling...' : 'Crawl Now'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

