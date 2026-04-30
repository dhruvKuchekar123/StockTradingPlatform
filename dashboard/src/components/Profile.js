import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:3002/profile", {
          withCredentials: true,
        });
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-5 text-center">Loading Profile...</div>;
  if (!user) return <div className="p-5 text-center">User not found</div>;

  return (
    <div className="profile-container p-5" style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <div className="card shadow-sm p-4 border-0" style={{ maxWidth: "600px", margin: "0 auto", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <div className="avatar mb-3" style={{ 
            width: "100px", 
            height: "100px", 
            borderRadius: "50%", 
            backgroundColor: "#0052fe", 
            color: "white", 
            fontSize: "40px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            margin: "0 auto"
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontWeight: "700" }}>{user.username}</h2>
          <p className="text-muted">{user.email}</p>
        </div>

        <div className="profile-details mt-4">
          <div className="detail-item mb-3 p-3" style={{ borderBottom: "1px solid #eee" }}>
            <span className="text-muted d-block">Account Status</span>
            <span className={user.isVerified ? "text-success" : "text-warning"} style={{ fontWeight: "600" }}>
              {user.isVerified ? "Verified" : "Verification Pending"}
            </span>
          </div>
          <div className="detail-item mb-3 p-3" style={{ borderBottom: "1px solid #eee" }}>
            <span className="text-muted d-block">Joined On</span>
            <span style={{ fontWeight: "600" }}>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="detail-item mb-3 p-3" style={{ borderBottom: "1px solid #eee" }}>
            <span className="text-muted d-block">User ID</span>
            <span style={{ fontWeight: "600" }}>{user._id}</span>
          </div>
        </div>
        
        <button className="btn btn-outline-primary w-100 mt-4" style={{ borderRadius: "8px" }} onClick={() => window.location.href = "http://localhost:3001"}>
          Back to Main Website
        </button>
      </div>
    </div>
  );
};

export default Profile;
