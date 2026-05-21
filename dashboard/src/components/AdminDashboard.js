import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:3002/api/admin/pending-users", {
        withCredentials: true,
      });
      if (data.success) {
        setPendingUsers(data.users);
      }
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setAccessDenied(true);
      }
      console.error("Failed to fetch pending users");
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post(`http://localhost:3002/api/admin/approve-user/${userId}`, {}, {
        withCredentials: true,
      });
      fetchPendingUsers(); 
    } catch (error) {
      console.error("Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    if(window.confirm("Are you sure you want to reject and delete this user?")) {
      try {
        await axios.delete(`http://localhost:3002/api/admin/reject-user/${userId}`, {
          withCredentials: true,
        });
        fetchPendingUsers(); 
      } catch (error) {
        console.error("Failed to reject user");
      }
    }
  };

  if (accessDenied) {
    return (
      <div style={{ padding: "40px", backgroundColor: "#121212", minHeight: "100vh", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", backgroundColor: "#1e1e1e", padding: "50px", borderRadius: "12px", border: "1px solid #ff4d4d", boxShadow: "0 10px 30px rgba(255, 77, 77, 0.1)" }}>
          <h2 style={{ color: "#ff4d4d", marginBottom: "15px", fontWeight: "700" }}>Access Denied</h2>
          <p style={{ color: "#aaa", fontSize: "16px", margin: 0 }}>You must have Administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#121212", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ color: "#3a86ff", marginBottom: "30px", fontWeight: "700" }}>Admin Dashboard: Pending Approvals</h2>
      {pendingUsers.length === 0 ? (
        <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}>
          <p style={{ margin: 0, color: "#aaa" }}>No pending users waiting for approval.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", backgroundColor: "#1e1e1e", borderRadius: "12px", border: "1px solid #333" }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#252525", borderBottom: "2px solid #333" }}>
                <th style={{ padding: "15px", textAlign: "left" }}>Username</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Bank Account Name</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Bank Account No.</th>
                <th style={{ padding: "15px", textAlign: "left" }}>IFSC Code</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #2a2a2a", transition: "background 0.2s" }}>
                  <td style={{ padding: "15px", textAlign: "left" }}>{u.username}</td>
                  <td style={{ padding: "15px", color: "#aaa", textAlign: "left" }}>{u.email}</td>
                  <td style={{ padding: "15px", textAlign: "left" }}>{u.bankDetails?.accountName || "N/A"}</td>
                  <td style={{ padding: "15px", textAlign: "left" }}>{u.bankDetails?.accountNumber || "N/A"}</td>
                  <td style={{ padding: "15px", textAlign: "left" }}>{u.bankDetails?.ifscCode || "N/A"}</td>
                  <td style={{ padding: "15px", textAlign: "left" }}>
                    <button 
                      onClick={() => handleApprove(u._id)} 
                      style={{ backgroundColor: "#4caf50", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", marginRight: "10px", cursor: "pointer", fontWeight: "600" }}>
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(u._id)} 
                      style={{ backgroundColor: "#f44336", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
