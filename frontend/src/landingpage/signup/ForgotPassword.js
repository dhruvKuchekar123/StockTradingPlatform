import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:3002/forgot-password",
        { email },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="container mt-5 mb-5 animate-fade-in" style={{ maxWidth: "450px" }}>
      <div className="card shadow-sm p-4" style={{ borderRadius: "12px", border: "none" }}>
        <h2 className="text-center mb-4">Forgot Password</h2>
        <p className="text-muted text-center mb-4">Enter your email to receive a password reset link.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Send Reset Link</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
