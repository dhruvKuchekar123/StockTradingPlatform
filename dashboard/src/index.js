import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./components/Home";
import PortfolioPage from "./pages/PortfolioPage";
import { NotificationContextProvider } from "./components/NotificationContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <NotificationContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/u/:username" element={<PortfolioPage />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </NotificationContextProvider>
  </React.StrictMode>
);
