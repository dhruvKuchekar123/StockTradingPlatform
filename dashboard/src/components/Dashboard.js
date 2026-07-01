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
import AdminLayout from "./admin/AdminLayout";
import AdminUsers from "./admin/AdminUsers";
import AdminOrders from "./admin/AdminOrders";
import AdminWallet from "./admin/AdminWallet";
import AdminHealth from "./admin/AdminHealth";
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
            <Route path="/admin/pending" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminUsers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="wallet" element={<AdminWallet />} />
              <Route path="health" element={<AdminHealth />} />
            </Route>
          </Routes>
        </div>
        {/* Onboarding tour for first-time users */}
        <OnboardingTour />
      </GeneralContextProvider>
    </div>
  );
};

export default Dashboard;
