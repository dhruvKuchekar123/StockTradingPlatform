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
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const { data } = await axios.post(
                    `${API_URL}/google-login`,
                    { token: credentialResponse.credential },
                    { withCredentials: true }
                  );
                  if (data.success) {
                    if (data.token) {
                      localStorage.setItem("token", data.token);
                    }
                    handleSuccess(data.message);
                    setTimeout(() => {
                      window.location.href = `${DASHBOARD_URL}/?token=${data.token || ""}`;
                    }, 150);
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
