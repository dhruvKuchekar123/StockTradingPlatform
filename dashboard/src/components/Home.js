import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import axios from "axios";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");


  useEffect(() => {
    // 1. Extract token from URL parameters or fallback to localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Clean up URL parameters so the token is not visible in the address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      token = localStorage.getItem("token");
    }

    // 2. Set up Axios global request interceptor to include the token in Authorization header
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          config.headers["Authorization"] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const verifyUser = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:3002/",
          {},
          { 
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true 
          }
        );
        if (!data.status) {
          const redirectUrl = data.code 
            ? `http://localhost:3000/login?error=${data.code}&message=${encodeURIComponent(data.message)}`
            : "http://localhost:3000/login";
          window.location.href = redirectUrl;
        } else {
          setUsername(data.user);
          setLoading(false);
        }

      } catch (error) {
        window.location.href = "http://localhost:3000/login";
      }

    };
    verifyUser();

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <TopBar username={username} />
      <Dashboard />
    </>

  );
};

export default Home;

