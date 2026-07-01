import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';
import "./Auth.css";

const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get("message");
    if (errorMsg) {
      toast.error(decodeURIComponent(errorMsg), {
        position: "bottom-left",
      });
      // Clear URL query parameters so the message doesn't persist on refresh
      navigate(location.pathname, { replace: true });
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
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        handleSuccess(message);
        setTimeout(() => {
          window.location.href = `${DASHBOARD_URL}/?token=${data.token || ""}`;
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
          <button type="submit" className="auth-submit">
            Login
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
                    "http://localhost:3002/google-login",
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
