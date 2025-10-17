import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import '../styles/navbar.css';

const Navbar = () => {
  const { currentUser, currentProfile, logout, userPreferences } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navbarRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New episode available",
      message: "Stranger Things S4E3 is now available",
      time: "10 minutes ago",
      read: false,
      type: "new_content"
    },
    {
      id: 2,
      title: "Watchlist update",
      message: "The Witcher added to your watchlist",
      time: "1 hour ago",
      read: true,
      type: "watchlist"
    },
    {
      id: 3,
      title: "Subscription reminder",
      message: "Your subscription renews in 3 days",
      time: "2 hours ago",
      read: true,
      type: "subscription"
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Navigation links
  const navLinks = [
    { id: 1, label: 'Home', path: '/' },
    { id: 2, label: 'TV Shows', path: '/tv' },
    { id: 3, label: 'Movies', path: '/movies' },
    { id: 4, label: 'New & Popular', path: '/latest' },
    { id: 5, label: 'My List', path: '/mylist' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNotificationClick = (notificationId) => {
    // Mark as read and handle notification click
    console.log('Notification clicked:', notificationId);
    setShowNotifications(false);
  };

  return (
    <>
      <nav 
        ref={navbarRef}
        className={`navbar ${isScrolled ? 'scrolled' : ''} ${showSearch ? 'search-active' : ''}`}
      >
        <div className="navbar-container">
          {/* Left Section - Logo and Navigation */}
          <div className="navbar-left">
            <a href="/" className="navbar-logo">
              <span className="logo-text">Weflix</span>
            </a>
            
            <div className="navbar-links">
              {navLinks.map(link => (
                <a 
                  key={link.id}
                  href={link.path} 
                  className="nav-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right Section - Search, Notifications, User Menu */}
          <div className="navbar-right">
            {/* Search Button and Bar */}
            <div className="search-container">
              <button 
                className="nav-button search-toggle"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '300px' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="search-bar-container"
                  >
                    <SearchBar onClose={() => setShowSearch(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="notifications-container" ref={notificationsRef}>
              <button 
                className="nav-button notifications-toggle"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="notifications-dropdown"
                  >
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      <span className="notifications-count">
                        {unreadCount} new
                      </span>
                    </div>
                    
                    <div className="notifications-list">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="notification-content">
                            <div className="notification-title">
                              {notification.title}
                            </div>
                            <div className="notification-message">
                              {notification.message}
                            </div>
                            <div className="notification-time">
                              {notification.time}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="notification-indicator"></div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="notifications-footer">
                      <a href="/notifications" className="view-all-link">
                        View all notifications
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="user-menu-toggle"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                aria-label="User menu"
              >
                {currentProfile?.avatar ? (
                  <img 
                    src={currentProfile.avatar} 
                    alt={currentProfile.name}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {currentProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="user-menu-dropdown"
                  >
                    {/* Current User Info */}
                    <div className="user-info">
                      {currentProfile?.avatar ? (
                        <img 
                          src={currentProfile.avatar} 
                          alt={currentProfile.name}
                          className="user-info-avatar"
                        />
                      ) : (
                        <div className="user-info-avatar-placeholder">
                          {currentProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="user-details">
                        <div className="user-name">{currentProfile?.name || 'User'}</div>
                        <div className="user-email">{currentUser?.email}</div>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Menu Items */}
                    <a href="/profile" className="dropdown-item">
                      <User size={18} />
                      <span>Manage Profiles</span>
                    </a>

                    <a href="/account" className="dropdown-item">
                      <Settings size={18} />
                      <span>Account Settings</span>
                    </a>

                    <a href="/help" className="dropdown-item">
                      <HelpCircle size={18} />
                      <span>Help Center</span>
                    </a>

                    <div className="dropdown-divider"></div>

                    {/* Logout */}
                    <button 
                      className="dropdown-item logout-button"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>

                    {/* App Version */}
                    <div className="app-version">
                      v1.0.0
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Mobile menu"
            >
              <div className={`hamburger ${showMobileMenu ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="mobile-menu"
            >
              <div className="mobile-menu-header">
                <div className="mobile-user-info">
                  {currentProfile?.avatar ? (
                    <img 
                      src={currentProfile.avatar} 
                      alt={currentProfile.name}
                      className="mobile-user-avatar"
                    />
                  ) : (
                    <div className="mobile-user-avatar-placeholder">
                      {currentProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="mobile-user-name">
                    {currentProfile?.name || 'User'}
                  </span>
                </div>
                <button 
                  className="mobile-menu-close"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ×
                </button>
              </div>

              <div className="mobile-menu-content">
                <div className="mobile-nav-links">
                  {navLinks.map(link => (
                    <a 
                      key={link.id}
                      href={link.path} 
                      className="mobile-nav-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="mobile-menu-divider"></div>

                <div className="mobile-menu-items">
                  <a href="/profile" className="mobile-menu-item">
                    <User size={20} />
                    <span>Manage Profiles</span>
                  </a>

                  <a href="/account" className="mobile-menu-item">
                    <Settings size={20} />
                    <span>Account Settings</span>
                  </a>

                  <a href="/help" className="mobile-menu-item">
                    <HelpCircle size={20} />
                    <span>Help Center</span>
                  </a>

                  <button 
                    className="mobile-menu-item logout-button"
                    onClick={handleLogout}
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay"
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;