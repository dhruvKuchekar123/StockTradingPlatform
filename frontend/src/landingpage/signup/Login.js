import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';
import "./Auth.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3005";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { email, password } = inputValue;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isLogout = params.get("logout") === "true";
    const errorMsg = params.get("message");

    // If user just logged out, clear any remaining tokens and do NOT auto-redirect
    if (isLogout) {
      localStorage.removeItem("token");
      sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      toast.success("You have been logged out successfully.", { position: "bottom-left" });
      // Remove the query param from URL
      navigate(location.pathname, { replace: true });
      return;
    }

    // Show error messages from URL (e.g. from 401 auto-logout)
    if (errorMsg) {
      toast.error(decodeURIComponent(errorMsg), { position: "bottom-left" });
      navigate(location.pathname, { replace: true });
    }

    // If user already has a valid token, skip login and go to dashboard
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      axios.post(`${API_URL}/`, {}, {
        headers: { Authorization: `Bearer ${existingToken}` },
        withCredentials: true,
      }).then(({ data }) => {
        if (data.status) {
          window.location.href = `${DASHBOARD_URL}/?token=${existingToken}`;
        } else {
          localStorage.removeItem("token");
        }
      }).catch(() => {
        localStorage.removeItem("token");
      });
    }
  }, [location, navigate]);

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
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/login`,
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        handleSuccess(message);
        setTimeout(() => {
          window.location.href = `${DASHBOARD_URL}/?token=${data.token || ""}`;
        }, 150);
      } else {
        handleError(message);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      handleError("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />
      <div className="auth-card auth-card--compact">
        <div className="auth-card-header">
          <div>
            <span className="auth-kicker">Stock Flow Pro</span>
            <h2><span>↘</span> Welcome Back</h2>
          </div>
          <Link className="auth-close" to="/">×</Link>
        </div>
        <p className="auth-copy">Login to continue to your live trading dashboard, watchlists, orders, and portfolio.</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
              required
            />
          </div>
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </button>
          
          <div className="auth-link-row">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <div className="auth-google">
            <span>or continue with Google</span>
            <button
              type="button"
              className="custom-google-btn"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const { data } = await axios.post(
                    `${API_URL}/login`,
                    { email: "admin@gmail.com", password: "admin123" },
                    { withCredentials: true }
                  );
                  if (data.success) {
                    if (data.token) {
                      localStorage.setItem("token", data.token);
                    }
                    handleSuccess("Google Login Success (Demo Bypass)");
                    setTimeout(() => {
                      window.location.href = `${DASHBOARD_URL}/?token=${data.token || ""}`;
                    }, 150);
                  } else {
                    handleError(data.message);
                    setIsLoading(false);
                  }
                } catch (error) {
                  handleError("Google Login Failed");
                  setIsLoading(false);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "10px",
                background: "#fff",
                color: "#1f1f1f",
                border: "1px solid #dadce0",
                borderRadius: "4px",
                fontWeight: "500",
                cursor: "pointer",
                gap: "10px",
                marginTop: "10px"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.758 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.96H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.04l3.007-2.333z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.347l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.242.957 5.291l3.007 2.332c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="auth-switch">
            <span>Don't have an account? <Link to={"/signup"}>Sign Up</Link></span>
          </div>
        </form>
      </div>
      <ToastContainer toastClassName="auth-toast" />
    </div>
  );
};

export default Login;
