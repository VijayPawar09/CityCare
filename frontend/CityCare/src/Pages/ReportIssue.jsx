import React, { useState } from "react";
import {
  Camera,
  MapPin,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { reportIssue as apiReportIssue } from "../Services/api";

const ReportIssues = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    location: false,
  });

  const isValid =
    title.trim() !== "" && description.trim() !== "" && location.trim() !== "";

  // use apiReportIssue from Services/api which posts to /issues/report

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // mark all fields touched to show errors
    setTouched({ title: true, description: true, location: true });
    if (!isValid) {
      setError("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      if (imageFile) formData.append("image", imageFile);

      const res = await apiReportIssue(formData);
      const created = res?.issue || res;

      // Dispatch event to update dashboard
      try {
        window.dispatchEvent(
          new CustomEvent("issue:created", { detail: created })
        );
      } catch (e) {}

      alert(res?.message || "Issue reported successfully!");
      navigate("/citizen");
    } catch (err) {
      console.error("Report error", err);
      const backend = err?.response?.data?.message || err?.message;
      setError(backend || "Failed to report issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = () => {
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const getPriorityIcon = () => {
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Report a New Issue
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help make our city better by reporting issues. Your report helps us
            respond quickly and effectively.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Priority Badge */}
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Issue Details
                </h2>
                <p className="text-gray-600">
                  Provide clear information to help us address the issue
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getPriorityColor()} font-medium text-sm`}
              >
                {getPriorityIcon()}
                Report Status: New
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-4 sm:m-6 mb-0 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title Field */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    Issue Title
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="e.g., Large pothole on Main Street"
                  />
                </div>

                {/* Description Field */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    Description
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={6}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                    placeholder="Describe the issue in detail, including location specifics and any safety concerns..."
                  />
                </div>

                {/* Location Field */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Address, intersection, or landmark"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Photo Upload */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Camera className="w-4 h-4 mr-1" />
                    Photo Evidence
                    <span className="text-gray-500 text-xs ml-2 font-normal">
                      (Optional)
                    </span>
                  </label>

                  {!preview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleImageChange}
                      />
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group-hover:border-blue-400">
                        <Upload className="w-12 h-12 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
                        <p className="text-gray-600 text-center mb-1">
                          <span className="font-semibold text-blue-600">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 group"
                      >
                        <X className="w-4 h-4 text-gray-600 group-hover:text-red-500" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Photos help our teams assess and prioritize issues more
                    effectively
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Submit Issue Report
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>

                {/* Privacy Notice */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Your Privacy Matters</p>
                      <p className="text-blue-700">
                        Your contact details remain private. Reports are used solely to improve city services and follow our community guidelines.
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssues;
