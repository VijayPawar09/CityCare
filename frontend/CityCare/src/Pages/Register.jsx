import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../Services/api";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "citizen",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Confirm password check
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Password confirmation does not match password");
      }
    
      // Simple rule: Minimum 6 characters
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
    
      // Full name check: only letters, spaces, hyphens, apostrophes
      if (!/^[-a-zA-Z\s']{2,100}$/.test(formData.fullName.trim())) {
        throw new Error(
          "Full name must be 2-100 chars and contain only letters, spaces, hyphens, or apostrophes"
        );
      }
    

      await API.post("/auth/register", formData);
      navigate("/login"); // Go to login after successful registration
    } catch (err) {
      const backendMsg = err.response?.data?.message;
      const firstValidation = err.response?.data?.errors?.[0]?.message;
      setError(firstValidation || backendMsg || err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="text"
          name="fullName"
          placeholder="Full name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full mb-4 px-3 py-2 border rounded-lg"
          autoComplete="name"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-4 px-3 py-2 border rounded-lg"
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full mb-4 px-3 py-2 border rounded-lg"
          autoComplete="new-password"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full mb-4 px-3 py-2 border rounded-lg"
          autoComplete="new-password"
        />
        <select
          name="userType"
          value={formData.userType}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        >
          <option value="citizen">Citizen</option>
          <option value="volunteer">Volunteer</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Register
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 hover:underline">
            Login
          </Link>
          
        </p>
      </form>
    </div>
  );
}

export default Register;
