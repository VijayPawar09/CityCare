import axios from "axios";

// Prefer environment-driven base URL, fallback to localhost:5000
// Set VITE_API_BASE_URL in your frontend .env (e.g., http://localhost:5001/api)
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL,
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

// Assign current volunteer to an issue
export const assignIssueToMe = async (id, volunteerId) => {
  try {
    const res = await API.put(`/issues/${id}/assign/me`);
    return res.data;
  } catch (e) {
    try {
      const res = await API.put(`/issues/${id}/assign`, volunteerId ? { volunteerId } : {});
      return res.data;
    } catch (err) {
      throw err;
    }
  }
};

export default API;
