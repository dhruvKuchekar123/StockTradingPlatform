import React from "react";
import { Route, Routes } from "react-router-dom";

import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import { GeneralContextProvider } from "./GeneralContext";
import Analytics from "./Analytics";
import Profile from "./Profile";
import AdminDashboard from "./AdminDashboard";
import MarketNews from "./MarketNews";
import AIInsights from "./AIInsights";
import OnboardingTour from "./OnboardingTour";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <GeneralContextProvider>
        <WatchList />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Summary />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/news" element={<MarketNews />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
        {/* Onboarding tour for first-time users */}
        <OnboardingTour />
      </GeneralContextProvider>
    </div>
  );
};

export default Dashboard;
