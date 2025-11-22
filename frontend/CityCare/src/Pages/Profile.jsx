import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Services/api";
import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    profilePicture: user?.profilePicture || null,
  });

  // derive backend base from axios instance (remove trailing /api)
  const BACKEND_BASE = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // absolute URL stored
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // Extract filename from any stored path
    const filename = imagePath.split(/[\\/]/).pop();
    return encodeURI(`${BACKEND_BASE}/uploads/${filename}`);
  };

  // Fetch user's reported issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Try to get the user's issues first. If that returns empty (or fails due to auth),
        // fall back to fetching all issues so the UI shows existing reports from DB.
        let response;
        try {
          response = await api.get("/issues/my-issues");
        } catch (err) {
          // If access denied or any error, try fetching all issues
          console.warn(
            "Failed to fetch my-issues, falling back to /issues",
            err
          );
          response = await api.get("/issues");
        }

        const data = response?.data ?? [];
        // If my-issues returned an empty array, try to fetch all issues as a fallback
        if (Array.isArray(data) && data.length === 0) {
          try {
            const all = await api.get("/issues");
            setIssues(all.data || []);
          } catch (e) {
            setIssues([]);
          }
        } else {
          setIssues(data);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      await api.put("/users/profile", profileData);
      setIsEditMode(false);
      // Refresh auth context or show success message
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "text-green-600 bg-green-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "pending":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profileData.profilePicture ? (
                    <img
                      src={getImageUrl(profileData.profilePicture)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {isEditMode && (
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          fullName: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    profileData.fullName || "User"
                  )}
                </h1>
                <p className="text-gray-500">Citizen</p>
              </div>
              <button
                onClick={() => {
                  if (isEditMode) {
                    handleProfileUpdate();
                  } else {
                    setIsEditMode(true);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isEditMode ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">
                    {isEditMode ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      profileData.email
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">
                    {isEditMode ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      profileData.phone || "Not provided"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      profileData.address || "Not provided"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-900">
                    {new Date(
                      user?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reported Issues */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reported Issues
          </h2>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : issues.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Issues Reported
              </h3>
              <p className="text-gray-500">
                You haven't reported any issues yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {issue.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={getImageUrl(issue.image)}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {issue.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          issue.status
                        )}`}
                      >
                        {getStatusIcon(issue.status)}
                        <span className="ml-1">{issue.status}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {issue.location}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(issue.createdAt).toLocaleDateString()}
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

export default Profile;
