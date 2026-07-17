import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';
import "./Auth.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3005";

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
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


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

  const validateInputs = () => {
    // Email Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      handleError("Invalid email format (e.g. user@example.com)");
      return false;
    }
    // Username Check
    if (username.trim().length < 3) {
      handleError("Username must be at least 3 characters long");
      return false;
    }
    // Password Check
    if (password.length < 6) {
      handleError("Password must be at least 6 characters long");
      return false;
    }
    // Names Check
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(accountName) || accountName.trim().length < 3) {
      handleError("Account Holder Name must contain only letters and be at least 3 characters");
      return false;
    }
    if (!nameRegex.test(bankName) || bankName.trim().length < 3) {
      handleError("Bank Name must contain only letters and be at least 3 characters");
      return false;
    }
    // Account Number Check
    const acctRegex = /^\d{9,18}$/;
    if (!acctRegex.test(accountNumber)) {
      handleError("Account Number must contain only digits (between 9 and 18 digits)");
      return false;
    }
    // IFSC Check
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      handleError("Invalid IFSC code format (e.g. SBIN0001234)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const { data } = await axios.post(
        `${API_URL}/signup`,
        {
          email,
          password,
          username,
          bankDetails: {
            accountName,
            accountNumber,
            ifscCode: ifscCode.toUpperCase(),
            bankName
          }
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setShowOTP(true);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
      handleError("Signup failed. Please try again.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      handleError("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/verify-otp`,
        { email, otp: otpCode },
        { withCredentials: true }
      );

      if (data.success) {
        handleSuccess(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 200);
      } else {
        handleError(data.message || "OTP verification failed");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error(error);
      handleError("Verification failed. Please check the code.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />
      <div className="auth-card">
        <div className="auth-card-header">
          <div>
            <span className="auth-kicker">Stock Flow Pro</span>
            <h2>
              <span>↘</span> {showOTP ? "Verify OTP" : "Create Account"}
            </h2>
          </div>
          <Link className="auth-close" to="/">×</Link>
        </div>
        
        {showOTP ? (
          <>
            <p className="auth-copy">
              A 6-digit verification code has been sent to <strong>{email}</strong>. Enter it below to verify your identity.
            </p>
            <form onSubmit={handleVerifyOTP}>
              <div className="auth-field">
                <label>Verification Code (OTP)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  placeholder="Enter 6-digit OTP"
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  style={{ textAlign: "center", letterSpacing: "6px", fontSize: "20px" }}
                  required
                />
              </div>
              <button type="submit" className="auth-submit" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Account"}
              </button>
              
              <div className="auth-switch" style={{ marginTop: "24px" }}>
                <span>Entered incorrect details? <a href="#" onClick={(e) => { e.preventDefault(); setShowOTP(false); }}>Go back</a></span>
              </div>
            </form>
          </>
        ) : (
          <>
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
                  autoComplete="new-email"
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
                  autoComplete="new-username"
                  required
                />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    placeholder="Enter your password (min 6 characters)"
                    onChange={handleOnChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                  </button>
                </div>
              </div>

              <div className="auth-divider" />
              <h5 className="auth-section-title">Bank Details (For KYC)</h5>

              <div className="auth-field">
                <label>Account Holder Name</label>
                <input 
                  type="text" 
                  name="accountName" 
                  value={accountName} 
                  placeholder="Enter account holder name" 
                  onChange={handleOnChange} 
                  autoComplete="off"
                  required 
                />
              </div>
              <div className="auth-field-grid">
                <div className="auth-field">
                  <label>Account Number</label>
                  <input 
                    type="text" 
                    name="accountNumber" 
                    value={accountNumber} 
                    placeholder="Enter account number" 
                    onChange={handleOnChange} 
                    autoComplete="off"
                    required 
                  />
                </div>
                <div className="auth-field">
                  <label>IFSC Code</label>
                  <input 
                    type="text" 
                    name="ifscCode" 
                    value={ifscCode} 
                    placeholder="Enter IFSC code" 
                    onChange={handleOnChange} 
                    style={{ textTransform: "uppercase" }}
                    autoComplete="off"
                    required 
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Bank Name</label>
                <input 
                  type="text" 
                  name="bankName" 
                  value={bankName} 
                  placeholder="Enter bank name" 
                  onChange={handleOnChange} 
                  autoComplete="off"
                  required 
                />
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
                 <span>Already have an account? <Link to={"/login"}>Login</Link></span>
              </div>
            </form>
          </>
        )}
      </div>
      <ToastContainer toastClassName="auth-toast" />
    </div>
  );
};

export default Signup;
