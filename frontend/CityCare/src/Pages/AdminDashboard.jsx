import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";

const AdminDashboard = () => {
  const { logout, user: authUser } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    axios
      .get("/api/issues")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setIssues(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
          setIssues([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching issues:", error);
        setIssues([]);
      });
  }, []);

  const assignToVolunteer = async (issueId) => {
    try {
      const volunteerId = prompt("Enter Volunteer ID to assign:");
      if (!volunteerId) return;
      await axios.post(`/api/issues/${issueId}/assign`, { volunteerId });
      alert("Assigned successfully!");
      fetchData();
    } catch (error) {
      console.error("Error assigning issue:", error);
      alert("Assignment failed");
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
            <h3 className="font-bold">{issue.title}</h3>
            <p>{issue.description}</p>
            <p className="text-sm text-gray-500">Status: {issue.status}</p>
            {issue.assignedTo ? (
              <p className="text-sm text-green-600 mt-1">
                Assigned to: {issue.assignedTo.name}
              </p>
            ) : (
              <button
                onClick={() => assignToVolunteer(issue._id)}
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
              >
                Assign to Volunteer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
