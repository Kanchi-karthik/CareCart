import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const userData = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (userData) {
      setUser(userData);
    }

    return () => clearInterval(timer);
  }, [window.location.pathname]); // Re-run when path changes to sync user data

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          onClick={toggleSidebar}
          className="menu-toggle"
        >
          <Menu size={24} />
        </button>
        <div className="header-breadcrumb">
          <span className="text-sm text-gray-400 uppercase tracking-widest font-black">CareCart</span>
          <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
            {window.location.pathname.split('/').filter(p => p && p !== 'app').pop() || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="header-right">
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 focus-within:border-red-300 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search registry..."
            className="bg-transparent border-none outline-none ml-2 text-xs w-32 focus:w-48 transition-all font-medium"
          />
        </div>

        <div className="hidden sm:block text-xs font-black text-gray-400">
          {formatTime(currentTime)}
        </div>

        <button className="header-icon-btn">
          <Bell size={20} />
          <span className="notification-badge">
            3
          </span>
        </button>

        <div className="user-profile border border-gray-100 shadow-sm">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #4a0000 100%)' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col items-end">
            <span className="user-name">
              {user?.username || 'User'}
            </span>
            <span className="text-[9px] font-black bg-red-900 text-white px-1.5 py-0.5 rounded leading-none uppercase tracking-tighter">
              {user?.role || 'CUSTOMER'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
