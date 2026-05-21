import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';

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
    <div className="container mt-5 mb-5 animate-fade-in" style={{ maxWidth: "450px" }}>
      <div className="card shadow-sm p-4" style={{ borderRadius: "12px", border: "none", backgroundColor: "#ffffff" }}>
        <h2 className="text-center mb-4" style={{ fontWeight: "700", color: "#1a1a1a" }}>Create Account</h2>
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
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "500", color: "#4a4a4a" }}>Username</label>
            <input
              type="text"
              name="username"
              value={username}
              className="form-control shadow-none"
              style={{ borderRadius: "8px", padding: "10px" }}
              placeholder="Enter your username"
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

          <hr className="my-4" />
          <h5 className="mb-3" style={{ fontWeight: "600", color: "#1a1a1a" }}>Bank Details (For KYC)</h5>

          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "500", color: "#4a4a4a" }}>Account Holder Name</label>
            <input type="text" name="accountName" value={accountName} className="form-control shadow-none" style={{ borderRadius: "8px", padding: "10px" }} placeholder="Enter account name" onChange={handleOnChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "500", color: "#4a4a4a" }}>Account Number</label>
            <input type="text" name="accountNumber" value={accountNumber} className="form-control shadow-none" style={{ borderRadius: "8px", padding: "10px" }} placeholder="Enter account number" onChange={handleOnChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "500", color: "#4a4a4a" }}>IFSC Code</label>
            <input type="text" name="ifscCode" value={ifscCode} className="form-control shadow-none" style={{ borderRadius: "8px", padding: "10px" }} placeholder="Enter IFSC code" onChange={handleOnChange} required />
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500", color: "#4a4a4a" }}>Bank Name</label>
            <input type="text" name="bankName" value={bankName} className="form-control shadow-none" style={{ borderRadius: "8px", padding: "10px" }} placeholder="Enter bank name" onChange={handleOnChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 mb-3" style={{ borderRadius: "8px", fontWeight: "600", backgroundColor: "#0052fe", border: "none" }}>
            Sign Up
          </button>
          
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
                    if (data.token) {
                      localStorage.setItem("token", data.token);
                    }
                    handleSuccess(data.message);
                    setTimeout(() => {
                      window.location.href = `http://localhost:3001/?token=${data.token || ""}`;
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
             <span style={{ color: "#666" }}>Already have an account? <Link to={"/login"} style={{ textDecoration: "none", fontWeight: "600", color: "#0052fe" }}>Login</Link></span>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};


export default Signup;