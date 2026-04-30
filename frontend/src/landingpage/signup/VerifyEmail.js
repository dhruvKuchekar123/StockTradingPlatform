import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await axios.post(`http://localhost:3002/verify-email/${token}`);
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        setStatus("failed");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="container mt-5 text-center">
      {status === "verifying" && <h2>Verifying your email...</h2>}
      {status === "success" && (
        <div className="animate-fade-in">
          <h2 className="text-success">Email Verified!</h2>
          <p>Your email has been successfully verified. you can now log in.</p>
          <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
        </div>
      )}
      {status === "failed" && (
        <div className="animate-fade-in">
          <h2 className="text-danger">Verification Failed</h2>
          <p>The verification link is invalid or has expired.</p>
          <Link to="/signup" className="btn btn-secondary mt-3">Back to Signup</Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
