import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api", // Backend runs on 5001 in dev (adjust if needed)
  withCredentials: true, // if you're using cookies for auth
});

// Attach Authorization header from localStorage token on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===========================
//         ISSUE APIs
// ===========================

// Report a new issue (multipart/form-data)
export const reportIssue = async (formData) => {
  // Let axios set the Content-Type (including multipart boundary) automatically
  const res = await API.post("/issues/report", formData);
  return res.data;
};

// Get issues assigned to the logged-in volunteer
export const getMyAssignedIssues = async () => {
  const res = await API.get("/issues/assigned/me");
  return res.data;
};

// Get all issues (admin only)
export const getAllIssues = async () => {
  const res = await API.get("/issues");
  return res.data;
};

// Volunteer updates their assigned issue status
export const volunteerUpdateIssueStatus = async (id, newStatus) => {
  const res = await API.put(`/issues/${id}/status`, { status: newStatus });
  return res.data;
};

// Admin updates any issue status
export const adminUpdateIssueStatus = async (id, newStatus) => {
  const res = await API.patch(`/issues/update-status/${id}`, { status: newStatus });
  return res.data;
};

// Get issue stats for dashboard (admin)
export const getIssueStats = async () => {
  const res = await API.get("/issues/stats");
  return res.data;
};

export default API;
