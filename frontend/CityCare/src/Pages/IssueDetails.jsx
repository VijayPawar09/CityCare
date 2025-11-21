import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Services/api';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // derive backend base from axios instance (remove trailing /api)
  const BACKEND_BASE = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const filename = imagePath.split(/[\\/]/).pop();
    return encodeURI(`${BACKEND_BASE}/uploads/${filename}`);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/issues/${id}`);
        if (mounted) setIssue(res.data);
      } catch (e) {
        console.error('Failed to fetch issue', e);
        if (mounted) setError(e?.response?.data?.message || 'Failed to load issue');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const formatDateTime = (dt) => {
    try {
      return new Date(dt).toLocaleString();
    } catch {
      return dt;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );
  if (!issue) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 rounded border bg-gray-50 hover:bg-gray-100"
          >
            Back
          </button>
          <h1 className="text-xl font-semibold text-gray-800 truncate">Issue Details</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="md:w-1/3 w-full">
              {issue.image ? (
                <img
                  src={getImageUrl(issue.image)}
                  alt={issue.title}
                  className="w-full h-56 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-56 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 break-words">{issue.title}</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium border bg-gray-50">
                  {issue.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div>Category: <span className="font-medium text-gray-800">{issue.category || 'General'}</span></div>
                <div>Location: <span className="font-medium text-gray-800">{issue.location || 'Unknown'}</span></div>
                <div>Reported By: <span className="font-medium text-gray-800">{issue.reportedBy?.fullName || issue.reportedBy?.email || 'Unknown'}</span></div>
                <div>Created: <span className="font-medium text-gray-800">{formatDateTime(issue.createdAt)}</span></div>
                <div>Updated: <span className="font-medium text-gray-800">{formatDateTime(issue.updatedAt)}</span></div>
              </div>
              <p className="mt-4 text-gray-800 whitespace-pre-wrap">{issue.description}</p>
            </div>
          </div>

          {/* Status History */}
          {Array.isArray(issue.statusHistory) && issue.statusHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Status History</h3>
              <div className="space-y-3">
                {issue.statusHistory.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded border bg-gray-50">
                    <div className="text-gray-800">
                      <span className="font-medium">{h.status}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{h.note || 'Updated'}</span>
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      <div>{h.changedBy?.fullName || h.changedBy?.email || 'Unknown'}</div>
                      <div>{formatDateTime(h.changedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default IssueDetails;