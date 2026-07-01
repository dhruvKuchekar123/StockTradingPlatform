import React, { useState } from "react";
import { Switch, FormControlLabel, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

const PrivacyToggle = ({ isPublicInitial, onToggle }) => {
  const [isPublic, setIsPublic] = useState(isPublicInitial);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleToggle = async (event) => {
    const newValue = event.target.checked;
    setIsPublic(newValue); // Optimistic UI update

    try {
      // Axios interceptor in Home.js or global setup should attach token if available
      // but to be safe we grab it directly if not relying on interceptor for this specific component
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `${API_URL}/api/portfolio/toggle-visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setIsPublic(data.isPublic);
        if (onToggle) onToggle(data.isPublic);
        setSnackbar({
          open: true,
          message: data.isPublic ? "Portfolio is now public" : "Portfolio is now private",
          severity: "success"
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Failed to toggle visibility", error);
      setIsPublic(!newValue); // Revert on failure
      setSnackbar({
        open: true,
        message: "Failed to update visibility",
        severity: "error"
      });
    }
  };

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <FormControlLabel
        control={<Switch checked={isPublic} onChange={handleToggle} color="primary" />}
        label={isPublic ? "Public portfolio" : "Private"}
      />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PrivacyToggle;
