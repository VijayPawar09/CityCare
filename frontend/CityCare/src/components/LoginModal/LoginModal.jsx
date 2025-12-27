// LoginModal.jsx
import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../Services/api";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    userType: "volunteer",
  });
  const { login: saveAuth } = useAuth();

  const handleInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const loginUser = async (credentials) => {
    try {
      const res = await api.post("/auth/login", credentials);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      throw new Error(message);
    }
  };

  const signUpUser = async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      return res.data;
    } catch (err) {
      const message =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Registration failed";
      throw new Error(message);
    }
  };

  const storeAuthToken = (token, user) => {
    window.authToken = token;
    window.currentUser = user;
    try {
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("currentUser", JSON.stringify(user));
    } catch (e) {
      console.log("Session storage not available, using memory storage only");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        if (loginForm.password !== loginForm.confirmPassword) {
          throw new Error("Passwords do not match!");
        }

        // ✅ Simple password rule: min 6 characters
        if (loginForm.password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        if (!loginForm.fullName.trim()) {
          throw new Error("Full name is required");
        }

        const signUpData = {
          fullName: loginForm.fullName.trim(),
          email: loginForm.email.toLowerCase().trim(),
          password: loginForm.password,
          confirmPassword: loginForm.confirmPassword,
          userType: loginForm.userType,
        };

        const response = await signUpUser(signUpData);
        // Do NOT auto-login immediately after sign up. Instead prompt user to sign in.
        setIsSignUp(false);
        setLoginForm({
          email: response?.user?.email || signUpData.email,
          password: "",
          confirmPassword: "",
          fullName: "",
          userType: signUpData.userType,
        });
        setError("Account created successfully. Please sign in.");
        console.log("Sign up successful:", response);
      } else {
        const loginData = {
          email: loginForm.email.toLowerCase().trim(),
          password: loginForm.password,
        };

        const response = await loginUser(loginData);
        // Persist auth using context
        saveAuth(response.user, response.token);

        if (response.user.userType === "admin") navigate("/admin");
        else if (response.user.userType === "citizen") navigate("/citizen");
        else if (response.user.userType === "volunteer") navigate("/volunteer");
        else navigate("/");

        if (onLoginSuccess) onLoginSuccess(response.user);
        console.log("Login successful:", response);
      }

      handleClose();
    } catch (err) {
      setError(err.message);
      console.error("Authentication error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setLoginForm({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      userType: "volunteer",
    });
    setShowPassword(false);
    setError("");
  };

  const handleClose = () => {
    setIsSignUp(false);
    setShowPassword(false);
    setError("");
    setIsLoading(false);
    setLoginForm({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      userType: "volunteer",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-opacity-50 transition-opacity"
        onClick={!isLoading ? handleClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="absolute top-4 right-4">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-600">
              {isSignUp
                ? "Join City Connect to report issues and stay informed"
                : "Sign in to your City Connect account"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (only in Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={loginForm.fullName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* User Type (only in Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      loginForm.userType === "volunteer"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value="volunteer"
                      checked={loginForm.userType === "volunteer"}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="sr-only"
                    />
                    <User
                      className={`w-6 h-6 mb-2 ${
                        loginForm.userType === "volunteer"
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        loginForm.userType === "volunteer"
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      Volunteer
                    </span>
                  </label>

                  <label
                    className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      loginForm.userType === "admin"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value="admin"
                      checked={loginForm.userType === "admin"}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="sr-only"
                    />
                    <User
                      className={`w-6 h-6 mb-2 ${
                        loginForm.userType === "admin"
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        loginForm.userType === "admin"
                          ? "text-yellow-700"
                          : "text-gray-600"
                      }`}
                    >
                      Admin
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (only in Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={loginForm.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>{isSignUp ? "Create Account" : "Sign In"}</>
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={switchMode}
                disabled={isLoading}
                className="ml-2 text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
