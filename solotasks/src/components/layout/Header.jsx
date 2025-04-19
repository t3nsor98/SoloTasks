// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaBell,
  FaSearch,
  FaChevronDown,
  FaUser,
  FaDungeon,
  FaTrophy,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { getLevelProgress, getXpForNextLevel } from "../../utils/levelSystem";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { setUser } from "../../store/slices/authSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { level, xp } = useSelector((state) => state.userStats);
  const { user } = useSelector((state) => state.auth);
  const progress = getLevelProgress(xp, level);
  const xpNeeded = getXpForNextLevel(level);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menus when location changes
  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchTerm);
    // Reset search term
    setSearchTerm("");
  };

  // Sample notifications - in a real app, these would come from your state/backend
  const notifications = [
    {
      id: 1,
      title: "Quest Completed",
      message: "You gained 50 XP!",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      title: "New Achievement",
      message: "You unlocked 'First Quest'!",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 3,
      title: "Level Up!",
      message: "You are now level 5!",
      time: "2 days ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-system-gray border-b border-system-purple-700 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-system-black transition-colors mr-2"
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>

          <form onSubmit={handleSearch} className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search quests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-system-black border border-system-purple-700 text-white pl-10 pr-4 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 w-64"
            />
          </form>

          {/* Navigation Links - Visible on larger screens */}
          <div className="hidden lg:flex ml-6 space-x-4">
            <Link
              to="/dashboard"
              className={`px-3 py-1 rounded-md ${
                location.pathname === "/dashboard"
                  ? "bg-system-purple-700 text-white"
                  : "text-gray-300 hover:bg-system-black hover:text-system-purple-300"
              } transition-colors`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-1 rounded-md ${
                location.pathname === "/profile"
                  ? "bg-system-purple-700 text-white"
                  : "text-gray-300 hover:bg-system-black hover:text-system-purple-300"
              } transition-colors`}
            >
              Profile
            </Link>
            <Link
              to="/quest-chains"
              className={`px-3 py-1 rounded-md ${
                location.pathname === "/quest-chains"
                  ? "bg-system-purple-700 text-white"
                  : "text-gray-300 hover:bg-system-black hover:text-system-purple-300"
              } transition-colors`}
            >
              Dungeon Builder
            </Link>
            <Link
              to="/achievements"
              className={`px-3 py-1 rounded-md ${
                location.pathname === "/achievements"
                  ? "bg-system-purple-700 text-white"
                  : "text-gray-300 hover:bg-system-black hover:text-system-purple-300"
              } transition-colors`}
            >
              Achievements
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          <div className="hidden md:flex items-center mr-6">
            <div className="mr-3">
              <div className="text-xs text-gray-400 mb-1">
                Level {level} • {xp}/{xpNeeded} XP
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-system-purple-500 h-1.5 rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-system-black transition-colors relative mr-2"
              aria-label="Notifications"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block w-2 h-2 bg-system-purple-500 rounded-full"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-system-black border border-system-purple-700 rounded-md shadow-lg z-10"
                >
                  <div className="p-3 border-b border-system-purple-700">
                    <h3 className="text-white font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-800 hover:bg-system-gray cursor-pointer ${
                            !notification.read
                              ? "bg-system-purple-900 bg-opacity-20"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between">
                            <h4 className="text-system-purple-300 font-medium text-sm">
                              {notification.title}
                            </h4>
                            <span className="text-gray-500 text-xs">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mt-1">
                            {notification.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-system-purple-700">
                    <button className="w-full text-center text-sm text-system-purple-300 hover:text-system-purple-200 p-1">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center bg-system-black border border-system-purple-700 rounded-md px-3 py-1 text-white"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                <img
                  src={
                    user?.profileImageUrl ||
                    "https://via.placeholder.com/40?text=User"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mr-1 text-system-purple-300">
                {user?.username || "Hunter"}
              </span>
              <FaChevronDown className="text-xs text-gray-400" />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-system-black border border-system-purple-700 rounded-md shadow-lg z-10"
                >
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-system-gray hover:text-white"
                    >
                      <FaHome className="mr-2 text-system-purple-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-system-gray hover:text-white"
                    >
                      <FaUser className="mr-2 text-system-purple-400" />
                      Profile
                    </Link>
                    <Link
                      to="/quest-chains"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-system-gray hover:text-white"
                    >
                      <FaDungeon className="mr-2 text-system-purple-400" />
                      Dungeon Builder
                    </Link>
                    <Link
                      to="/achievements"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-system-gray hover:text-white"
                    >
                      <FaTrophy className="mr-2 text-system-purple-400" />
                      Achievements
                    </Link>
                    <div className="border-t border-gray-800 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-900 hover:text-red-300"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
