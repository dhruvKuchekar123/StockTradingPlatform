import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Badge } from "@mui/material";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Briefcase, 
  BarChart2, 
  CreditCard, 
  Layers, 
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  Newspaper,
  Brain
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

const Menu = ({ username }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openOrderCount, setOpenOrderCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchOpenOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/open`, { withCredentials: true });
        if (res.data.success) {
          setOpenOrderCount(res.data.orders.length);
        }
      } catch (e) {
        console.error("Failed to fetch open orders count");
      }
    };
    fetchOpenOrders();
  }, []);

  const handleLogout = () => {
    // 1. Clear client-side storage FIRST (synchronous, instant)
    localStorage.removeItem("token");
    localStorage.removeItem("sf_onboarding_done"); // Reset tour if desired
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.clear();

    // 2. Fire-and-forget backend cookie clear (don't await — redirect immediately)
    try {
      fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {}); // Silently ignore network errors
    } catch (_) {}

    // 3. Redirect to login with logout=true flag so Login.js won't auto-redirect back
    window.location.replace(
      `${process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000"}/login?logout=true`
    );
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, id: "menu-dashboard" },
    { name: "Orders", path: "/orders", icon: ShoppingBag, badge: openOrderCount, id: "menu-orders" },
    { name: "Holdings", path: "/holdings", icon: BarChart2, id: "menu-holdings" },
    { name: "Positions", path: "/positions", icon: Briefcase, id: "menu-positions" },
    { name: "Funds", path: "/funds", icon: CreditCard, id: "menu-funds" },
    { name: "Analytics", path: "/analytics", icon: Layers, id: "menu-analytics" },
    { name: "News", path: "/news", icon: Newspaper, id: "menu-news" },
    { name: "AI", path: "/ai-insights", icon: Brain, id: "menu-ai" },
    { name: "Admin", path: "/admin", icon: Shield, id: "menu-admin" },
  ];

  return (
    <div className="flex items-center gap-4">
      <nav>
        <ul className="menu-container">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name} style={{ listStyle: "none" }}>
                <Link
                  to={item.path}
                  id={item.id}
                  className={`menu-item ${isActive ? 'active' : ''}`}
                >
                  {item.badge > 0 ? (
                    <Badge badgeContent={item.badge} color="error" overlap="circular">
                      <Icon size={15} />
                    </Badge>
                  ) : (
                    <Icon size={15} />
                  )}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative">
        <div 
          className="profile-trigger"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        >
          <div className="profile-avatar">
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden md:block">
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)", margin: 0, lineHeight: 1 }}>
              {username || "User"}
            </p>
            <p style={{ fontSize: "10px", color: "var(--accent-gold)", margin: "3px 0 0 0", opacity: 0.8 }}>
              Pro Account
            </p>
          </div>
          <ChevronDown 
            size={13} 
            style={{ 
              color: "var(--text-dim)", 
              transition: "transform 0.2s", 
              transform: isProfileDropdownOpen ? "rotate(180deg)" : "none" 
            }} 
          />
        </div>

        {isProfileDropdownOpen && (
          <div className="profile-dropdown">
            <Link 
              to="/profile" 
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              <UserIcon size={15} />
              My Profile
            </Link>
            <Link 
              to="/admin" 
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              <Shield size={15} />
              Admin Panel
            </Link>
            <div className="dropdown-divider" />
            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOut size={15} />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
