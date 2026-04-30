import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import axios from "axios";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");


  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:3002/",
          {},
          { withCredentials: true }
        );
        if (!data.status) {
          window.location.href = "http://localhost:3001/login";
        } else {
          setUsername(data.user);
          setLoading(false);
        }

      } catch (error) {
        window.location.href = "http://localhost:3001/login";
      }

    };
    verifyUser();
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

