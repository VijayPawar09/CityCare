import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
  PlayCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

const CitizenDashboard = () => {
  const [myReports, setMyReports] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const navigate = useNavigate();

  // derive backend base from axios instance (remove trailing /api)
  const BACKEND_BASE = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Handle absolute URLs
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Extract just the filename from the path
    const filename = imagePath.split(/[\\/]/).pop();

    // Return the full URL
    return encodeURI(`${BACKEND_BASE}/uploads/${filename}`);
  };

  // Listen for newly created issues
  useEffect(() => {
    const handler = (e) => {
      const newIssue = e?.detail;
      if (newIssue) {
        const reportWithDefaults = {
          ...newIssue,
          _id: Date.now().toString(),
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        setMyReports((prev) => [reportWithDefaults, ...prev]);
      }
    };

    window.addEventListener("issue:created", handler);
    return () => window.removeEventListener("issue:created", handler);
  }, []);

  // Fetch my reports on mount
  useEffect(() => {
    let mounted = true;
    const fetchReports = async () => {
      try {
        const res = await api.get("/issues/my-issues");
        const data = res?.data ?? res;
        if (mounted) setMyReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load my reports", err);
      }
    };
    fetchReports();
    return () => {
      mounted = false;
    };
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModalImage(null);
    };
    if (modalImage) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [modalImage]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBorderClass = (status) => {
    switch (status) {
      case "resolved":
        return "border-l-4 border-green-400";
      case "in-progress":
        return "border-l-4 border-blue-400";
      case "pending":
        return "border-l-4 border-orange-400";
      default:
        return "border-l-4 border-gray-300";
    }
  };

  const getCategoryColor = (category) => {
    switch ((category || "").toLowerCase()) {
      case "road":
        return "bg-red-100 text-red-700 border-red-200";
      case "water":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "electricity":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "garbage":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleStatusChange = (reportId, newStatus) => {
    setMyReports((prev) =>
      prev.map((report) =>
        report._id === reportId ? { ...report, status: newStatus } : report
      )
    );
  };

  const updateIssueStatus = async (reportId, newStatus) => {
    // Optimistic update
    setUpdatingId(reportId);
    handleStatusChange(reportId, newStatus);
    try {
      await api.put(`/issues/${reportId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Status update failed", err);
      // Revert optimistic change on failure
      // reload from server or flip back (simple revert: set status to previous)
      // For simplicity, we'll reload reports from server
      try {
        const res = await api.get("/issues/my-issues");
        setMyReports(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to reload reports after failed status update", e);
      }
      alert(err?.response?.data?.message || "Failed to update issue status");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusCounts = {
    total: myReports.length,
    pending: myReports.filter((r) => r.status === "pending").length,
    "in-progress": myReports.filter((r) => r.status === "in-progress").length,
    resolved: myReports.filter((r) => r.status === "resolved").length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return "1d ago";
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleReportIssue = () => {
    // Navigate to the report page (protected route will prompt login if needed)
    navigate(`/report`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-xl font-bold text-gray-800">City Care</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {statusCounts.total}
                </p>
              </div>
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {statusCounts.pending}
                </p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {statusCounts["in-progress"]}
                </p>
              </div>
              <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {statusCounts.resolved}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Issues
          </h1>
          <button
            onClick={handleReportIssue}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Report Issue
          </button>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {myReports.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No issues reported yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Help improve your community by reporting your first issue.
              </p>
              <button
                onClick={handleReportIssue}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Report Issue
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myReports.map((report) => (
                <div
                  key={report._id}
                  className={`p-4 transition-all hover:shadow-md ${getStatusBorderClass(
                    report.status
                  )} group hover:bg-gray-50`}
                >
                  <div className="flex gap-4">
                    {/* Image thumbnail with hover effect */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 transition-transform group-hover:scale-105">
                      {report.image ? (
                        <img
                          src={getImageUrl(report.image)}
                          alt={report.title || "issue image"}
                          loading="lazy"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() =>
                            setModalImage(getImageUrl(report.image))
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              navigate(`/citizen/issues/${report._id}`)
                            }
                            className="text-left text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate"
                            title="Open issue details"
                          >
                            {report.title}
                          </button>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                              report.category
                            )}`}
                          >
                            {report.category || "General"}
                          </span>
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            report.status
                          )}`}
                          title={
                            report.statusHistory &&
                            report.statusHistory.length &&
                            report.statusHistory[
                              report.statusHistory.length - 1
                            ].actorRole === "admin"
                              ? "Status locked by admin"
                              : undefined
                          }
                        >
                          {report.status === "pending" && "⭕ Pending"}
                          {report.status === "in-progress" && "▶️ In Progress"}
                          {report.status === "resolved" && "✅ Resolved"}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {report.location || "Unknown"}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(report.createdAt)}</span>
                        </span>
                      </div>

                      <p className="mt-2 text-gray-700 line-clamp-2 text-sm">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Image modal/lightbox */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setModalImage(null);
              }}
              aria-label="Close image"
            >
              ✕
            </button>

            <div onClick={(e) => e.stopPropagation()}>
              <img
                src={modalImage}
                alt="full-size"
                className="max-w-full max-h-[80vh] object-contain rounded-md mx-auto"
              />

              {/* simple modal: show image only; no download/open controls per user preference */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
