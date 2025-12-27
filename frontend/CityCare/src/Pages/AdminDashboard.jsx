import React, { useEffect, useState } from "react";
import api from "../Services/api";
import { useAuth } from "../Context/AuthContext";

const AdminDashboard = () => {
  const { logout, user: authUser } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  const fetchData = async () => {
    try {
      const res = await api.get("/issues");
      setIssues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setIssues([]);
    }

    try {
      const s = await api.get("/issues/stats");
      setStats({
        pending: s.data.pending || 0,
        inProgress: s.data.inProgress || 0,
        resolved: s.data.resolved || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // derive backend base URL from api client
  const BACKEND_BASE = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      return imagePath;
    const filename = imagePath.split(/[\\/]/).pop();
    return encodeURI(`${BACKEND_BASE}/uploads/${filename}`);
  };

  const assignToVolunteer = async (issueId) => {
    try {
      const volunteerId = prompt("Enter Volunteer ID to assign:");
      if (!volunteerId) return;
      await api.put(`/issues/${issueId}/assign`, { volunteerId });
      alert("Assigned successfully!");
      fetchData();
    } catch (error) {
      console.error("Error assigning issue:", error);
      alert("Assignment failed");
    }
  };

  const changeStatus = async (issueId, newStatus) => {
    try {
      await api.patch(`/issues/update-status/${issueId}`, {
        status: newStatus,
      });
      await fetchData();
      alert("Status updated");
    } catch (err) {
      console.error("Failed to update status", err);
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded shadow">
          Pending: {stats.pending}
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          In Progress: {stats.inProgress}
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          Resolved: {stats.resolved}
        </div>
      </div>

      {/* Issues List */}
      <h2 className="text-xl font-semibold mb-4">All Reported Issues</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {issues.map((issue) => (
          <div key={issue._id} className="border rounded p-4 shadow">
            <div className="flex gap-4">
              <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {issue.image ? (
                  // image may be a URL or path
                  <img
                    src={getImageUrl(issue.image)}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold">{issue.title}</h3>
                <p className="text-sm text-gray-700 mt-1">
                  {issue.description}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Status: {issue.status}
                </p>

                <div className="mt-2">
                  <select
                    value={issue.status}
                    onChange={(e) => changeStatus(issue._id, e.target.value)}
                    className="px-3 py-1 rounded-full text-sm font-medium border cursor-pointer"
                  >
                    <option value="pending">⭕ Pending</option>
                    <option value="in-progress">▶️ In Progress</option>
                    <option value="resolved">✅ Resolved</option>
                  </select>

                  <p className="text-sm text-gray-600 mt-2">
                    {issue.assignedTo
                      ? `Assigned to: ${issue.assignedTo.name}`
                      : "Unassigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
