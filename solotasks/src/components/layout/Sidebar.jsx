// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FaHome,
  FaTasks,
  FaTrophy,
  FaUser,
  FaDungeon,
  FaSignOutAlt,
  FaCog,
  FaChevronLeft,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { setUser } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { getLevelProgress } from "../../utils/levelSystem";
import toast from "react-hot-toast";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { level, xp, currentTitle, completedQuests, streak } = useSelector(
    (state) => state.userStats
  );
  const { user } = useSelector((state) => state.auth);
  const progress = getLevelProgress(xp, level);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const navItems = [
    {
      to: "/dashboard",
      icon: <FaHome />,
      label: "Dashboard",
    },
    {
      to: "/quest-chains",
      icon: <FaDungeon />,
      label: "Dungeon Runs",
    },
    {
      to: "/achievements",
      icon: <FaTrophy />,
      label: "Achievements",
    },
    {
      to: "/profile",
      icon: <FaUser />,
      label: "Profile",
    },
  ];

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-system-gray border-r border-system-purple-700 flex flex-col shadow-lg overflow-hidden"
    >
      <div className="p-4 border-b border-system-purple-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-system-purple-300">
            SoloTasks
          </h1>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-full text-gray-400 hover:text-white hover:bg-system-black transition-colors"
            aria-label="Close sidebar"
          >
            <FaChevronLeft />
          </button>
        </div>

        <Link to="/profile" className="block">
          <div className="bg-system-black rounded-lg p-3 border border-system-purple-700 hover:border-system-purple-500 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-system-purple-500 mr-3">
                <img
                  src={
                    user?.profileImageUrl ||
                    "https://via.placeholder.com/40?text=User"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white font-medium">
                  {user?.username || "Hunter"}
                </div>
                <div className="text-xs text-system-purple-300">
                  Level {level} • {currentTitle}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-system-purple-500 h-1.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-system-purple-700 text-white"
                      : "text-gray-300 hover:bg-system-black hover:text-system-purple-300"
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="px-4 mt-6">
          <div className="bg-system-black rounded-lg p-3 border border-system-purple-700">
            <h3 className="text-sm font-medium text-system-purple-300 mb-2">
              Hunter Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-system-gray bg-opacity-30 rounded p-2">
                <div className="text-white text-lg font-bold">
                  {completedQuests || 0}
                </div>
                <div className="text-gray-400 text-xs">Quests</div>
              </div>
              <div className="bg-system-gray bg-opacity-30 rounded p-2">
                <div className="text-white text-lg font-bold">
                  {streak || 0}
                </div>
                <div className="text-gray-400 text-xs">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-system-purple-700">
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-system-black text-red-400 hover:bg-red-900 hover:text-white transition-colors"
        >
          <FaSignOutAlt className="mr-2" />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
