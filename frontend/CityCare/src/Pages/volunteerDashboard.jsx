import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";

const VolunteerDashboard = () => {
  const { logout, user: authUser } = useAuth();
  const [assignedIssues, setAssignedIssues] = useState([]);

  useEffect(() => {
    fetchAssignedIssues();
  }, []);

  const fetchAssignedIssues = async () => {
    try {
      const res = await axios.get("/api/issues/my-assigned");
      setAssignedIssues(res.data);
    } catch (error) {
      console.error("Error fetching assigned issues", error);
    }
  };

  const updateStatus = async (issueId, newStatus) => {
    try {
      await axios.put(`/api/issues/${issueId}/status`, { status: newStatus });
      fetchAssignedIssues();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Volunteer Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {assignedIssues.length === 0 ? (
        <p>No issues assigned to you yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedIssues.map((issue) => (
            <div key={issue._id} className="border rounded p-4 shadow">
              <h3 className="font-bold">{issue.title}</h3>
              <p>{issue.description}</p>
              <p className="text-sm text-gray-500">
                Current Status: {issue.status}
              </p>

              <div className="mt-2 space-x-2">
                <button
                  onClick={() => updateStatus(issue._id, "in-progress")}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Mark In-Progress
                </button>
                <button
                  onClick={() => updateStatus(issue._id, "resolved")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
