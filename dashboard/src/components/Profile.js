import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    address: "",
    bio: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("http://localhost:3002/profile", {
        withCredentials: true,
      });
      if (data.success) {
        setUser(data.user);
        setFormData({
          username: data.user.username || "",
          phoneNumber: data.user.phoneNumber || "",
          address: data.user.address || "",
          bio: data.user.bio || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put("http://localhost:3002/profile", formData, {
        withCredentials: true,
      });
      if (data.success) {
        setUser(data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loadingContainer}><div className="spinner-border text-light" role="status"></div></div>;
  if (!user) return <div style={styles.loadingContainer}>User not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.title}>{user.username}</h2>
          <p style={styles.subtitle}>{user.email}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input style={styles.input} type="text" name="username" value={formData.username} onChange={handleInputChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input style={styles.input} type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <input style={styles.input} type="text" name="address" value={formData.address} onChange={handleInputChange} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bio</label>
              <textarea style={{...styles.input, minHeight: '80px', resize: 'vertical'}} name="bio" value={formData.bio} onChange={handleInputChange} />
            </div>
            <div style={styles.buttonGroup}>
              <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" style={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.details}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Account Status</span>
              <span style={{...styles.detailValue, color: user.isVerified ? "#4caf50" : "#ff9800"}}>
                {user.isVerified ? "Verified" : "Verification Pending"}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Phone Number</span>
              <span style={styles.detailValue}>{user.phoneNumber || "Not provided"}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Address</span>
              <span style={styles.detailValue}>{user.address || "Not provided"}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Bio</span>
              <span style={styles.detailValue}>{user.bio || "No bio yet"}</span>
            </div>
            <div style={styles.detailRow} style={{...styles.detailRow, borderBottom: 'none'}}>
              <span style={styles.detailLabel}>Joined On</span>
              <span style={styles.detailValue}>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            
            <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
              Edit Profile
            </button>
          </div>
        )}
        
        <button onClick={() => window.location.href = "http://localhost:3000"} style={styles.backBtn}>
          Back to Main Website
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    minHeight: "100vh",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#e0e0e0"
  },
  loadingContainer: {
    backgroundColor: "#0a0a0a",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "18px"
  },
  card: {
    backgroundColor: "#141414",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    border: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    textAlign: "center",
    marginBottom: "30px"
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#3a86ff",
    color: "#fff",
    fontSize: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(58, 134, 255, 0.4)"
  },
  title: {
    margin: "0 0 5px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff"
  },
  subtitle: {
    margin: "0",
    color: "#a0a0a0",
    fontSize: "14px"
  },
  details: {
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px"
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 0",
    borderBottom: "1px solid #2a2a2a"
  },
  detailLabel: {
    color: "#888",
    fontSize: "14px",
    fontWeight: "500"
  },
  detailValue: {
    color: "#ddd",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "60%",
    wordBreak: "break-word"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  label: {
    fontSize: "13px",
    color: "#aaa",
    fontWeight: "500"
  },
  input: {
    backgroundColor: "#1f1f1f",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "12px 15px",
    color: "#fff",
    fontSize: "14px",
    outline: "none"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px"
  },
  editBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3a86ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px"
  },
  saveBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "transparent",
    color: "#bbb",
    border: "1px solid #444",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  },
  backBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "transparent",
    color: "#3a86ff",
    border: "1px solid #3a86ff",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  }
};

export default Profile;
