import api from "./api";

export const fetchMyIssues = () => api.get("/issues/my-issues");
export const reportIssue = (formData) => api.post("/issues/report", formData);
export const updateIssueStatus = (id, status) => api.put(`/issues/${id}/status`, { status });