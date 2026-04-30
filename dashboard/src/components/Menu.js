import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Briefcase, 
  BarChart2, 
  CreditCard, 
  Layers, 
  LogOut,
  User as UserIcon,
  ChevronDown
} from "lucide-react";

const Menu = ({ username }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "http://localhost:3001/login";
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Orders", path: "/orders", icon: ShoppingBag },
    { name: "Holdings", path: "/holdings", icon: BarChart2 },
    { name: "Positions", path: "/positions", icon: Briefcase },
    { name: "Funds", path: "/funds", icon: CreditCard },
    { name: "Analytics", path: "/analytics", icon: Layers },

  ];

  return (
    <div className="flex items-center gap-8">
      <nav>
        <ul className="flex items-center gap-1 list-none m-0 p-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`menu-item flex items-center gap-2 ${isActive ? 'active text-cyan-400' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative">
        <div 
          className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-white/5 rounded-xl transition-all"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-white m-0 leading-none">{username || "User"}</p>
            <p className="text-[10px] text-cyan-400/70 m-0 mt-1">Pro Account</p>
          </div>
          <ChevronDown size={14} className={`text-dim transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {isProfileDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f111a] border border-border rounded-xl shadow-2xl p-2 z-[1000] animate-in fade-in slide-in-from-top-2">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 p-3 text-sm text-dim hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              <UserIcon size={16} />
              My Profile
            </Link>
            <div className="h-px bg-border my-1" />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-all border-none bg-transparent cursor-pointer"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
