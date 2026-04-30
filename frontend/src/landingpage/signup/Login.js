import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-left",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:3002/login",
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          // Redirect to dashboard (assuming it's on localhost:3000)
          window.location.href = "http://localhost:3000";
        }, 1000);

      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
    });
  };

  return (
    <div className="container mt-5 mb-5 animate-fade-in" style={{ maxWidth: "450px" }}>
      <div className="card shadow-sm p-4" style={{ borderRadius: "12px", border: "none", backgroundColor: "#ffffff" }}>
        <h2 className="text-center mb-4" style={{ fontWeight: "700", color: "#1a1a1a" }}>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "500", color: "#4a4a4a" }}>Email address</label>
            <input
              type="email"
              name="email"
              value={email}
              className="form-control shadow-none"
              style={{ borderRadius: "8px", padding: "10px" }}
              placeholder="Enter your email"
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500", color: "#4a4a4a" }}>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              className="form-control shadow-none"
              style={{ borderRadius: "8px", padding: "10px" }}
              placeholder="Enter your password"
              onChange={handleOnChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100 py-2 mb-3" style={{ borderRadius: "8px", fontWeight: "600", backgroundColor: "#00d084", border: "none" }}>
            Login
          </button>
          
          <div className="text-center mb-3">
            <Link to="/forgot-password" style={{ textDecoration: "none", fontSize: "14px", color: "#666" }}>Forgot Password?</Link>
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const { data } = await axios.post(
                    "http://localhost:3002/google-login",
                    { token: credentialResponse.credential },
                    { withCredentials: true }
                  );
                  if (data.success) {
                    handleSuccess(data.message);
                    setTimeout(() => {
                      window.location.href = "http://localhost:3000";
                    }, 1000);
                  } else {
                    handleError(data.message);
                  }
                } catch (error) {
                  console.log(error);
                  handleError("Google Login Failed");
                }
              }}
              onError={() => {
                console.log('Login Failed');
                handleError("Google Login Failed");
              }}
            />

          </div>

          <div className="text-center">
            <span style={{ color: "#666" }}>Don't have an account? <Link to={"/signup"} style={{ textDecoration: "none", fontWeight: "600", color: "#00d084" }}>Sign Up</Link></span>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};


export default Login;
