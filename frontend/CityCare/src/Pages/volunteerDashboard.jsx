import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { getAllIssues, volunteerUpdateIssueStatus, assignIssueToMe } from "../Services/api";
import sanitizeImageUrl from "../Utils/sanitizeImageUrl";
import { CheckCircle, AlertTriangle, XCircle, MapPin, Calendar } from "lucide-react";

const VolunteerDashboard = () => {
  const { logout, user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAllIssues();
        setIssues(Array.isArray(data) ? data : []);
      } catch (e) {
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const counts = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter((i) => i.status === "pending").length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    const rejected = issues.filter((i) => i.status === "rejected").length;
    return { total, pending, resolved, rejected };
  }, [issues]);

  const filtered = useMemo(() => {
    if (selected === "all") return issues;
    return issues.filter((i) => i.status === selected);
  }, [issues, selected]);

  const badge = (status) => {
    if (status === "resolved") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const icon = (status) => {
    if (status === "resolved") return <CheckCircle className="w-4 h-4" />;
    if (status === "pending") return <AlertTriangle className="w-4 h-4" />;
    if (status === "rejected") return <XCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const updateStatus = async (id, status) => {
    setErrorMsg("");
    setUpdatingId(id);
    try {
      await volunteerUpdateIssueStatus(id, status);
      const data = await getAllIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (e) {
      let msg = e?.response?.data?.message || e?.message || "Failed to update status";
      if (e?.response?.status === 403) {
        msg = "You can only update issues assigned to you.";
      }
      setErrorMsg(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const isAssignedToMe = (issue) => {
    const me = user?._id || user?.id;
    const a = issue?.assignedTo || issue?.assignedVolunteer || issue?.volunteer || issue?.assignee;
    const assignedId = typeof a === "object" ? (a?._id || a?.id) : a;
    return me && assignedId && String(assignedId) === String(me);
  };

  const handleAssignToMe = async (issue) => {
    setErrorMsg("");
    setUpdatingId(issue._id);
    try {
      await assignIssueToMe(issue._id, user?._id || user?.id);
      const data = await getAllIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to assign issue";
      setErrorMsg(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-lg">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow border">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{counts.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border">
            <div className="text-sm text-gray-600">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{counts.resolved}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border">
            <div className="text-sm text-gray-600">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "resolved", label: "Resolved" },
            { key: "rejected", label: "Rejected" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSelected(t.key)}
              className={`${
                selected === t.key ? "bg-blue-600 text-white" : "bg-white text-gray-700"
              } px-4 py-2 rounded-full border shadow-sm`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="text-red-700 text-sm">{errorMsg}</div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No issues found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((issue) => (
                <div key={issue._id} className="p-4 hover:bg-gray-50">
                  <div className="flex gap-4">
                    {issue.image ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={sanitizeImageUrl(issue.image)}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = sanitizeImageUrl(
                              "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop"
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{issue.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge(issue.status)}`}>
                          {icon(issue.status)}
                          <span className="capitalize">{issue.status}</span>
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 min-w-0">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{issue.location || "Unknown"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700 line-clamp-2 text-sm">{issue.description}</p>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3 border">
                          <div className="text-gray-500">Reporter</div>
                          <div className="font-medium text-gray-800 truncate">
                            {issue.reportedBy?.fullName || issue.user?.fullName || issue.user?.name || "Unknown"}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border">
                          <div className="text-gray-500">Email</div>
                          <div className="font-medium text-gray-800 truncate">
                            {issue.reportedBy?.email || issue.user?.email || "NA"}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border">
                          <div className="text-gray-500">Phone</div>
                          <div className="font-medium text-gray-800 truncate">
                            {issue.reportedBy?.phone || issue.user?.phone || "NA"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {issue.status !== "resolved" && (
                          <button
                            onClick={() => updateStatus(issue._id, "resolved")}
                            disabled={updatingId === issue._id || !isAssignedToMe(issue)}
                            title={isAssignedToMe(issue) ? "" : "Only the assigned volunteer can change status"}
                            className="px-3 py-1 rounded-lg bg-green-700 text-white text-sm disabled:opacity-50"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {issue.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(issue._id, "rejected")}
                            disabled={updatingId === issue._id || !isAssignedToMe(issue)}
                            title={isAssignedToMe(issue) ? "" : "Only the assigned volunteer can change status"}
                            className="px-3 py-1 rounded-lg bg-red-700 text-white text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                        {!isAssignedToMe(issue) && (
                          <span className="text-xs text-gray-500"> Only assigned volunteers can change status.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
