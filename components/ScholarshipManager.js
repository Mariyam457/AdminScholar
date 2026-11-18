'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Clock,
  ExternalLink,
  CheckCircle,
  Filter,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../lib/api';
import OpportunityModal from './OpportunityModal';

export default function ScholarshipManager({ onOpenAddModal, defaultType = 'all' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('ALL');
  const [selectedFunding, setSelectedFunding] = useState('ALL');
  const [activeTab, setActiveTab] = useState(defaultType); // 'all', 'scholarship', 'internship'

  // Modal & Deletion states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 50,
        search: search.trim(),
      };
      if (selectedDegree !== 'ALL') params.degreeLevels = selectedDegree;
      if (selectedFunding !== 'ALL') params.fundingTypes = selectedFunding;

      const res = await api.getScholarships(params);
      let list = res?.data?.scholarships || [];

      // Filter by classification tab if selected
      if (activeTab === 'internship') {
        list = list.filter(
          (item) =>
            (item.degreeLevels || []).includes('internship') ||
            (item.tags || []).includes('internship') ||
            item.title.toLowerCase().includes('intern')
        );
      } else if (activeTab === 'scholarship') {
        list = list.filter(
          (item) =>
            !(item.degreeLevels || []).includes('internship') &&
            !(item.tags || []).includes('internship') &&
            !item.title.toLowerCase().includes('intern')
        );
      }

      setItems(list);
    } catch (err) {
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedDegree, selectedFunding, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.deleteScholarship(deletingId);
      setDeletingId(null);
      fetchOpportunities();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'Rolling';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div>
        <div style={{ fontWeight: '600' }}>
          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ fontSize: '11px', color: diffDays < 15 ? '#dc2626' : '#64748b' }}>
          {diffDays > 0 ? `${diffDays} days left` : 'Intake closed'}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1>Scholarships & Internships Management</h1>
          <p>Add, update, search, and manage global student opportunities in the database.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* Tabs: All vs Scholarships vs Internships */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          All Opportunities ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('scholarship')}
          className={`btn ${activeTab === 'scholarship' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Scholarships Only
        </button>
        <button
          onClick={() => setActiveTab('internship')}
          className={`btn ${activeTab === 'internship' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Internships Only
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by title, provider, university, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
          >
            <option value="ALL">All Degree Levels</option>
            <option value="masters">Masters</option>
            <option value="phd">PhD</option>
            <option value="bachelors">Bachelors</option>
            <option value="internship">Internship</option>
            <option value="postdoc">Post-Doctoral</option>
          </select>

          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedFunding}
            onChange={(e) => setSelectedFunding(e.target.value)}
          >
            <option value="ALL">All Funding Types</option>
            <option value="full_funding">Fully Funded</option>
            <option value="tuition_only">Tuition Only</option>
            <option value="stipend_only">Stipend Only</option>
            <option value="partial">Partial</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            <span>Filter</span>
          </button>
          <button type="button" onClick={fetchOpportunities} className="btn btn-secondary" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Opportunity & Provider</th>
              <th>Type / Degree</th>
              <th>Host Nations</th>
              <th>Funding Coverage</th>
              <th>Deadline</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading opportunities from database...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
                  {error}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No opportunities match the criteria. Click "Create Opportunity" above to add one.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isInternship =
                  (item.degreeLevels || []).includes('internship') ||
                  (item.tags || []).includes('internship') ||
                  item.title.toLowerCase().includes('intern');

                return (
                  <tr key={item._id}>
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '3px' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.provider}</div>
                    </td>
                    <td>
                      <span className={`badge ${isInternship ? 'badge-amber' : 'badge-blue'}`}>
                        {isInternship ? 'Internship' : (item.degreeLevels || []).slice(0, 2).join(', ')}
                      </span>
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
                      <span
                        className={`badge ${
                          item.fundingType === 'full_funding'
                            ? 'badge-green'
                            : item.fundingType === 'stipend_only'
                            ? 'badge-purple'
                            : 'badge-gray'
                        }`}
                      >
                        {item.fundingType?.replace('_', ' ')?.toUpperCase() || 'FUNDED'}
                      </span>
                    </td>
                    <td>{formatDeadline(item.deadlines?.applicationDeadline)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px' }}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingId(item._id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 10px' }}
                          title="Delete / Deactivate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626' }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0 }}>Deactivate Opportunity?</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#475569' }}>
                Are you sure you want to deactivate this listing? It will no longer be visible on student search or match feeds.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger">
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <OpportunityModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        defaultType={activeTab === 'internship' ? 'internship' : 'scholarship'}
        onSaved={fetchOpportunities}
      />
    </div>
  );
}

