import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal/LoginModal";

function Login() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Ensure modal opens when visiting /login directly
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    // Navigate back to home (or previous) when closing without logging in
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginModal isOpen={open} onClose={handleClose} />
    </div>
  );
}

export default Login;
