// src/components/layout/MainLayout.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";
import { setUser } from "../../store/slices/authSlice";
import { fetchUserStats } from "../../store/slices/userStatsSlice";
import { fetchQuests } from "../../store/slices/questsSlice";
import Header from "./Header";
import Sidebar from "./Sidebar";
import toast from "react-hot-toast";

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { showSidebar } = useSelector((state) => state.ui);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          dispatch(
            setUser({
              uid: user.uid,
              email: user.email,
            })
          );

          // Fetch user data and quests
          await Promise.all([
            dispatch(fetchUserStats(user.uid)).unwrap(),
            dispatch(fetchQuests(user.uid)).unwrap(),
          ]);
        } else {
          dispatch(setUser(null));
          navigate("/login");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load user data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-system-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-system-purple-500 mx-auto mb-4"></div>
          <p className="text-system-purple-300 text-lg">
            Loading the System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-system-black text-white font-system overflow-hidden">
      {/* Sidebar - conditionally rendered based on showSidebar state */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="z-20"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-system-black to-system-gray p-4">
          <div className="container mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Optional footer */}
        <footer className="bg-system-gray border-t border-system-purple-700 py-2 px-4 text-center text-xs text-gray-500">
          <p>
            SoloTasks © {new Date().getFullYear()} | Inspired by Solo Leveling
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
