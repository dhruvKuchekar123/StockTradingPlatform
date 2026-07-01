import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';
import "./Auth.css";

const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

const Signup = () => {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const { email, password, username, accountName, accountNumber, ifscCode, bankName } = inputValue;

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
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:3002/signup",
        {
          email, password, username,
          bankDetails: {
            accountName, accountNumber, ifscCode, bankName
          }
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
          navigate("/login");
        }, 1500);
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
      username: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />
      <div className="auth-card">
        <div className="auth-card-header">
          <div>
            <span className="auth-kicker">Stock Flow Pro</span>
            <h2><span>↘</span> Create Account</h2>
          </div>
          <Link className="auth-close" to="/">×</Link>
        </div>
        <p className="auth-copy">Open your trading account and connect KYC details for dashboard access.</p>
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
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={username}
              placeholder="Enter your username"
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

          <div className="auth-divider" />
          <h5 className="auth-section-title">Bank Details (For KYC)</h5>

          <div className="auth-field">
            <label>Account Holder Name</label>
            <input type="text" name="accountName" value={accountName} placeholder="Enter account name" onChange={handleOnChange} required />
          </div>
          <div className="auth-field-grid">
            <div className="auth-field">
              <label>Account Number</label>
              <input type="text" name="accountNumber" value={accountNumber} placeholder="Enter account number" onChange={handleOnChange} required />
            </div>
            <div className="auth-field">
              <label>IFSC Code</label>
              <input type="text" name="ifscCode" value={ifscCode} placeholder="Enter IFSC code" onChange={handleOnChange} required />
            </div>
          </div>
          <div className="auth-field">
            <label>Bank Name</label>
            <input type="text" name="bankName" value={bankName} placeholder="Enter bank name" onChange={handleOnChange} required />
          </div>
          <button type="submit" className="auth-submit">
            Sign Up
          </button>
          
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
             <span>Already have an account? <Link to={"/login"}>Login</Link></span>
          </div>
        </form>
      </div>
      <ToastContainer toastClassName="auth-toast" />
    </div>
  );
};

export default Signup;
