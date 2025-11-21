// Utility to normalize image URLs so the browser can load them.
// - leaves http(s) URLs unchanged
// - converts legacy filesystem or file:// paths that reference the backend uploads folder
//   into an HTTP URL pointing at the dev backend (defaults to http://localhost:5000)

export default function sanitizeImageUrl(url) {
  if (!url) return "";

  try {
    const trimmed = String(url).trim();

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    // Handle file:// URLs (Windows paths) and plain filesystem paths saved in DB
    // Examples:
    // file:///D:/.../backend/uploads/1762418772641-street light.jpeg
    // D:\Vijay - Personal\...\backend\uploads\1762418772641-street light.jpeg
    // /absolute/path/.../backend/uploads/filename.jpg

    // Extract filename (last path segment)
    const parts = trimmed.split(/[/\\]+/);
    const filename = parts[parts.length - 1];
    if (!filename) return trimmed;

    // Prefer Vite environment variable if set (VITE_API_BASE_URL) e.g. http://localhost:5000/api
    const apiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || "http://localhost:5000/api";
    // Derive backend base without /api
    const backendBase = apiBaseUrl.replace(/\/api\/?$/, "");

    return `${backendBase.replace(/\/\/$/, '')}/uploads/${encodeURIComponent(filename)}`;
  } catch (e) {
    // fallback to original
    return url;
  }
}
